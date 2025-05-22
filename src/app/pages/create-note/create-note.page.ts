import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
  LoadingController,
  ToastController,
  IonButtons,
  IonBackButton, IonIcon
} from '@ionic/angular/standalone';
import { NoteService, NoteResponse } from '../../services/note.service';
import { UserProfile, LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-note',
  templateUrl: './create-note.page.html',
  styleUrls: ['./create-note.page.scss'],
  standalone: true,
  imports: [IonIcon,
    CommonModule,
    FormsModule,
    IonContent,
    IonInput,
    IonItem,
    IonTextarea,
    IonButton,
  ]
})
export class CreateNotePage {
  noteTitle = '';
  noteContent = '';
  userId: number | undefined;

  constructor(
    private noteService: NoteService,
    private userService: LoginService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userId = profile.id;
        console.log(this.userId)
      },
      error: err => {
        console.error('No se pudo cargar perfil:', err);
        this.router.navigateByUrl('/login');
      }
    });
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({ message, color, duration: 2000 });
    await toast.present();
  }

  async saveNote() {
    if (!this.noteTitle.trim() || !this.noteContent.trim()) {
      await this.showToast('Completa todos los campos', 'warning');
      return;
    }

    console.log(this.userId)

    if (!this.userId) {
      await this.showToast('Usuario no identificado', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando nota...' });
    await loading.present();

    try {
      const resp: NoteResponse & { id?: number } =
        await firstValueFrom(
          this.noteService.createNote(
            this.noteTitle,
            this.noteContent,
            this.userId
          )
        );

      if (resp.status === 201) {
        await this.showToast('Nota creada exitosamente 🎉', 'success');
        this.router.navigateByUrl('/home', { replaceUrl: true }).then(() => {
          location.reload(); 
        });
      } else {
        await this.showToast(resp.message || 'Error al crear nota', 'danger');
      }
    } catch (error) {
      console.error('Error al crear nota:', error);
      await this.showToast('No se pudo conectar al servidor', 'danger');
    } finally {
      await loading.dismiss();
    }
  }
}

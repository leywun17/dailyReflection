import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfile, LoginService } from '../services/login.service';
import { NoteService } from '../services/note.service';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonRow,
  IonCol,
  IonGrid,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonChip, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonIcon,
    IonCol,
    IonRow,
    CommonModule,
    IonLabel,
    IonCard,
    IonCardContent,
    IonAvatar,
    IonChip,

  ]
})
export class HomePage implements OnInit {
  daysOfWeek: { date: number; weekday: string; fullDate: Date; isActive: boolean }[] = [];
  userName = '';
  isFabOpen = false;
  userId: number | undefined;
  notes: any[] = [];
  currentDate: Date = new Date();

  constructor(
    private userService: LoginService,
    private noteService: NoteService,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit(): void {
    this.generateCurrentWeek();
    this.userService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userName = profile.name;
        this.userId = profile.id;
        console.log(this.userId)
        this.getNotes();
      },
      error: err => {
        console.error('No se pudo cargar perfil:', err);
        this.presentToast('No autorizado, por favor inicia sesión');
        this.router.navigateByUrl('/login');
      }
    });
  }

  private generateCurrentWeek() {
    const today = new Date();
    const start = new Date(today);
    const offset = today.getDay() === 0 ? -6 : 1 - today.getDay();
    start.setDate(today.getDate() + offset);
    const names = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

    this.daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        date: d.getDate(),
        weekday: names[i],
        fullDate: d,
        isActive: d.toDateString() === this.currentDate.toDateString()
      };
    });
  }

  selectDay(day: { date: number; weekday: string; fullDate: Date; isActive: boolean }) {
    this.daysOfWeek.forEach(d => d.isActive = false);
    day.isActive = true;
  }

  private getNotes() {
    if (!this.userId) {
      console.warn('El userId no está definido');
      return;
    }
    this.noteService.getNotes(this.userId).subscribe({
      next: notesArray => {
        this.notes = notesArray;
      },
      error: err => {
        this.presentToast(err.message);
      }
    });
  }

  createNote(title: string, content: string) {
    console.log(this.userId)
    if (!title || !content || !this.userId) {
      this.presentToast('Completa todos los campos');
      return;
    }
    this.noteService.createNote(title, content, this.userId).subscribe({
      next: () => {
        this.presentToast('Nota creada');
        this.getNotes();
      },
      error: () => this.presentToast('Error al crear la nota')
    });
  }

  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }

  action(option: string) {
    console.log('Acción seleccionada:', option);
    this.isFabOpen = false;
  }

  goToCreateNote() {
    this.router.navigateByUrl('/create-note');
  }

  goToUser() {
    this.router.navigateByUrl('/user-profile');
  }
  openNote(noteId: number): void {
    if (!noteId) {
      console.warn('noteId inválido');
      return;
    }
    this.router.navigate(['/note', noteId]);
  }

  logout(): void {
    this.userService.logout();
    this.router.navigateByUrl('/login');
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000, position: 'top' });
    await toast.present();
  }
}

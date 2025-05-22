import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonItem, IonInput,
  IonTextarea, IonLabel, IonFooter, IonButtons,
  ToastController, AlertController, ActionSheetController, IonPopover, IonList } from '@ionic/angular/standalone';
import { NoteService, NoteContent } from '../../services/note.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.page.html',
  styleUrls: ['./note.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterModule,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
  ]
})
export class NotePage implements OnInit {
  noteId!: number;
  note?: NoteContent;
  isLoading = true;
  errorMsg?: string;
  isEditing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noteService: NoteService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null;

    if (!id) {
      this.errorMsg = 'ID de nota inválido';
      this.isLoading = false;
      return;
    }

    this.noteId = id;
    this.loadNote();
  }
  goToHome(){
    this.router.navigateByUrl('/home');
  }

  private loadNote() {
    this.noteService.getNoteById(this.noteId).subscribe({
      next: (res: NoteContent) => {
        this.note = { title: res.title, content: res.content };
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err.message || 'Error al cargar la nota';
        this.isLoading = false;
      }
    });
  }

  /** Menú de tres puntos */
  async openMenu() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar',
          icon: 'create-outline',
          handler: () => this.isEditing = true
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => this.presentDeleteConfirm()
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });
    await sheet.present();
  }

  updateNote() {
    if (!this.note) return;
    this.noteService.updateNoteById({ ...this.note, noteId: this.noteId }).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.isEditing = false;
          this.showToast('Nota actualizada con éxito');
        } else {
          this.showToast('Error: ' + res.message, 'danger');
        }
      },
      error: () => this.showToast('Error al actualizar la nota', 'danger')
    });
  }

  saveNote() {
    this.isEditing ? this.updateNote() : this.showToast('Nada que guardar', 'warning');
  }

  private confirmDelete() {
    this.noteService.deleteNoteById(this.noteId).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.showToast('Nota eliminada');
          this.router.navigate(['/home']);
        } else {
          this.showToast('Error: ' + res.message, 'danger');
        }
      },
      error: () => this.showToast('Error al eliminar la nota', 'danger')
    });
  }

  async presentDeleteConfirm() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta nota?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.confirmDelete() }
      ]
    });
    await alert.present();
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message, duration: 2000, color, position: 'top'
    });
    await toast.present();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// 📦 Servicios personalizados
import { LoginService, UserProfile } from '../services/login.service';
import { NoteService, NoteSummary } from '../services/note.service';
import { EmotionService } from '../services/emotion.service';

// 📦 Ionic Components
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonFab, IonFabButton,
  IonIcon, IonLabel, IonRow, IonCol, IonGrid, IonCard, IonCardContent,
  IonAvatar, IonChip, IonButton, IonCardTitle, IonCardHeader, IonInfiniteScrollContent, IonInfiniteScroll
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

// 📦 Angular Router
import { Router } from '@angular/router';

// 📊 Chart.js y directiva de ng2-charts
import { BaseChartDirective } from 'ng2-charts';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartData, ChartOptions, ChartType } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonInfiniteScrollContent,
    CommonModule, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonCol, IonRow,
    IonLabel, IonCard, IonCardContent, IonAvatar, IonChip, IonCardHeader,
    IonButton, IonCardTitle, BaseChartDirective, IonInfiniteScroll
  ]
})
export class HomePage implements OnInit {

  // 🧭 Datos de navegación y usuario
  userName = '';
  userId: number | undefined;
  isFabOpen = false;
  currentDate: Date = new Date();

  // 📆 Días de la semana
  daysOfWeek: { date: number; weekday: string; fullDate: Date; isActive: boolean }[] = [];

  // 📝 Notas
  allNotes: NoteSummary[] = [];
  notes: NoteSummary[] = [];
  page = 1;
  limit = 6;
  hasMoreNotes = true;

  // 😊 Emociones
  selectedEmotion = '';
  comment = '';
  emotions = [
    { name: 'Feliz', emoji: '😊', color: 'success' },
    { name: 'Triste', emoji: '😢', color: 'primary' },
    { name: 'Enojado', emoji: '😠', color: 'danger' },
    { name: 'Ansioso', emoji: '😰', color: 'warning' },
    { name: 'Motivado', emoji: '🔥', color: 'tertiary' },
    { name: 'Cansado', emoji: '😴', color: 'medium' }
  ];


  // 📊 Datos para el gráfico - TIPO CORRECTO
  barChartType: 'bar' = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    datasets: [
      { data: [3, 2, 5, 4, 1, 0, 2], label: 'Feliz', backgroundColor: '#FFD700' },
      { data: [0, 1, 0, 1, 0, 1, 0], label: 'Triste', backgroundColor: '#1E3A8A' },
      { data: [1, 0, 0, 2, 0, 0, 1], label: 'Enojado', backgroundColor: '#DC2626' },
      { data: [0, 0, 1, 0, 2, 1, 0], label: 'Ansioso', backgroundColor: '#EA580C' },
      { data: [2, 2, 1, 1, 3, 1, 2], label: 'Motivado', backgroundColor: '#22C55E' },
      { data: [0, 1, 1, 0, 0, 0, 0], label: 'Cansado', backgroundColor: '#64748B' }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: false,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          stepSize: .5
        }
      }
    }
  };

  public barChartPlugins = [Legend, Tooltip];

  // Nuevo flag para controlar si se puede guardar emoción
  canSaveEmotion: boolean = true;

  constructor(
    private userService: LoginService,
    private noteService: NoteService,
    private emotionService: EmotionService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.generateCurrentWeek();

    this.userService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userName = profile.name;
        this.userId = profile.id;
        this.getNotes();
        this.loadEmotionsForWeek();
        this.checkIfCanSaveEmotion();  // <-- chequear aquí
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

  selectDay(day: any) {
    this.daysOfWeek.forEach(d => d.isActive = false);
    day.isActive = true;
  }

  getNotes() {
    if (!this.userId) return;
    this.noteService.getNotes(this.userId).subscribe({
      next: (data) => {
        this.allNotes = data;
        this.page = 1;
        this.notes = this.allNotes.slice(0, this.limit);
        this.hasMoreNotes = this.allNotes.length > this.limit;
      },
      error: () => this.presentToast('Error al obtener las notas')
    });
  }


  loadMore(event: any) {
    this.page++;
    const start = (this.page - 1) * this.limit;
    const end = this.page * this.limit;
    const newNotes = this.allNotes.slice(start, end);

    this.notes = [...this.notes, ...newNotes];
    event.target.complete();
    console.log('Notas cargadas:', this.allNotes);
    if (end >= this.allNotes.length) {
      this.hasMoreNotes = false;
      event.target.disabled = true;
    }
  }

  createNote(title: string, content: string) {
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

  openNote(noteId: number) {
    if (!noteId) return;
    this.router.navigate(['/note', noteId]);
  }

  selectEmotion(name: string) {
    this.selectedEmotion = name;
  }

  async saveEmotion() {
    if (!this.selectedEmotion) {
      const toast = await this.toastController.create({
        message: 'Por favor selecciona una emoción',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    if (!this.userId) {
      this.presentToast('Usuario no identificado, inicia sesión de nuevo');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const entry = { date: today, emotion: this.selectedEmotion };

    this.emotionService.saveEmotion(this.userId, entry).subscribe({
      next: async () => {
        localStorage.setItem('lastEmotionSaveDate', today);

        const toast = await this.toastController.create({
          message: 'Emoción guardada con éxito',
          duration: 2000,
          color: 'success'
        });
        toast.present();

        this.selectedEmotion = '';
        this.loadEmotionsForWeek();
        this.checkIfCanSaveEmotion();  // Actualiza el flag para deshabilitar el botón
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Error al guardar la emoción',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  loadEmotionsForWeek() {
    if (!this.userId) return;

    const startOfWeek = this.daysOfWeek[0].fullDate.toISOString().split('T')[0];
    const endOfWeek = this.daysOfWeek[6].fullDate.toISOString().split('T')[0];

    this.emotionService.getEmotions(this.userId, startOfWeek, endOfWeek).subscribe({
      next: (data: any[]) => {
        const emotionMap: Record<string, number[]> = {
          'Feliz': Array(7).fill(0),
          'Triste': Array(7).fill(0),
          'Enojado': Array(7).fill(0),
          'Ansioso': Array(7).fill(0),
          'Motivado': Array(7).fill(0),
          'Cansado': Array(7).fill(0),
        };

        data.forEach(item => {
          const index = this.daysOfWeek.findIndex(d => d.fullDate.toISOString().split('T')[0] === item.date);
          if (index !== -1 && emotionMap[item.emotion]) {
            emotionMap[item.emotion][index]++;
          }
        });

        this.barChartData.datasets.forEach(dataset => {
          dataset.data = emotionMap[dataset.label!] || [];
        });
      },
      error: err => {
        console.error('Error cargando emociones:', err);
      }
    });
  }

  checkIfCanSaveEmotion() {
    const lastSave = localStorage.getItem('lastEmotionSaveDate');
    const today = new Date().toISOString().split('T')[0];
    this.canSaveEmotion = lastSave !== today;
  }

  async presentToast(message: string, duration = 2000, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration,
      color
    });
    toast.present();
  }

  goToUser() {
    this.router.navigateByUrl('/user-profile');
  }

  goToCreateNote() {
    this.router.navigateByUrl('/create-note');
  }

}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';      
import { Router } from '@angular/router';
import {
  LoadingController,
  AlertController,
  ToastController,
  NavController
} from '@ionic/angular';
import { RegisterService, RegisterResponse } from '../../services/register.service';
import { IonContent, IonProgressBar, IonImg, IonList, IonItem, IonLabel, IonInput, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports:[
    IonContent,
    IonProgressBar,
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    CommonModule, 
    FormsModule
  ]
})
export class RegisterPage {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;

  constructor(
    private registerService: RegisterService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private navCtrl: NavController
    
  ) {}

  goToLogin(): void {
    this.navCtrl.navigateBack('/login');
  }
  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }


  async register(): Promise<void> {
    if (!this.email || !this.password || !this.fullName || !this.confirmPassword ) {
      this.presentToast('Por favor completa todos los campos', 'warning');
      return;
    }
    // Validar contraseñas
    if (this.password !== this.confirmPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    // Llamada al servicio
    this.registerService.register({
      name: this.fullName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: async (resp: RegisterResponse) => {
        await loading.dismiss();
        this.isLoading = false;

        switch (resp.status) {
          case 201: {
            // Éxito: toast y redirección
            const toast = await this.toastCtrl.create({
              message: 'Registro exitoso 👌',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
            this.router.navigateByUrl('/login');
            break;
          }
          case 409: {
            // Conflicto: correo ya registrado
            const toast = await this.toastCtrl.create({
              message: 'El correo ya está registrado.',
              duration: 3000,
              color: 'warning',
              position: 'top'
            });
            await toast.present();
            break;
          }
          case 400: {
            // Petición mal formada
            const alert = await this.alertCtrl.create({
              header: 'Datos incompletos',
              message: resp.message,
              buttons: ['OK']
            });
            await alert.present();
            break;
          }
          default: {
            // Otros errores del servidor
            const alert = await this.alertCtrl.create({
              header: 'Error',
              message: resp.message || 'Ha ocurrido un error inesperado.',
              buttons: ['OK']
            });
            await alert.present();
            break;
          }
        }
      },
      error: async err => {
        // Error de red o inesperado
        await loading.dismiss();
        this.isLoading = false;
        const alert = await this.alertCtrl.create({
          header: 'Registro fallido',
          message: err.message || 'No fue posible conectar con el servidor.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}

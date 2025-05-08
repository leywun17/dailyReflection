// File: src/app/login/login.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { LoginService, LoginResponse, UserProfile } from '../../services/login.service';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonProgressBar,
  IonImg
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonProgressBar,
    IonImg,
    CommonModule,
    FormsModule
  ]
})
export class LoginPage {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private loginService: LoginService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router,
    private navctrl: NavController
  ) {}

  goToRegister(): void {
    this.navctrl.navigateForward('/register');
  }

  private async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      return this.presentToast('Por favor completa todos los campos', 'warning');
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    this.loginService.login(this.email, this.password).subscribe({
      next: async (resp: LoginResponse) => {
        await loading.dismiss();
        this.isLoading = false;

        if (resp.user) {
          // Guardar perfil en localStorage
          this.loginService.storeUser(resp.user);
          await this.presentToast('Login exitoso 👌', 'success');
          this.router.navigateByUrl('/home');
        } else {
          await this.showAlert('Error', resp.message || 'Ocurrió un error al iniciar sesión');
        }
      },
      error: async err => {
        await loading.dismiss();
        this.isLoading = false;
        await this.showAlert('Login fallido', err.message || 'No fue posible conectar con el servidor');
      }
    });
  }
}

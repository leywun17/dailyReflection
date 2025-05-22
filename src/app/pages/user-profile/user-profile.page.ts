import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfile, LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonButton, IonBackButton, IonIcon, IonInput, IonItem, IonButtons, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, saveOutline, closeOutline, logOutOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonButton, IonLabel, IonContent, CommonModule, FormsModule, IonIcon, IonInput, IonItem]
})
export class UserProfilePage implements OnInit {
  userName = '';
  userEmail = '';
  userId: number | undefined;
  isEditMode = false;
  
  // Create a temporary copy for editing
  editableProfile = {
    name: '',
    email: ''
  };

  constructor(private userService: LoginService, private router: Router) {
    // Register Ionic icons
      addIcons({arrowBackOutline,createOutline,logOutOutline,saveOutline,closeOutline});
  }

  ngOnInit() {
    this.loadUserProfile();
  }
  goToHome(){
    this.router.navigateByUrl('/home');
  }

  loadUserProfile() {
    this.userService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userName = profile.name;
        this.userEmail = profile.email;
        this.userId = profile.id;
        
        this.editableProfile.name = profile.name;
        this.editableProfile.email = profile.email;
        
      },
      error: err => {
        console.error('No se pudo cargar perfil:', err);
        this.router.navigateByUrl('/login');
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    
    // Reset editable profile to current values when entering edit mode
    if (this.isEditMode) {
      this.editableProfile.name = this.userName;
      this.editableProfile.email = this.userEmail;
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // No need to reset as we're discarding the changes
  }

  saveProfile(): void {
    if (!this.editableProfile.name || !this.editableProfile.email) {
      // Basic validation
      return;
    }
    
    const updatedProfile: UserProfile = {
      id: this.userId!,
      name: this.editableProfile.name,
      email: this.editableProfile.email,
      createdAt: this.editableProfile.name,
    };
    
    this.userService.updateProfile(updatedProfile).subscribe({
      next: (response) => {
        // Update the displayed profile
        this.userName = this.editableProfile.name;
        this.userEmail = this.editableProfile.email;
        this.isEditMode = false;
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
        // You might want to show a toast/alert here
      }
    });
  }

  logout(): void {
    this.userService.logout();
    this.router.navigateByUrl('/login');
  }
}
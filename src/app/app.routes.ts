import { Routes } from '@angular/router';
import { AuthGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'create-note',
    loadComponent: () => import('./pages/create-note/create-note.page').then(m => m.CreateNotePage), 
    canActivate: [AuthGuard]
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./pages/user-profile/user-profile.page').then(m => m.UserProfilePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'note/:id',
    loadComponent: () => import('./pages/note/note.page').then(m => m.NotePage),
    canActivate: [AuthGuard]
  }
];

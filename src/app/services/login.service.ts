import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  user: UserProfile;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // Ruta fija al backend sin usar environments
  private endpoint = 'http://localhost/backend/plataformas/login.php';
  private updateEndpoint = 'http://localhost/backend/plataformas/update_profile.php';
  private storageKey = 'currentUser';

  constructor(private http: HttpClient) { }

  /**
   * Autentica al usuario (POST), almacena en localStorage y devuelve datos.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.endpoint, { email, password })
      .pipe(
        catchError((err: HttpErrorResponse) => throwError(() => err)),
      );
  }

  /**
   * Recupera el perfil de localStorage o del servidor si no existe.
   */
  getProfile(): Observable<UserProfile> {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const user: UserProfile = JSON.parse(stored);
      return of(user);
    }
    const userId = this.getCurrentUser()?.id;
    if (!userId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    const params = new HttpParams().set('id', userId.toString());
    return this.http.get<UserProfile>(this.endpoint, { params })
      .pipe(
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  /**
   * Actualiza el perfil del usuario y actualiza el localStorage.
   */
  updateProfile(profile: UserProfile): Observable<UpdateProfileResponse> {
    return this.http.post<UpdateProfileResponse>(this.updateEndpoint, profile)
      .pipe(
        tap(response => {
          // Si la actualización fue exitosa y devolvió datos de usuario actualizados
          if (response.success && response.user) {
            // Actualizar en localStorage
            this.storeUser(response.user);
          }
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('Error al actualizar perfil:', err);
          return throwError(() => err);
        })
      );
  }

  /**
   * Obtiene usuario sincrónicamente de localStorage.
   */
  getCurrentUser(): UserProfile | null {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  storeUser(user: UserProfile): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }
}
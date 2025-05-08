import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  status: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  // Ajusta esta URL al endpoint de tu servidor
  private apiUrl = 'http://localhost/backend/plataformas/register.php';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<any>(this.apiUrl, data, { observe: 'response' })
      .pipe(
        map((resp: HttpResponse<any>) => ({
          status: resp.status,
          message: resp.body?.message
        })),
        catchError((err: HttpErrorResponse) => {
          // En caso de error de red o servidor
          return throwError(() => err);
        })
      );
  }
}

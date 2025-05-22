import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface NoteResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

export interface NoteSummary {
  id: number;
  title: string;
  content: string;
  created_at?: string;
}

export interface NoteContent {
  title: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private createNoteUrl = 'http://localhost/backend/plataformas/createNote.php';
  private Notes = 'http://localhost/backend/plataformas/getNotes.php';
  // Si tienes un endpoint separado para detalle, cámbialo aquí:

  constructor(private http: HttpClient) { }

  createNote(title: string, content: string, userId: number): Observable<NoteResponse> {
    const payload = { title, content, userId };
    return this.http.post<NoteResponse>(this.createNoteUrl, payload);
  }

  /** Listado de todas las notas de un usuario */
  getNotes(userId: number): Observable<NoteSummary[]> {
  const params = new HttpParams().set('id', userId.toString());
  return this.http.get<NoteResponse<NoteSummary[]>>(this.Notes, { params })
    .pipe(
      map(res => {
        if (res.status === 200 && res.data) {
          return res.data;
        }
        throw new Error(res.message);
      }),
    );
}

  /** Detalle de una nota: usa PARAM 'noteId' para que el backend devuelva sólo título y contenido */
  getNoteById(noteId: number): Observable<NoteContent> {
    const params = new HttpParams().set('noteId', noteId.toString());
    return this.http.get<NoteResponse<NoteContent>>(this.Notes, { params })
      .pipe(
        map(res => {
          if (res.status === 200 && res.data) {
            return res.data;
          }
          throw new Error(res.message || 'No se pudo obtener la nota');
        })
      );
  }

  updateNoteById(note: NoteContent & { noteId: number }): Observable<any> {
    return this.http.put(this.Notes, note);
  }

  deleteNoteById(noteId: number): Observable<any> {
    return this.http.request('delete', this.Notes, {
      body: { noteId }
    });
  }
}

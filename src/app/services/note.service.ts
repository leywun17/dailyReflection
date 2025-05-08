import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface NoteResponse {
  status: number;
  message: string;
  data?: any[];
}

export interface NoteContent{
  title: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private createNoteUrl = 'http://localhost/backend/plataformas/createNote.php';
  private getNotesUrl   = 'http://localhost/backend/plataformas/getNotes.php';

  constructor(private http: HttpClient) {}


  createNote(title: string, content: string, userId: number): Observable<NoteResponse> {
    const payload = { title, content, userId };
    console.log(payload)
    return this.http.post<NoteResponse>(this.createNoteUrl, payload)
      .pipe(
        map(res => res),
      );
  }

  getNotes(userId: number): Observable<any[]> {
    const params = new HttpParams().set('id', userId.toString());
    return this.http.get<NoteResponse>(this.getNotesUrl, { params })
      .pipe(
        map(res => {
          if (res.status === 200 && res.data) {
            return res.data;
          }
          throw new Error(res.message);
        }),
      );
  }
  
  getNoteById(noteId: number): Observable<any> {
    const params = new HttpParams().set('id', noteId.toString());
    console.log(params)
    return this.http.get<NoteResponse>(this.getNotesUrl, { params })
      .pipe(
        map(res => {
          if (res.status === 200 && res.data && res.data.length > 0) {
            return res.data[0];
          }
          throw new Error(res.message || 'No se pudo obtener la nota');
        })
      );
  }
  
  updateNote(noteId: number, title: string, content: string): Observable<NoteResponse> {
    const payload = { id: noteId, title, content };
    return this.http.post<NoteResponse>(this.getNotesUrl, payload)
      .pipe(
        map(res => {
          if (res.status === 200) {
            return res;
          }
          throw new Error(res.message || 'Error al actualizar la nota');
        })
      );
  }
  
  deleteNote(noteId: number): Observable<NoteResponse> {
    const payload = { id: noteId };
    return this.http.post<NoteResponse>(this.getNotesUrl, payload)
      .pipe(
        map(res => {
          if (res.status === 200) {
            return res;
          }
          throw new Error(res.message || 'Error al eliminar la nota');
        })
      );
  }
}
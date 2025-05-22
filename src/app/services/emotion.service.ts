import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmotionEntry {
  date: string;       // e.g. '2025-05-21'
  emotion: string;    // e.g. 'Feliz'
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmotionService {
  private apiUrl = 'http://localhost/backend/plataformas/emotions.php';

  constructor(private http: HttpClient) {}

  saveEmotion(userId: number, entry: EmotionEntry): Observable<any> {
    const body = { userId, ...entry };
    return this.http.post(this.apiUrl, body);
  }

  getEmotions(userId: number, startDate: string, endDate: string): Observable<EmotionEntry[]> {
    return this.http.get<EmotionEntry[]>(`${this.apiUrl}?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
  }
}

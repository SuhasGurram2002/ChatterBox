import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = 'http://localhost:8080/api/posts';
  
  constructor(private http: HttpClient) {}
  
  createComment(postId: number, content: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${postId}/comments`, { content }, { withCredentials: true });
  }
  
  getComments(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${postId}/comments`, { withCredentials: true });
  }
}
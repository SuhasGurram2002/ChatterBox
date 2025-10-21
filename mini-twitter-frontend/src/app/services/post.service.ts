import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl = 'http://localhost:8080/api/posts';
  
  constructor(private http: HttpClient) {}
  
  createPost(content: string, hashtags: string[] = []): Observable<any> {
    return this.http.post(this.baseUrl, { content, hashtags }, { withCredentials: true });
  }
  
  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, { withCredentials: true });
  }
  
  toggleLike(postId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${postId}/likes`, {}, { withCredentials: true });
  }
}
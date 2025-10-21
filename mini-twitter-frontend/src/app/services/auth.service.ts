import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  get currentUser(): string | null {
    return this.currentUserSubject.value;
  }
  
  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
  
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          this.currentUserSubject.next(response.user);
        })
      );
  }
  
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData)
      .pipe(
        tap((response: any) => {
          // After registration, automatically login
          this.login(userData.username, userData.password).subscribe();
        })
      );
  }
  
  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
        })
      );
  }
  
  checkAuthStatus(): void {
    this.http.get(`${this.baseUrl}/current`, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.currentUserSubject.next(response.user);
        },
        error: () => {
          this.currentUserSubject.next(null);
        }
      });
  }
}
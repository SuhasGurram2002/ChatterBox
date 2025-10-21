import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <nav class="navbar" *ngIf="authService.isLoggedIn">
        <div class="nav-content">
          <h1>Mini Twitter</h1>
          <div class="nav-user">
            <span>Welcome, {{authService.currentUser}}!</span>
            <button (click)="logout()" class="btn btn-outline">Logout</button>
          </div>
        </div>
      </nav>
      
      <div class="main-content">
        <app-auth *ngIf="!authService.isLoggedIn"></app-auth>
        <app-timeline *ngIf="authService.isLoggedIn"></app-timeline>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    
    .navbar {
      background: white;
      border-bottom: 1px solid #e1e8ed;
      padding: 1rem 0;
    }
    
    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }
    
    .nav-content h1 {
      color: #1da1f2;
      margin: 0;
      font-size: 1.8rem;
    }
    
    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .nav-user span {
      color: #657786;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    
    .btn-outline {
      background: transparent;
      color: #1da1f2;
      border: 1px solid #1da1f2;
    }
    
    .btn-outline:hover {
      background: #1da1f2;
      color: white;
    }
    
    .main-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
  `]
})
export class AppComponent implements OnInit {
  
  constructor(public authService: AuthService) {}
  
  ngOnInit() {
    this.authService.checkAuthStatus();
  }
  
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Successfully logged out - page will automatically show login
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if there's an error, clear the local state
      }
    });
  }
}
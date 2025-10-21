import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group" *ngIf="!isLogin">
            <input 
              type="text" 
              [(ngModel)]="form.fullName" 
              name="fullName"
              placeholder="Full Name"
              class="form-input"
              required>
          </div>
          
          <div class="form-group" *ngIf="!isLogin">
            <input 
              type="email" 
              [(ngModel)]="form.email" 
              name="email"
              placeholder="Email"
              class="form-input"
              required>
          </div>
          
          <div class="form-group">
            <input 
              type="text" 
              [(ngModel)]="form.username" 
              name="username"
              placeholder="Username"
              class="form-input"
              required>
          </div>
          
          <div class="form-group">
            <input 
              type="password" 
              [(ngModel)]="form.password" 
              name="password"
              placeholder="Password"
              class="form-input"
              required>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Loading...' : (isLogin ? 'Login' : 'Register') }}
            </button>
            <button type="button" (click)="toggleMode()" class="btn btn-link">
              {{ isLogin ? 'Need an account? Register' : 'Already have an account? Login' }}
            </button>
          </div>
        </form>
        
        <div class="error-message" *ngIf="error">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }
    
    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    
    .auth-card h2 {
      text-align: center;
      color: #1da1f2;
      margin-bottom: 2rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #e1e8ed;
      border-radius: 5px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    
    .form-input:focus {
      outline: none;
      border-color: #1da1f2;
    }
    
    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .btn {
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #1da1f2;
      color: white;
    }
    
    .btn-primary:hover {
      background: #1991db;
    }
    
    .btn-primary:disabled {
      background: #aab8c2;
      cursor: not-allowed;
    }
    
    .btn-link {
      background: transparent;
      color: #1da1f2;
      text-decoration: underline;
    }
    
    .error-message {
      color: #e0245e;
      text-align: center;
      margin-top: 1rem;
      padding: 0.5rem;
      background: #ffebee;
      border-radius: 5px;
    }
  `]
})
export class AuthComponent {
  isLogin = true;
  loading = false;
  error = '';
  
  form = {
    username: '',
    password: '',
    email: '',
    fullName: ''
  };
  
  constructor(private authService: AuthService) {}
  
  toggleMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
    this.form = { username: '', password: '', email: '', fullName: '' };
  }
  
  onSubmit() {
    this.loading = true;
    this.error = '';
    
    const request$ = this.isLogin 
      ? this.authService.login(this.form.username, this.form.password)
      : this.authService.register(this.form);
    
    request$.subscribe({
      next: (response) => {
        this.loading = false;
        // AuthService handles the login state
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.error || 'An error occurred';
      }
    });
  }
}

import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { NotificationsService } from '../../../services/notifications';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <h2>Вход</h2>
      <form (ngSubmit)="onSubmit()" #loginForm="ngForm" novalidate>
        <!-- Email поле -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            [(ngModel)]="email"
            #emailField="ngModel"
            required
            email
            placeholder="example@domain.com"
          />
          <div class="field-hint">Введите ваш email</div>
          @if (emailField.invalid && (emailField.dirty || emailField.touched)) {
            <div class="field-error">
              @if (emailField.errors?.['required']) {
                <span>Email обязателен</span>
              }
              @if (emailField.errors?.['email']) {
                <span>Введите корректный email</span>
              }
            </div>
          }
        </div>

        <!-- Пароль -->
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            [(ngModel)]="password"
            #passwordField="ngModel"
            required
            minlength="6"
            placeholder="******"
          />
          <div class="field-hint">Минимум 6 символов</div>
          @if (passwordField.invalid && (passwordField.dirty || passwordField.touched)) {
            <div class="field-error">
              @if (passwordField.errors?.['required']) {
                <span>Пароль обязателен</span>
              }
              @if (passwordField.errors?.['minlength']) {
                <span>Пароль должен содержать не менее 6 символов</span>
              }
            </div>
          }
        </div>

        <button type="submit" [disabled]="loginForm.invalid || isLoading">
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>

        <!-- Глобальная ошибка от сервера -->
        @if (errorMessage) {
          <div class="error-message">{{ errorMessage }}</div>
        }
      </form>
      <p class="register-link">Нет аккаунта? <a routerLink="/register">Зарегистрироваться</a></p>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h2 {
        text-align: center;
        margin-bottom: 20px;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      input {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      input.ng-invalid.ng-touched {
        border-color: #e74c3c;
      }
      .field-hint {
        font-size: 12px;
        color: #6c757d;
        margin-top: 4px;
      }
      .field-error {
        font-size: 12px;
        color: #e74c3c;
        margin-top: 4px;
      }
      button {
        width: 100%;
        padding: 10px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }
      button:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }
      .error-message {
        background: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 4px;
        margin-top: 15px;
        text-align: center;
        border: 1px solid #f5c6cb;
      }
      .register-link {
        text-align: center;
        margin-top: 15px;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  notificationService = inject(NotificationsService);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .login(this.email, this.password)
      .pipe(
        tap(() => {
          // Успешный вход
          this.notificationService.connect();
          this.router.navigate(['/home/']);
        }),
        catchError((err) => {
          let errorText = 'Ошибка входа. Попробуйте позже.';
          if (err.error?.detail) {
            errorText = err.error.detail;
          } else if (err.error?.non_field_errors) {
            errorText = err.error.non_field_errors.join(', ');
          } else if (err.status === 401) {
            errorText = 'Неверный email или пароль';
          } else if (err.status === 400 && err.error?.email) {
            errorText = `Email: ${err.error.email.join(', ')}`;
          } else if (err.status === 400 && err.error?.password) {
            errorText = `Пароль: ${err.error.password.join(', ')}`;
          }
          this.errorMessage = errorText;
          return throwError(() => err);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }
}

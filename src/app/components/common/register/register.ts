import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, finalize, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <h2>Регистрация</h2>
      <form (ngSubmit)="onSubmit()" #regForm="ngForm" novalidate>
        <!-- Имя пользователя -->
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input
            type="text"
            id="username"
            name="username"
            [(ngModel)]="username"
            #usernameField="ngModel"
            required
            minlength="3"
            placeholder="от 3 символов"
          />
          <div class="field-hint">Только буквы, цифры, подчеркивания</div>
          @if (usernameField.invalid && (usernameField.dirty || usernameField.touched)) {
            <div class="field-error">
              @if (usernameField.errors?.['required']) {
                <span>Имя пользователя обязательно</span>
              }
              @if (usernameField.errors?.['minlength']) {
                <span>Не менее 3 символов</span>
              }
            </div>
          }
        </div>

        <!-- Email -->
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
          <div class="field-hint">Введите действующий email</div>
          @if (emailField.invalid && (emailField.dirty || emailField.touched)) {
            <div class="field-error">
              @if (emailField.errors?.['required']) {
                <span>Email обязателен</span>
              }
              @if (emailField.errors?.['email']) {
                <span>Некорректный формат email</span>
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
                <span>Не менее 6 символов</span>
              }
            </div>
          }
        </div>

        <button type="submit" [disabled]="regForm.invalid || isLoading">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>

        @if (errorMessage) {
          <div class="error-message">{{ errorMessage }}</div>
        }
        @if (successMessage) {
          <div class="success-message">{{ successMessage }}</div>
        }
      </form>
      <p class="login-link">Уже зарегистрированы? <a routerLink="/login">Войти</a></p>
    </div>
  `,
  styles: [
    `
      .register-container {
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
        background: #28a745;
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
      .success-message {
        background: #d4edda;
        color: #155724;
        padding: 10px;
        border-radius: 4px;
        margin-top: 15px;
        text-align: center;
        border: 1px solid #c3e6cb;
      }
      .login-link {
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  username = '';
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.authService
      .register({
        username: this.username,
        email: this.email,
        password: this.password,
      })
      .pipe(
        tap(() => {
          this.successMessage = 'Регистрация успешна! Перенаправление на страницу входа...';
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }),
        catchError((err) => {
          let errorText = 'Ошибка регистрации. Попробуйте позже.';
          if (err.error?.detail) {
            errorText = err.error.detail;
          } else if (err.error?.non_field_errors) {
            errorText = err.error.non_field_errors.join(', ');
          } else if (err.status === 400) {
            if (err.error?.username)
              errorText = `Имя пользователя: ${err.error.username.join(', ')}`;
            else if (err.error?.email) errorText = `Email: ${err.error.email.join(', ')}`;
            else if (err.error?.password) errorText = `Пароль: ${err.error.password.join(', ')}`;
          }
          this.errorMessage = errorText;
          this.cdr.detectChanges();
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

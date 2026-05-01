import { Component, inject, OnInit, signal } from '@angular/core';
import { catchError, EMPTY, filter, finalize, take, tap } from 'rxjs';
import { IUserExtended } from '../../../interfaces/user';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatError, MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import moment from 'moment';
import { NgOptimizedImage, NgStyle } from '@angular/common';

@Component({
  selector: 'app-user-settings',
  imports: [
    MatProgressBar,
    MatButton,
    MatSuffix,
    MatInput,
    MatFormField,
    FormsModule,
    ReactiveFormsModule,
    MatLabel,
    MatError,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    NgOptimizedImage,
    NgStyle,
  ],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.scss',
})
export class UserSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  form!: FormGroup;
  isLoading = signal(false);
  photoFile: File | null = null;
  photoPreviewUrl = signal<string | null>(null);
  originalData: IUserExtended | null = null;

  ngOnInit(): void {
    this.isLoading.set(true);
    this.userService.user$
      .pipe(
        take(1),
        catchError((err) => {
          console.error('Ошибка загрузки настроек', err);
          this.isLoading.set(false);
          return EMPTY;
        }),
        filter((userData) => !!userData),
        tap((userData) => {
          this.originalData = userData!;
          this.initForm(userData);
          this.isLoading.set(false);
        }),
      )
      .subscribe();
  }

  private initForm(user: IUserExtended): void {
    this.form = this.fb.group({
      username: [user.username, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      first_name: [user.first_name],
      last_name: [user.last_name],
      second_name: [user.second_name],
      birth_date: [user.birth_date ? new Date(user.birth_date) : null],
    });
    if (user.profile_photo) {
      this.photoPreviewUrl.set(user.profile_photo);
    }
  }

  fullName(): string {
    const { first_name, last_name, second_name } = this.form?.value || {};
    return [last_name, first_name, second_name].filter(Boolean).join(' ');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.photoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.photoPreviewUrl.set(e.target?.result as string);
      reader.readAsDataURL(this.photoFile);
    }
  }

  removePhoto(): void {
    this.photoFile = null;
    this.photoPreviewUrl.set(null);
  }

  resetForm(): void {
    if (this.originalData) {
      this.initForm(this.originalData);
      this.photoFile = null;
      this.photoPreviewUrl.set(this.originalData.profile_photo || null);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    const formData = new FormData();
    const values = this.form.value;
    Object.keys(values).forEach((key) => {
      let value = values[key];
      if (value instanceof Date) {
        value = moment(value).format('YYYY-MM-DD');
      }
      if (value == null) {
        value = '';
      }
      formData.append(key, value);
    });
    if (this.photoFile) {
      formData.append('profile_photo', this.photoFile);
      formData.append('profile_photo_init', this.photoFile);
    } else if (this.photoPreviewUrl() === null && this.originalData?.profile_photo) {
      // пользователь удалил фото
      formData.append('profile_photo_remove', 'true');
    }
    this.userService
      .updateUser(this.originalData?.id!, formData)
      .pipe(
        take(1),
        tap((updatedUserData) => {
          this.originalData = updatedUserData;
          this.initForm(updatedUserData);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe();
  }
}

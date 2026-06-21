import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { UserSettingsComponent } from './user-settings';
import { UserService } from '../../../services/user';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormBuilder } from '@angular/forms';

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;

  const mockUser = {
    id: 1,
    username: 'test',
    email: 'test@mail.com',
    first_name: 'John',
    last_name: 'Doe',
    second_name: 'Middle',
    birth_date: '2000-01-01',
    need_send_email_notification: true,
    need_send_push_notification: false,
    profile_photo: null,
  };

  let userService: any;
  let userSubject: BehaviorSubject<any>;

  const userData = {
    id: 777,
    username: 'alex',
    email: 'alex@test.com',
    first_name: 'Alex',
    last_name: 'Ivanov',
    second_name: 'Petrovich',
    birth_date: '1990-01-15',
    profile_photo: 'https://test/photo.jpg',
    need_send_email_notification: true,
    need_send_push_notification: false,
  };

  const userServiceMock = {
    user$: of(mockUser),
    updateUser: (id: number, data: FormData) => of(mockUser),
  };

  beforeEach(async () => {
    userSubject = new BehaviorSubject(userData);

    userService = {
      user$: userSubject.asObservable(),
      updateUser: vi.fn(() => of(userData)),
    };

    await TestBed.configureTestingModule({
      imports: [UserSettingsComponent],
      providers: [
        { provide: UserService, useValue: userService },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form from user data', () => {
    expect(component.form).toBeTruthy();

    expect(component.form.get('username')?.value).toBe('alex');
    expect(component.form.get('email')?.value).toBe('alex@test.com');

    expect(component.originalData?.id).toBe(777);
  });

  it('should set photo preview from profile photo', () => {
    expect(component.photoPreviewUrl()).toBe('https://test/photo.jpg');
  });

  it('should build full name', () => {
    expect(component.fullName()).toBe('Ivanov Alex Petrovich');
  });

  it('should return empty full name when form not initialized', () => {
    const cmp = Object.create(UserSettingsComponent.prototype) as UserSettingsComponent;

    expect(cmp.fullName()).toBe('');
  });

  it('should remove photo', () => {
    component.photoFile = new File(['test'], 'test.png', { type: 'image/png' });

    component.removePhoto();

    expect(component.photoFile).toBeNull();
    expect(component.photoPreviewUrl()).toBeNull();
  });

  it('should reset form', () => {
    component.form.patchValue({
      username: 'changed',
      email: 'changed@test.com',
    });

    component.removePhoto();

    component.resetForm();

    expect(component.form.get('username')?.value).toBe('alex');

    expect(component.form.get('email')?.value).toBe('alex@test.com');

    expect(component.photoPreviewUrl()).toBe('https://test/photo.jpg');
  });

  it('should not reset form when originalData is null', () => {
    component.originalData = null;

    expect(() => component.resetForm()).not.toThrow();
  });

  it('should mark loading false when user loaded', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should handle user loading error', async () => {
    const failedService = {
      user$: throwError(() => new Error('load error')),
      updateUser: vi.fn(),
    };

    await TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [UserSettingsComponent],
      providers: [
        provideNativeDateAdapter(),
        {
          provide: UserService,
          useValue: failedService,
        },
      ],
    }).compileComponents();

    const failedFixture = TestBed.createComponent(UserSettingsComponent);

    const failedComponent = failedFixture.componentInstance;
    userSubject.next(userData);
    component.form = new FormBuilder().group({
      username: ['alex'],
      email: ['alex@test.com'],
      first_name: ['Alex'],
      last_name: ['Ivanov'],
      second_name: ['Petrovich'],
      birth_date: [null],
      need_send_email_notification: [true],
      need_send_push_notification: [false],
    });

    fixture.detectChanges();

    expect(failedComponent.isLoading()).toBe(false);
  });

  it('should not submit invalid form', () => {
    component.form.patchValue({
      username: '',
    });

    component.onSubmit();

    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  it('should submit form', () => {
    component.onSubmit();

    expect(userService.updateUser).toHaveBeenCalledTimes(1);

    const [userId] = userService.updateUser.mock.calls[0];

    expect(userId).toBe(777);
  });

  it('should append profile photo on submit', () => {
    const file = new File(['test'], 'avatar.png', {
      type: 'image/png',
    });

    component.photoFile = file;

    component.onSubmit();

    const [, formData] = userService.updateUser.mock.calls[0];

    expect(formData instanceof FormData).toBe(true);

    expect(formData.get('profile_photo')).toBe(file);

    expect(formData.get('profile_photo_init')).toBe(file);
  });

  it('should append remove photo flag', () => {
    component.photoPreviewUrl.set(null);

    component.onSubmit();

    const [, formData] = userService.updateUser.mock.calls[0];

    expect(formData.get('profile_photo_remove')).toBe('true');
  });

  it('should format birth date before submit', () => {
    component.form.patchValue({
      birth_date: new Date('2020-02-20'),
    });

    component.onSubmit();

    const [, formData] = userService.updateUser.mock.calls[0];

    expect(formData.get('birth_date')).toBe('2020-02-20');
  });

  it('should replace null values with empty string', () => {
    component.form.patchValue({
      first_name: null,
    });

    component.onSubmit();

    const [, formData] = userService.updateUser.mock.calls[0];

    expect(formData.get('first_name')).toBe('');
  });

  it('should update original data after successful save', () => {
    const updatedUser = {
      ...userData,
      username: 'updated-user',
    };

    userService.updateUser.mockReturnValue(of(updatedUser));

    component.onSubmit();

    expect(component.originalData?.username).toBe('updated-user');

    expect(component.form.get('username')?.value).toBe('updated-user');
  });

  it('should reset loading after successful submit', () => {
    component.onSubmit();

    expect(component.isLoading()).toBe(false);
  });

  it('should load selected file', () => {
    const file = new File(['content'], 'avatar.png', {
      type: 'image/png',
    });

    const readAsDataURL = vi.fn();

    class MockFileReader {
      onload: ((e: any) => void) | null = null;

      readAsDataURL = readAsDataURL;
    }

    vi.stubGlobal('FileReader', MockFileReader as any);

    const event = {
      target: {
        files: [file],
      },
    };

    component.onFileSelected(event as any);

    expect(component.photoFile).toBe(file);
    expect(readAsDataURL).toHaveBeenCalledWith(file);
  });

  it('should set preview after file reader loaded', () => {
    const file = new File(['content'], 'avatar.png', {
      type: 'image/png',
    });

    let readerInstance: any;

    class MockFileReader {
      onload: ((e: any) => void) | null = null;

      constructor() {
        readerInstance = this;
      }

      readAsDataURL() {}
    }

    vi.stubGlobal('FileReader', MockFileReader as any);

    component.onFileSelected({
      target: {
        files: [file],
      },
    } as any);

    readerInstance.onload?.({
      target: {
        result: 'base64-image',
      },
    });

    expect(component.photoPreviewUrl()).toBe('base64-image');
  });

  it('should ignore file selection when files are absent', () => {
    component.onFileSelected({
      target: {},
    } as any);

    expect(component.photoFile).toBeNull();
  });
});

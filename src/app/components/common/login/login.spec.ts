import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display login form fields and labels', () => {
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;

    expect(nativeElement.querySelector('h2')?.textContent).toContain('Вход');

    expect(nativeElement.querySelector('label[for="email"]')?.textContent).toContain('Email');

    expect(nativeElement.querySelector('label[for="password"]')?.textContent).toContain('Пароль');

    expect(nativeElement.querySelector('input[placeholder="example@domain.com"]')).toBeTruthy();

    expect(nativeElement.querySelector('input[placeholder="******"]')).toBeTruthy();

    expect(nativeElement.querySelector('.register-link')).toBeTruthy();
  });

});

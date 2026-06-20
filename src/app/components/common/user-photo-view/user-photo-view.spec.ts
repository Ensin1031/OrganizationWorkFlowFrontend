import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPhotoViewComponent } from './user-photo-view';

describe('UserPhotoViewComponent', () => {
  let component: UserPhotoViewComponent;
  let fixture: ComponentFixture<UserPhotoViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPhotoViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPhotoViewComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('photoUrl', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('tooltip', 'test tooltip');

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

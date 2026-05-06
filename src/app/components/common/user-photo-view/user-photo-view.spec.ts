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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

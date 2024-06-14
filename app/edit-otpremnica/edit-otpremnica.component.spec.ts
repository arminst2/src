import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOtpremnicaComponent } from './edit-otpremnica.component';

describe('EditOtpremnicaComponent', () => {
  let component: EditOtpremnicaComponent;
  let fixture: ComponentFixture<EditOtpremnicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditOtpremnicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOtpremnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

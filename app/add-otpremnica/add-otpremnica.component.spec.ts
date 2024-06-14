import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOtpremnicaComponent } from './add-otpremnica.component';

describe('AddOtpremnicaComponent', () => {
  let component: AddOtpremnicaComponent;
  let fixture: ComponentFixture<AddOtpremnicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOtpremnicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOtpremnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

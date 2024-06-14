import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpremnicaComponent } from './otpremnica.component';

describe('OtpremnicaComponent', () => {
  let component: OtpremnicaComponent;
  let fixture: ComponentFixture<OtpremnicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtpremnicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpremnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

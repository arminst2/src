import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RekapitulacijaComponent } from './rekapitulacija.component';

describe('RekapitulacijaComponent', () => {
  let component: RekapitulacijaComponent;
  let fixture: ComponentFixture<RekapitulacijaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RekapitulacijaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RekapitulacijaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

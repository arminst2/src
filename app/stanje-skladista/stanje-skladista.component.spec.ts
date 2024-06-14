import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StanjeSkladistaComponent } from './stanje-skladista.component';

describe('StanjeSkladistaComponent', () => {
  let component: StanjeSkladistaComponent;
  let fixture: ComponentFixture<StanjeSkladistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StanjeSkladistaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StanjeSkladistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedjuskladisteComponent } from './medjuskladiste.component';

describe('MedjuskladisteComponent', () => {
  let component: MedjuskladisteComponent;
  let fixture: ComponentFixture<MedjuskladisteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedjuskladisteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedjuskladisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

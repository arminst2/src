import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMedjuskladisteComponent } from './add-medjuskladiste.component';

describe('AddMedjuskladisteComponent', () => {
  let component: AddMedjuskladisteComponent;
  let fixture: ComponentFixture<AddMedjuskladisteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMedjuskladisteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMedjuskladisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

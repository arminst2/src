import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMedjuskladisteComponent } from './edit-medjuskladiste.component';

describe('EditMedjuskladisteComponent', () => {
  let component: EditMedjuskladisteComponent;
  let fixture: ComponentFixture<EditMedjuskladisteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMedjuskladisteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMedjuskladisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

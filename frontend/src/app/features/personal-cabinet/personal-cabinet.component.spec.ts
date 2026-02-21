import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalCabinetComponent } from './personal-cabinet.component';
import { provideMockStore } from '@ngrx/store/testing';
import { MatDialog } from '@angular/material/dialog';

describe('PersonalCabinetComponent', () => {
  let component: PersonalCabinetComponent;
  let fixture: ComponentFixture<PersonalCabinetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalCabinetComponent],
      providers: [
        provideMockStore(),
        { provide: MatDialog, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalCabinetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

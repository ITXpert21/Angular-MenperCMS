import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewRoleComponent } from './add-new-role.component';

describe('AddNewRoleComponent', () => {
  let component: AddNewRoleComponent;
  let fixture: ComponentFixture<AddNewRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

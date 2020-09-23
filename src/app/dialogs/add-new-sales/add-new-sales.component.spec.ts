import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewSalesComponent } from './add-new-sales.component';

describe('AddNewSalesComponent', () => {
  let component: AddNewSalesComponent;
  let fixture: ComponentFixture<AddNewSalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewSalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

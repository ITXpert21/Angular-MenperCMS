import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessOkDialogComponent } from './success-ok-dialog.component';

describe('SuccessOkDialogComponent', () => {
  let component: SuccessOkDialogComponent;
  let fixture: ComponentFixture<SuccessOkDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessOkDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessOkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

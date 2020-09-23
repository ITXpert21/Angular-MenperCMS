import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRejectDialogComponent } from './approve-reject-dialog.component';

describe('ApproveRejectDialogComponent', () => {
  let component: ApproveRejectDialogComponent;
  let fixture: ComponentFixture<ApproveRejectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveRejectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRejectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

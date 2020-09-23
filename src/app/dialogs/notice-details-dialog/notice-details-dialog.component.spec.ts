import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeDetailsDialogComponent } from './notice-details-dialog.component';

describe('NoticeDetailsDialogComponent', () => {
  let component: NoticeDetailsDialogComponent;
  let fixture: ComponentFixture<NoticeDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoticeDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoticeDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

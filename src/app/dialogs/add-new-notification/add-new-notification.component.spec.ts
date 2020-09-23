import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewNotificationComponent } from './add-new-notification.component';

describe('AddNewNotificationComponent', () => {
  let component: AddNewNotificationComponent;
  let fixture: ComponentFixture<AddNewNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

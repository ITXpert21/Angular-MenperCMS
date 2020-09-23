import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsProfileComponent } from './cms-profile.component';

describe('CmsProfileComponent', () => {
  let component: CmsProfileComponent;
  let fixture: ComponentFixture<CmsProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CmsProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CmsProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionDetail } from './projection-detail';

describe('ProjectionDetail', () => {
  let component: ProjectionDetail;
  let fixture: ComponentFixture<ProjectionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectionDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

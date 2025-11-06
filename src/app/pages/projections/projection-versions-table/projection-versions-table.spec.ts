import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionVersionsTable } from './projection-versions-table';

describe('ProjectionVersionsTable', () => {
  let component: ProjectionVersionsTable;
  let fixture: ComponentFixture<ProjectionVersionsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionVersionsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectionVersionsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

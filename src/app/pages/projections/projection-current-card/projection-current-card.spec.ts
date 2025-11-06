import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionCurrentCard } from './projection-current-card';

describe('ProjectionCurrentCard', () => {
  let component: ProjectionCurrentCard;
  let fixture: ComponentFixture<ProjectionCurrentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionCurrentCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectionCurrentCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

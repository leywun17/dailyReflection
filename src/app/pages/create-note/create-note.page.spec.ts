import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateNotePage } from './create-note.page';

describe('CreateNotePage', () => {
  let component: CreateNotePage;
  let fixture: ComponentFixture<CreateNotePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

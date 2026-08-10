import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionesBell } from './notificaciones-bell';

describe('NotificacionesBell', () => {
  let component: NotificacionesBell;
  let fixture: ComponentFixture<NotificacionesBell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionesBell],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacionesBell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

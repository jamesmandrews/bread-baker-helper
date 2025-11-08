import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanVolumeCalculatorComponent } from './pan-volume-calculator.component';

describe('PanVolumeCalculatorComponent', () => {
  let component: PanVolumeCalculatorComponent;
  let fixture: ComponentFixture<PanVolumeCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanVolumeCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanVolumeCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

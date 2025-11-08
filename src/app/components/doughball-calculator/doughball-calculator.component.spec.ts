import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoughballCalculatorComponent } from './doughball-calculator.component';

describe('DoughballCalculatorComponent', () => {
  let component: DoughballCalculatorComponent;
  let fixture: ComponentFixture<DoughballCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoughballCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoughballCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

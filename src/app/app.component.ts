import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { DoughballCalculatorComponent } from './components/doughball-calculator/doughball-calculator.component';
import { PanVolumeCalculatorComponent } from './components/pan-volume-calculator/pan-volume-calculator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CalculatorComponent, DoughballCalculatorComponent, PanVolumeCalculatorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bread-helper';
  activeTab = signal<'bakers-percentage' | 'doughball' | 'pan-volume'>('bakers-percentage');

  selectTab(tab: 'bakers-percentage' | 'doughball' | 'pan-volume'): void {
    this.activeTab.set(tab);
  }
}

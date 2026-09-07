import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { DoughballCalculatorComponent } from './components/doughball-calculator/doughball-calculator.component';
import { PanVolumeCalculatorComponent } from './components/pan-volume-calculator/pan-volume-calculator.component';

type Tab = 'bakers-percentage' | 'doughball' | 'pan-volume';

interface TabDef {
  id: Tab;
  /** Shown in the bar — kept short so three fit without crowding. */
  short: string;
  /** Accessible name, and the heading of the help sheet. */
  full: string;
}

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CalculatorComponent, DoughballCalculatorComponent, PanVolumeCalculatorComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bread-helper';

  readonly tabs: TabDef[] = [
    { id: 'bakers-percentage', short: "Baker's %", full: "Baker's Percentage Calculator" },
    { id: 'doughball', short: 'Doughball', full: 'Pizza Doughball Calculator' },
    { id: 'pan-volume', short: 'Pan Volume', full: 'Pan Volume Calculator' }
  ];

  activeTab = signal<Tab>('bakers-percentage');

  private readonly helpDialog = viewChild<ElementRef<HTMLDialogElement>>('help');

  activeTabDef = () => this.tabs.find(t => t.id === this.activeTab())!;

  selectTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  /** Native <dialog> gives focus trapping, Esc-to-close and inertness free. */
  openHelp(): void {
    this.helpDialog()?.nativeElement.showModal();
  }

  closeHelp(): void {
    this.helpDialog()?.nativeElement.close();
  }
}

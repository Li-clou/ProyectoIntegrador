import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<div class="skeleton" [class.rounded-full]="shape === 'circle'" [class.rounded-xl]="shape !== 'circle'" [style.width]="width" [style.height]="height"></div>`,
  styles: [`:host { display: block; }`],
})
export class SkeletonComponent {
  @Input() shape: 'line' | 'block' | 'circle' = 'line';
  @Input() width = '100%';
  @Input() height = '1rem';
}
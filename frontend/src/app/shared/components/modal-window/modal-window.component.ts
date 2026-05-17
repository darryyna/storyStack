import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-window',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.scss'
})
export class ModalWindowComponent {
  public title = input.required<string>();
  public description = input<string>();
  public confirmLabel = input<string>('ACTIONS.CONFIRM');
  public cancelLabel = input<string>('ACTIONS.CANCEL');

  public confirmed = output<void>();
  public cancelled = output<void>();

  protected onConfirm(): void {
    this.confirmed.emit();
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}

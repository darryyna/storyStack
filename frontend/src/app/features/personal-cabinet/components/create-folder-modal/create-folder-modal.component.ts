import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Folder } from '../../../../core/models/folder.model';

@Component({
  selector: 'app-create-folder-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './create-folder-modal.component.html',
  styleUrls: ['./create-folder-modal.component.scss']
})
export class CreateFolderModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateFolderModalComponent>);

  protected folderForm: FormGroup;
  protected isSubmitting = false;
  protected selectedColor = '#3b82f6';
  
  protected colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6b7280', // gray
    '#06b6d4', // cyan
    '#f97316', // orange
    '#4b5563'  // cool gray
  ];

  constructor() {
    this.folderForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  protected selectColor(color: string) {
    this.selectedColor = color;
  }

  protected onClose() {
    this.dialogRef.close();
  }

  protected onSubmit() {
    if (this.folderForm.valid) {
      this.isSubmitting = true;
      const folderData: Folder = {
        ...this.folderForm.value,
        colorLabel: this.selectedColor
      };
      this.dialogRef.close(folderData);
    }
  }
}

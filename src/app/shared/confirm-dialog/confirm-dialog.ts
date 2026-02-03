import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  template: `
    <div *ngIf="(confirmService.confirm$ | async) as options" class="confirm-overlay">
      <div class="confirm-dialog">
        <div class="confirm-header">
          <span class="confirm-icon">⚠️</span>
          <h2>{{ options.title }}</h2>
        </div>
        <div class="confirm-body">
          <p>{{ options.message }}</p>
        </div>
        <div class="confirm-footer">
          <button class="btn btn-secondary" (click)="confirmService.cancel()">
            ✕ {{ options.cancelLabel || 'Cancel' }}
          </button>
          <button class="btn btn-danger" (click)="confirmService.confirm()">
            🗑️ {{ options.confirmLabel || 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .confirm-dialog {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 420px;
      width: 90%;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .confirm-header {
      padding: 24px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .confirm-icon {
      font-size: 28px;
      flex-shrink: 0;
    }

    .confirm-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #2c3e50;
      letter-spacing: -0.3px;
    }

    .confirm-body {
      padding: 24px;
    }

    .confirm-body p {
      margin: 0;
      color: #555;
      line-height: 1.6;
      font-size: 14px;
    }

    .confirm-footer {
      padding: 18px 24px;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn {
      padding: 10px 18px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-secondary {
      background-color: #e9ecef;
      color: #2c3e50;
    }

    .btn-secondary:hover {
      background-color: #dee2e6;
      transform: translateY(-2px);
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }

    .btn-danger:hover {
      background-color: #c82333;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
    }

    .btn:active {
      transform: translateY(0);
    }
  `]
})
export class ConfirmDialog {
  constructor(public confirmService: ConfirmService) {}
}

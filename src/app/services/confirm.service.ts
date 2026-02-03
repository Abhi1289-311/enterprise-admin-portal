import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private confirmSubject = new BehaviorSubject<ConfirmOptions | null>(null);
  public confirm$ = this.confirmSubject.asObservable();
  private resolveConfirm: ((value: boolean) => void) | null = null;

  open(options: ConfirmOptions): Promise<boolean> {
    return new Promise(resolve => {
      this.resolveConfirm = resolve;
      this.confirmSubject.next(options);
    });
  }

  confirm(): void {
    this.confirmSubject.next(null);
    this.resolveConfirm?.(true);
  }

  cancel(): void {
    this.confirmSubject.next(null);
    this.resolveConfirm?.(false);
  }
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastDisplay } from './shared/toast-display/toast-display';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastDisplay, ConfirmDialog],
  template: `<router-outlet></router-outlet>
<app-toast-display></app-toast-display>
<app-confirm-dialog></app-confirm-dialog>`,
  styles: []
})
export class App {}

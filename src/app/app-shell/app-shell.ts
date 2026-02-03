import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-shell',
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {
  constructor(private authService: AuthService, private router: Router) {}

  get currentUser() {
    return this.authService.getSession();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

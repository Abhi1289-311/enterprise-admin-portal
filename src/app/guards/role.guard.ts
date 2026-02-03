import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  canActivate(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    const user = this.authService.getCurrentUser();
    if (user?.role === 'Admin') {
      return true;
    } else {
      window.alert('Access denied');
      this.router.navigate(['/app/dashboard']);
      return false;
    }
  }
}
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { Alert } from '../../shared/alert/alert';
import { User } from '../../models/user.model';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-detail',
  imports: [CommonModule, RouterLink, LoadingSpinner, Alert],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Detail implements OnInit, OnDestroy {
  user: User | null = null;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit() {
    const subscription = this.route.params.pipe(
      switchMap(params => {
        const id = Number(params['id']);
        console.log('Detail component - Route params:', params, 'Parsed ID:', id, 'Type:', typeof id);
        // Strict validation: must be a positive number
        if (Number.isNaN(id) || id <= 0) {
          this.error = '';
          this.toastService.error('Invalid user ID');
          // Navigate back after a brief delay
          setTimeout(() => this.router.navigate(['/app/users']), 500);
          return of(null);
        }
        this.loading = true;
        this.error = '';
        console.log('Calling getUser with id:', id);
        return this.userService.getUser(id).pipe(
          timeout(15000) // Overall timeout for the observable
        );
      }),
      timeout(20000), // Overall timeout for the entire chain
      takeUntil(this.destroy$)
    ).subscribe({
      next: user => {
        console.log('Detail component received user:', user);
        try {
          if (user) {
            console.log('User check - user.id:', user.id, 'type:', typeof user.id);
          }
          
          if (user === null || user === undefined) {
            console.log('User is null/undefined, skipping');
            this.loading = false;
            this.cdr.markForCheck();
            return;
          }
          
          if (!user.id || user.id <= 0) {
            console.error('User data invalid:', user);
            this.error = 'Invalid user data received';
            this.toastService.error('Invalid user data');
            this.loading = false;
            this.cdr.markForCheck();
            return;
          }
          
          console.log('Setting user data:', user);
          this.user = user;
          this.error = '';
          this.loading = false;
          this.cdr.markForCheck();
        } catch (err) {
          console.error('Error in next handler:', err);
          this.error = 'Error processing user data';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Detail component error:', err);
        this.error = 'User not found';
        console.error('User detail load error:', err);
        this.toastService.error('Failed to load user');
        this.loading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        console.log('Detail component subscription completed');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.router.navigate(['/app/users']);
  }
}

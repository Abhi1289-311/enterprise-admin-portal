import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { Alert } from '../../shared/alert/alert';
import { Booking } from '../../models/booking.model';
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
  booking: Booking | null = null;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
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
        // Strict validation: must be a positive number
        if (Number.isNaN(id) || id <= 0) {
          this.error = '';
          this.toastService.error('Invalid booking ID');
          // Navigate back after a brief delay
          setTimeout(() => this.router.navigate(['/app/bookings']), 500);
          return of(null);
        }
        this.loading = true;
        this.error = '';
        return this.bookingService.getBooking(id).pipe(
          timeout(15000) // Overall timeout for the observable
        );
      }),
      timeout(20000), // Overall timeout for the entire chain
      takeUntil(this.destroy$)
    ).subscribe({
      next: booking => {
        console.log('Detail component received booking:', booking);
        try {
          if (booking) {
            console.log('Booking check - booking.id:', booking.id, 'type:', typeof booking.id);
          }
          
          if (booking === null || booking === undefined) {
            console.log('Booking is null/undefined, skipping');
            this.loading = false;
            this.cdr.markForCheck();
            return;
          }
          
          if (!booking.id || booking.id <= 0) {
            console.error('Booking data invalid:', booking);
            this.error = 'Invalid booking data received';
            this.toastService.error('Invalid booking data');
            this.loading = false;
            this.cdr.markForCheck();
            return;
          }
          
          console.log('Setting booking data:', booking);
          this.booking = booking;
          this.error = '';
          this.loading = false;
          this.cdr.markForCheck();
        } catch (err) {
          console.error('Error in next handler:', err);
          this.error = 'Error processing booking data';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.error = 'Booking not found';
        console.error('Booking detail load error:', err);
        this.toastService.error('Failed to load booking');
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
    this.router.navigate(['/app/bookings']);
  }
}

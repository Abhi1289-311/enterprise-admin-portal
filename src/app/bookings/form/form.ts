import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ToastService } from '../../services/toast.service';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { Alert } from '../../shared/alert/alert';
import { ValidationError } from '../../shared/validation-error/validation-error';
import { Subject } from 'rxjs';
import { takeUntil, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, CommonModule, LoadingSpinner, Alert, ValidationError],
  templateUrl: './form.html',
  styleUrl: './form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Form implements OnInit, OnDestroy {
  isEdit = false;
  bookingId: number | null = null;
  form: FormGroup;
  loading = false;
  error = '';
  initialFormValue: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      bookingCode: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
      customerName: ['', Validators.required],
      source: ['', Validators.required],
      destination: ['', Validators.required],
      travelDate: ['', Validators.required],
      bookingStatus: ['Created', Validators.required]
    }, { validators: this.destinationNotEqualSource });
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        const id = Number(params['id']);
        // Strict validation: must be a positive number
        if (Number.isNaN(id) || id <= 0) {
          this.error = 'Invalid booking ID';
          this.toastService.error('Invalid booking ID');
          setTimeout(() => this.router.navigate(['/app/bookings']), 500);
          return;
        }
        this.isEdit = true;
        this.bookingId = id;
        this.loadBooking();
      } else {
        // Create mode - initialize pristine state
        this.initialFormValue = this.form.value;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  destinationNotEqualSource(group: FormGroup) {
    const source = group.get('source')?.value;
    const destination = group.get('destination')?.value;
    return source && destination && source === destination ? { destinationEqualSource: true } : null;
  }

  loadBooking() {
    // Validate ID before attempting to load
    if (!this.bookingId || Number.isNaN(this.bookingId) || this.bookingId <= 0) {
      this.error = 'Invalid booking ID';
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    
    this.bookingService.getBooking(this.bookingId).pipe(
      timeout(15000),
      takeUntil(this.destroy$)
    ).subscribe({
      next: booking => {
        try {
          console.log('Form loaded booking:', booking);
          // Validate the loaded booking
          if (!booking || !booking.id || booking.id <= 0) {
            this.error = 'Booking not found';
            this.toastService.error('Booking not found');
            this.loading = false;
            this.cdr.markForCheck();
            return;
          }
          this.form.patchValue({
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            source: booking.source,
            destination: booking.destination,
            travelDate: booking.travelDate.split('T')[0],
            bookingStatus: booking.bookingStatus
          });
          // Capture initial state after loading
          this.initialFormValue = this.form.value;
          this.form.markAsPristine();
          this.loading = false;
          this.cdr.markForCheck();
        } catch (err) {
          console.error('Error in loadBooking next handler:', err);
          this.error = 'Error loading booking';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: err => {
        console.error('Booking load error:', err);
        this.error = 'Booking not found';
        this.toastService.error('Failed to load booking');
        this.loading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get today() {
    return new Date().toISOString().split('T')[0];
  }

  get isModified(): boolean {
    return this.form.valid && (
      this.form.dirty || 
      JSON.stringify(this.form.value) !== JSON.stringify(this.initialFormValue)
    );
  }

  onSubmit() {
    if (!this.form.valid) {
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    
    const bookingData = this.form.value;
    const obs = this.isEdit && this.bookingId
      ? this.bookingService.updateBooking(this.bookingId, bookingData)
      : this.bookingService.createBooking(bookingData);
    
    obs.pipe(
      timeout(15000),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        try {
          const message = this.isEdit ? 'Booking updated successfully' : 'Booking created successfully';
          this.toastService.success(message);
          this.loading = false;
          this.cdr.markForCheck();
          setTimeout(() => this.router.navigate(['/app/bookings']), 800);
        } catch (err) {
          console.error('Error in onSubmit next handler:', err);
          this.error = 'Error saving booking';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: err => {
        console.error('Booking save error:', err);
        this.error = 'Failed to save booking';
        this.toastService.error('Failed to save booking');
        this.loading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onCancel() {
    this.router.navigate(['/app/bookings']);
  }
}

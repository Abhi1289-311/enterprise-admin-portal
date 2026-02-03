import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';
import { Booking } from '../../models/booking.model';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { Alert } from '../../shared/alert/alert';

@Component({
  selector: 'app-list',
  imports: [CommonModule, RouterLink, LoadingSpinner, Alert],
  templateUrl: './list.html',
  styleUrl: './list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class List implements OnInit {
  bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();
  searchSubject = new BehaviorSubject('');
  filterStatusSubject = new BehaviorSubject('');
  sortSubject = new BehaviorSubject<{ field: keyof Booking, direction: 'asc' | 'desc' }>({ field: 'travelDate', direction: 'asc' });
  pageSubject = new BehaviorSubject(1);
  public loadingSubject = new BehaviorSubject(false);
  public errorSubject = new BehaviorSubject('');

  filteredBookings$ = combineLatest([this.bookings$, this.searchSubject, this.filterStatusSubject, this.sortSubject]).pipe(
    map(([bookings, search, status, sort]) => {
      let filtered = bookings.filter(b =>
        b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
        b.customerName.toLowerCase().includes(search.toLowerCase())
      );
      if (status) filtered = filtered.filter(b => b.bookingStatus === status);
      filtered.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
      return filtered;
    })
  );

  paginatedBookings$ = combineLatest([this.filteredBookings$, this.pageSubject]).pipe(
    map(([bookings, page]) => {
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      return bookings.slice(start, start + pageSize);
    })
  );

  totalPages$ = this.filteredBookings$.pipe(map(bookings => Math.ceil(bookings.length / 10)));

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loadingSubject.next(true);
    this.bookingService.getBookings().subscribe({
      next: bookings => {
        this.bookingsSubject.next(bookings);
        this.loadingSubject.next(false);
        this.cdr.markForCheck();
      },
      error: err => {
        this.errorSubject.next('Failed to load bookings');
        this.loadingSubject.next(false);
        this.toastService.error('Failed to load bookings');
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
    this.pageSubject.next(1);
  }

  onFilterStatus(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterStatusSubject.next(value);
    this.pageSubject.next(1);
  }

  onSort(field: keyof Booking) {
    const current = this.sortSubject.value;
    if (current.field === field) {
      this.sortSubject.next({ field, direction: current.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      this.sortSubject.next({ field, direction: 'asc' });
    }
  }

  onPage(page: number) {
    this.pageSubject.next(page);
  }

  viewBooking(id: number) {
    if (!this.isValidId(id)) {
      this.toastService.error('Invalid record id');
      return;
    }
    this.cdr.markForCheck();
    this.router.navigate(['/app/bookings', id]);
  }

  editBooking(id: number) {
    if (!this.isValidId(id)) {
      this.toastService.error('Invalid record id');
      return;
    }
    this.cdr.markForCheck();
    this.router.navigate(['/app/bookings', id, 'edit']);
  }

  isValidId(id: any): boolean {
    return typeof id === 'number' && !isNaN(id) && id > 0;
  }

  onDelete(id: number) {
    if (!this.isValidId(id)) {
      this.toastService.error('Invalid record id');
      return;
    }

    this.confirmService.open({
      title: 'Delete Booking',
      message: 'Are you sure you want to delete this booking?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    }).then(confirmed => {
      if (confirmed) {
        this.loadingSubject.next(true);
        this.cdr.markForCheck();
        this.bookingService.deleteBooking(id).subscribe({
          next: () => {
            this.loadBookings();
            this.toastService.success('Booking deleted successfully');
            this.cdr.markForCheck();
          },
          error: err => {
            this.errorSubject.next('Failed to delete booking');
            this.loadingSubject.next(false);
            this.toastService.error('Failed to delete booking');
            this.cdr.markForCheck();
          }
        });
      }
    });
  }
}

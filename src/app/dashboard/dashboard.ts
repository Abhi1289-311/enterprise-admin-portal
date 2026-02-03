import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { BookingService } from '../services/booking.service';
import { User } from '../models/user.model';
import { Booking } from '../models/booking.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  users$: Observable<User[]>;
  bookings$: Observable<Booking[]>;

  constructor(private userService: UserService, private bookingService: BookingService) {
    this.users$ = this.userService.getUsers();
    this.bookings$ = this.bookingService.getBookings();
  }

  getActiveUsers(users: User[]): number {
    return users.filter(u => u.status === 'Active').length;
  }

  getConfirmedBookings(bookings: Booking[]): number {
    return bookings.filter(b => b.bookingStatus === 'Confirmed').length;
  }

  getRecentBookings(bookings: Booking[]): Booking[] {
    return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }
}

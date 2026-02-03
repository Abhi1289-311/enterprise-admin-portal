import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, catchError, timeout } from 'rxjs';
import { Booking } from '../models/booking.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl).pipe(
      timeout(10000), // 10 second timeout
      map(bookings => bookings.map(b => this.normalizeBooking(b)))
    );
  }

  getBooking(id: number): Observable<Booking> {
    console.log('BookingService.getBooking() called with id:', id, 'type:', typeof id);
    return this.http.get<Booking>(`${this.apiUrl}/${id}`).pipe(
      timeout(10000), // 10 second timeout
      map(booking => {
        console.log('Raw booking response from API:', booking);
        const normalized = this.normalizeBooking(booking);
        console.log('Normalized booking:', normalized);
        return normalized;
      }),
      catchError(err => {
        console.error('[getBooking] Error:', err);
        throw err;
      })
    );
  }

  createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Observable<Booking> {
    // Get all bookings first to find the highest ID
    return this.getBookings().pipe(
      switchMap(bookings => {
        // Find the maximum numeric ID
        let maxId = 0;
        bookings.forEach(b => {
          const numId = parseInt(String(b.id), 10);
          if (!isNaN(numId) && numId > maxId) {
            maxId = numId;
          }
        });
        
        // Assign the next numeric ID as a string
        const nextId = String(maxId + 1);
        console.log('[createBooking] Assigning next numeric ID:', nextId);
        
        const bookingToCreate = {
          id: nextId,
          ...bookingData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return this.http.post<Booking>(this.apiUrl, bookingToCreate).pipe(
          timeout(10000),
          map(b => this.normalizeBooking(b)),
          catchError(err => {
            console.error('[createBooking] Error:', err);
            throw err;
          })
        );
      })
    );
  }

  updateBooking(id: number, bookingData: Partial<Booking>): Observable<Booking> {
    // Preserve existing createdAt, update updatedAt
    const updatedAt = new Date().toISOString();
    const booking = {
      ...bookingData,
      updatedAt
    };
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, booking).pipe(
      map(b => this.normalizeBooking(b))
    );
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private normalizeBooking(booking: any): Booking {
    // Parse numeric string IDs to numbers
    let id: number;
    console.log('[normalizeBooking] Input booking:', booking);
    console.log('[normalizeBooking] booking.id:', booking.id, 'type:', typeof booking.id);
    
    if (typeof booking.id === 'number' && booking.id > 0 && !Number.isNaN(booking.id)) {
      // Already a valid number
      id = booking.id;
      console.log('[normalizeBooking] ID is already a valid number:', id);
    } else if (typeof booking.id === 'string') {
      // Parse numeric string
      const parsed = parseInt(booking.id, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        id = parsed;
        console.log('[normalizeBooking] Successfully parsed string ID to:', id);
      } else {
        // Fallback: if string doesn't parse to valid number, use hash
        console.warn('[normalizeBooking] ID is not a numeric string:', booking.id);
        id = this.generateIdFromString(booking.id);
        console.log('[normalizeBooking] Generated ID from hash:', id);
      }
    } else {
      // Invalid ID type
      console.error('[normalizeBooking] Invalid ID type:', typeof booking.id);
      id = this.generateIdFromString(String(booking.bookingCode || 'unknown'));
    }
    
    console.log('[normalizeBooking] Returning booking with id:', id);
    
    const now = new Date().toISOString();
    return {
      id,
      bookingCode: booking.bookingCode || '',
      customerName: booking.customerName || '',
      source: booking.source || '',
      destination: booking.destination || '',
      travelDate: booking.travelDate || now,
      bookingStatus: ['Created', 'Confirmed', 'Cancelled', 'Completed'].includes(booking.bookingStatus) 
        ? booking.bookingStatus 
        : 'Created',
      createdAt: booking.createdAt || booking.updatedAt || now,
      updatedAt: booking.updatedAt || now
    };
  }

  private generateIdFromString(str: string): number {
    // Simple hash function to convert string to positive number
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to positive number and ensure it's > 0
    return Math.abs(hash) % 1000000 + 1;
  }
}
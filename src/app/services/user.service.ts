import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, catchError, timeout } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      timeout(10000), // 10 second timeout
      map(users => users.map(u => this.normalizeUser(u)))
    );
  }

  getUser(id: number): Observable<User> {
    console.log('UserService.getUser() called with id:', id, 'type:', typeof id);
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      timeout(10000), // 10 second timeout
      map(user => {
        console.log('Raw user response from API:', user);
        const normalized = this.normalizeUser(user);
        console.log('Normalized user:', normalized);
        return normalized;
      }),
      catchError(err => {
        console.error('[getUser] Error:', err);
        throw err;
      })
    );
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Observable<User> {
    // Get all users first to find the highest ID
    return this.getUsers().pipe(
      switchMap(users => {
        // Find the maximum numeric ID
        let maxId = 0;
        users.forEach(u => {
          const numId = parseInt(String(u.id), 10);
          if (!isNaN(numId) && numId > maxId) {
            maxId = numId;
          }
        });
        
        // Assign the next numeric ID as a string
        const nextId = String(maxId + 1);
        console.log('[createUser] Assigning next numeric ID:', nextId);
        
        const userToCreate = {
          id: nextId,
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return this.http.post<User>(this.apiUrl, userToCreate).pipe(
          timeout(10000),
          map(u => this.normalizeUser(u)),
          catchError(err => {
            console.error('[createUser] Error:', err);
            throw err;
          })
        );
      })
    );
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    // Preserve existing createdAt, update updatedAt
    const updatedAt = new Date().toISOString();
    const user = {
      ...userData,
      updatedAt
    };
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      map(u => this.normalizeUser(u))
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private normalizeUser(user: any): User {
    // Parse numeric string IDs to numbers
    let id: number;
    console.log('[normalizeUser] Input user:', user);
    console.log('[normalizeUser] user.id:', user.id, 'type:', typeof user.id);
    
    if (typeof user.id === 'number' && user.id > 0 && !Number.isNaN(user.id)) {
      // Already a valid number
      id = user.id;
      console.log('[normalizeUser] ID is already a valid number:', id);
    } else if (typeof user.id === 'string') {
      // Parse numeric string
      const parsed = parseInt(user.id, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        id = parsed;
        console.log('[normalizeUser] Successfully parsed string ID to:', id);
      } else {
        // Fallback: if string doesn't parse to valid number, use hash
        console.warn('[normalizeUser] ID is not a numeric string:', user.id);
        id = this.generateIdFromString(user.id);
        console.log('[normalizeUser] Generated ID from hash:', id);
      }
    } else {
      // Invalid ID type
      console.error('[normalizeUser] Invalid ID type:', typeof user.id);
      id = this.generateIdFromString(String(user.email || 'unknown'));
    }
    
    console.log('[normalizeUser] Returning user with id:', id);
    
    const now = new Date().toISOString();
    return {
      id,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: ['Admin', 'Viewer'].includes(user.role) ? user.role : 'Viewer',
      status: ['Active', 'Inactive'].includes(user.status) ? user.status : 'Active',
      createdAt: user.createdAt || user.updatedAt || now,
      updatedAt: user.updatedAt || now
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
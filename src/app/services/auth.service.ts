import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

export interface Session {
  id: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Viewer';
  loginTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'app_auth';
  private readonly API_URL = `${environment.apiUrl}/users`;
  private sessionSubject = new BehaviorSubject<Session | null>(this.loadSession());
  public session$ = this.sessionSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private http: HttpClient
  ) {}

  private loadSession(): Session | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  login(email: string, password: string): Observable<Session> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable(observer => observer.complete());
    }

    // Fetch user from backend by email
    return this.http.get<User[]>(`${this.API_URL}?email=${email}`).pipe(
      map(users => {
        if (!users || users.length === 0) {
          throw new Error('Invalid credentials');
        }

        const user = users[0];

        // Check password (Option A: fixed password per role)
        const expectedPassword = user.role === 'Admin' ? 'admin123' : 'viewer123';
        if (password !== expectedPassword) {
          throw new Error('Invalid credentials');
        }

        // Check if user is active
        if (user.status !== 'Active') {
          throw new Error('User is inactive');
        }

        // Create session and store
        const session: Session = {
          id: user.id as number,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          loginTime: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        this.sessionSubject.next(session);

        return session;
      })
    );
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.STORAGE_KEY);
    this.sessionSubject.next(null);
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!this.sessionSubject.value;
  }

  getSession(): Session | null {
    return this.sessionSubject.value;
  }

  getRole(): 'Admin' | 'Viewer' | null {
    return this.sessionSubject.value?.role || null;
  }

  getCurrentUser(): Session | null {
    return this.sessionSubject.value;
  }
}
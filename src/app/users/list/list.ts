import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';
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
  usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();
  searchSubject = new BehaviorSubject('');
  filterRoleSubject = new BehaviorSubject('');
  filterStatusSubject = new BehaviorSubject('');
  sortSubject = new BehaviorSubject<{ field: keyof User, direction: 'asc' | 'desc' }>({ field: 'fullName', direction: 'asc' });
  pageSubject = new BehaviorSubject(1);
  public loadingSubject = new BehaviorSubject(false);
  public errorSubject = new BehaviorSubject('');

  filteredUsers$ = combineLatest([this.users$, this.searchSubject, this.filterRoleSubject, this.filterStatusSubject, this.sortSubject]).pipe(
    map(([users, search, role, status, sort]) => {
      let filtered = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search)
      );
      if (role) filtered = filtered.filter(u => u.role === role);
      if (status) filtered = filtered.filter(u => u.status === status);
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

  paginatedUsers$ = combineLatest([this.filteredUsers$, this.pageSubject]).pipe(
    map(([users, page]) => {
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      return users.slice(start, start + pageSize);
    })
  );

  totalPages$ = this.filteredUsers$.pipe(map(users => Math.ceil(users.length / 10)));

  constructor(
    private userService: UserService,
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
    this.loadUsers();
  }

  loadUsers() {
    this.loadingSubject.next(true);
    this.userService.getUsers().subscribe({
      next: users => {
        this.usersSubject.next(users);
        this.loadingSubject.next(false);
        this.cdr.markForCheck();
      },
      error: err => {
        this.errorSubject.next('Failed to load users');
        this.loadingSubject.next(false);
        this.toastService.error('Failed to load users');
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
    this.pageSubject.next(1);
  }

  onFilterRole(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterRoleSubject.next(value);
    this.pageSubject.next(1);
  }

  onFilterStatus(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterStatusSubject.next(value);
    this.pageSubject.next(1);
  }

  onSort(field: keyof User) {
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

  viewUser(id: number) {
    debugger;
    if (!this.isValidId(id)) {
      this.toastService.error('Invalid record id');
      return;
    }
    this.cdr.markForCheck();
    this.router.navigate(['/app/users', id]);
  }

  editUser(id: number) {
    if (!this.isValidId(id)) {
      this.toastService.error('Invalid record id');
      return;
    }
    this.cdr.markForCheck();
    this.router.navigate(['/app/users', id, 'edit']);
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
      title: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    }).then(confirmed => {
      if (confirmed) {
        this.loadingSubject.next(true);
        this.cdr.markForCheck();
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.loadUsers();
            this.toastService.success('User deleted successfully');
            this.cdr.markForCheck();
          },
          error: err => {
            this.errorSubject.next('Failed to delete user');
            this.loadingSubject.next(false);
            this.toastService.error('Failed to delete user');
            this.cdr.markForCheck();
          }
        });
      }
    });
  }
}

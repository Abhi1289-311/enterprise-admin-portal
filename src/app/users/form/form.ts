import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
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
  userId: number | null = null;
  form: FormGroup;
  loading = false;
  error = '';
  initialFormValue: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      role: ['Viewer', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        const id = Number(params['id']);
        // Strict validation: must be a positive number
        if (Number.isNaN(id) || id <= 0) {
          this.error = 'Invalid user ID';
          this.toastService.error('Invalid user ID');
          setTimeout(() => this.router.navigate(['/app/users']), 500);
          return;
        }
        this.isEdit = true;
        this.userId = id;
        this.loadUser();
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

  loadUser() {
    // Validate ID before attempting to load
    if (!this.userId || Number.isNaN(this.userId) || this.userId <= 0) {
      this.error = 'Invalid user ID';
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    
    this.userService.getUser(this.userId).pipe(
      timeout(15000),
      takeUntil(this.destroy$)
    ).subscribe({
      next: user => {
        try {
          console.log('Form loaded user:', user);
          // Validate the loaded user
          if (!user || !user.id || user.id <= 0) {
            this.error = 'User not found';
            this.toastService.error('User not found');
            this.loading = false;
            this.cdr.markForCheck();
            return;
          }
          this.form.patchValue({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status
          });
          // Capture initial state after loading
          this.initialFormValue = this.form.value;
          this.form.markAsPristine();
          this.loading = false;
          this.cdr.markForCheck();
        } catch (err) {
          console.error('Error in loadUser next handler:', err);
          this.error = 'Error loading user';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: err => {
        console.error('User load error:', err);
        this.error = 'User not found';
        this.toastService.error('Failed to load user');
        this.loading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
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
    
    const userData = this.form.value;
    const obs = this.isEdit && this.userId
      ? this.userService.updateUser(this.userId, userData)
      : this.userService.createUser(userData);
    
    obs.pipe(
      timeout(15000),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        try {
          const message = this.isEdit ? 'User updated successfully' : 'User created successfully';
          this.toastService.success(message);
          this.loading = false;
          this.cdr.markForCheck();
          setTimeout(() => this.router.navigate(['/app/users']), 800);
        } catch (err) {
          console.error('Error in onSubmit next handler:', err);
          this.error = 'Error saving user';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: err => {
        console.error('User save error:', err);
        this.error = 'Failed to save user';
        this.toastService.error('Failed to save user');
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
    this.router.navigate(['/app/users']);
  }
}

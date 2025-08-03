import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    ValidatorFn,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
    form: FormGroup;
    showPassword = false;
    showRepeatPassword = false;

    @Input() token: string = '';
    @Output() passwordReset = new EventEmitter<void>();
    @Output() backToCode = new EventEmitter<void>();

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        this.form = this.fb.group(
            {
                password: ['', [Validators.required, Validators.minLength(8)]],
                repeatPassword: [
                    '',
                    [Validators.required, Validators.minLength(8)],
                ],
            },
            {
                validators: [
                    this.passwordMatchValidator('password', 'repeatPassword'),
                ],
            }
        );
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    toggleRepeatPassword() {
        this.showRepeatPassword = !this.showRepeatPassword;
    }

    passwordMatchValidator(
        passwordKey: string,
        confirmPasswordKey: string
    ): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const group = formGroup as FormGroup;

            const password = group.get(passwordKey)?.value;
            const confirmPassword = group.get(confirmPasswordKey)?.value;

            if (!password || !confirmPassword) return null;

            return password === confirmPassword
                ? null
                : { passwordMismatch: true };
        };
    }

    submit() {
        if (this.form.valid) {
            const { password } = this.form.value;
            this.authService.resetPassword(this.token, password).subscribe({
                next: () => {
                    this.passwordReset.emit();
                    Swal.fire({
                        icon: 'success',
                        title: 'Contraseña restablecida',
                        text: 'Tu contraseña ha sido restablecida exitosamente.',
                        timer: 4000,
                        timerProgressBar: true,
                        showCloseButton: true,
                        showConfirmButton: false,
                        customClass: {
                            popup: 'montserrat-swal',
                            closeButton: 'montserrat-close',
                        },
                    });
                    this.router.navigate(['/login']);
                },
                error: (error) => {
                    if (error.status === 401) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'El tiempo para restablecer la contraseña ha expirado o su token es inválido.',
                            timer: 4000,
                            timerProgressBar: true,
                            showCloseButton: true,
                            showConfirmButton: false,
                            customClass: {
                                popup: 'montserrat-swal',
                                closeButton: 'montserrat-close',
                            },
                        });
                        this.backToCode.emit();
                    } else if (error.status === 400) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'La nueva contraseña no puede ser igual a la contraseña anterior.',
                            timer: 4000,
                            timerProgressBar: true,
                            showCloseButton: true,
                            showConfirmButton: false,
                            customClass: {
                                popup: 'montserrat-swal',
                                closeButton: 'montserrat-close',
                            },
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
                            timer: 4000,
                            timerProgressBar: true,
                            showCloseButton: true,
                            showConfirmButton: false,
                            customClass: {
                                popup: 'montserrat-swal',
                                closeButton: 'montserrat-close',
                            },
                        });
                    }
                },
            });
        } else {
            console.log('Form is invalid');
        }
    }
}

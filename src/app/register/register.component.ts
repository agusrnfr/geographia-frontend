import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { min } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    imports: [ReactiveFormsModule, CommonModule],
    standalone: true,
})
export class RegisterComponent {
    showPassword = false;
    showRepeatPassword = false;
    registerForm!: FormGroup;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.registerForm = this.fb.group(
            {
                first_name: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(2),
                        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
                    ],
                ],
                last_name: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(2),
                        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
                    ],
                ],
                email: [
                    '',
                    [
                        Validators.required,
                        Validators.email,
                        Validators.maxLength(50),
                    ],
                ],
                birth_date: [
                    '',
                    [Validators.required, this.minAgeValidator(13)],
                ],
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

    goToLogin() {
        this.router.navigate(['/login']);
    }

    minAgeValidator(minAge: number) {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value) return null;

            const birthDate = new Date(value);
            const today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();

            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age--;
            }

            return age >= minAge
                ? null
                : { minAge: { requiredAge: minAge, actualAge: age } };
        };
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

    onSubmit() {
        if (this.registerForm.valid) {
            const data = {
                address: 'Ubicación no compartida',
                ...this.registerForm.value,
            };
            delete data.repeatPassword;
            this.authService.register(data).subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro exitoso!',
                        text: 'Tu cuenta fue creada correctamente.',
                        timer: 4000,
                        timerProgressBar: true,
                        showCloseButton: true,
                        showConfirmButton: false,
                        customClass: {
                            popup: 'montserrat-swal',
                            closeButton: 'montserrat-close',
                        },
                    }).then(() => {
                        this.router.navigate(['/login']);
                    });
                },
                error: (err) => {
                    console.error('Error during registration:', err);
                    if (
                        err.status === 400 &&
                        err.error?.error === 'User already exists'
                    ) {
                        Swal.fire({
                            icon: 'error',
                            title: 'El correo ya está registrado',
                            text: 'Por favor, iniciá sesión o usá otro correo electrónico.',
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
                            title: 'Error al registrar',
                            text:
                                err?.error?.message ||
                                'Ocurrió un error inesperado. Por favor, intentá de nuevo.',
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

    goToMap() {
        this.router.navigate(['/map']);
    }
}

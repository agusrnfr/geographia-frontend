import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [CommonModule, ReactiveFormsModule],
    standalone: true,
    providers: [CookieService],
})
export class LoginComponent {
    showPassword = false;
    loginForm!: FormGroup;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private authService: AuthService,
        private cookieService: CookieService
    ) {}

    ngOnInit() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            remember: [false],
        });
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    goToRegister() {
        this.router.navigate(['/register']);
    }

    onSubmit() {
        if (this.loginForm.valid) {
            const { email, password, remember } = this.loginForm.value;

            this.authService.login(email, password).subscribe({
                next: (response) => {
                    const token = response.token;
                    if (remember) {
                        const expireDate = new Date();
                        expireDate.setDate(expireDate.getDate() + 7);
                        this.cookieService.set('token', token, expireDate, '/');
                    } else {
                        sessionStorage.setItem('token', token);
                    }

                    this.router.navigate(['/map']);

                    Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        showCloseButton: true,
                        didOpen: (toast) => {
                            toast.onmouseenter = Swal.stopTimer;
                            toast.onmouseleave = Swal.resumeTimer;
                        },
                    }).fire({
                        icon: 'success',
                        title: 'Inicio de sesión exitoso',
                    });
                },
                error: (err) => {
                    if (
                        err.status === 401 &&
                        err.error?.error === 'Invalid credentials'
                    ) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Credenciales incorrectas',
                            text: 'Por favor, revisá tus credenciales e intentá de nuevo.',
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
                            title: 'Error al iniciar sesión',
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

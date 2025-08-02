import { Component, EventEmitter, Output } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
    form: FormGroup;

    @Output() tokenReceived = new EventEmitter<string>();
    @Output() emailSubmitted = new EventEmitter<string>();

    constructor(private fb: FormBuilder, private authService: AuthService) {
        this.form = this.fb.group({
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                    Validators.maxLength(50),
                ],
            ],
        });
    }

    submit() {
        if (this.form.valid) {
            this.authService
                .requestPasswordReset(this.form.value.email)
                .subscribe({
                    next: (response) => {
                        this.emailSubmitted.emit(this.form.value.email);
                        this.tokenReceived.emit(response.token);
                    },
                    error: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo enviar el correo. Asegúrate de que el email sea válido.',
                            timer: 4000,
                            timerProgressBar: true,
                            showCloseButton: true,
                            showConfirmButton: false,
                            customClass: {
                                popup: 'montserrat-swal',
                                closeButton: 'montserrat-close',
                            },
                        });
                    },
                });
        }
    }
}

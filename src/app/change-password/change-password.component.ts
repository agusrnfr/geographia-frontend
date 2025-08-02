import { Component, ElementRef, ViewChild } from '@angular/core';
import {
    FormGroup,
    FormControl,
    Validators,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { UserService } from '../user.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, A11yModule],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({
                    opacity: 0,
                }),
                animate('400ms ease-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                animate(
                    '400ms ease-in',
                    style({
                        opacity: 0,
                    })
                ),
            ]),
        ]),
    ],
})
export class ChangePasswordComponent {
    changePasswordForm: FormGroup;
    submitted = false;

    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLParagraphElement>;

    constructor(private router: Router, private userService: UserService) {
        this.changePasswordForm = new FormGroup(
            {
                actual_password: new FormControl('', [
                    Validators.required,
                    Validators.minLength(8),
                ]),
                new_password: new FormControl('', [
                    Validators.required,
                    Validators.minLength(8),
                ]),
                confirmPassword: new FormControl('', [Validators.required]),
            },
            { validators: this.matchPasswordsValidator }
        );
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.firstFocusElement.nativeElement.focus();
        }, 0);
    }

    matchPasswordsValidator(group: AbstractControl): ValidationErrors | null {
        const newPass = group.get('new_password')?.value;
        const confirm = group.get('confirmPassword')?.value;

        return newPass !== confirm ? { passwordMismatch: true } : null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.changePasswordForm.valid) {
            const { actual_password, new_password } =
                this.changePasswordForm.value;
            this.userService
                .changePassword(actual_password, new_password)
                .subscribe({
                    next: () => {
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
                            title: 'Cambio de contraseña exitoso',
                        });
                    },
                    error: (error) => {
                        if (error.status == 404) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Usuario no encontrado',
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
                        } else if (error.status == 400) {
                            if (
                                error.error.error ==
                                'Actual password is incorrect'
                            )
                                Swal.fire({
                                    icon: 'error',
                                    title: 'La contraseña actual es incorrecta',
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
                            else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'La nueva contraseña no puede ser igual a la actual',
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
                            }
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error al procesar la solicitud.',
                                text: 'Ocurrió un error inesperado. Por favor, intentá de nuevo.',
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
        }
    }

    cancel() {
        this.router.navigate(['/map']);
    }
}

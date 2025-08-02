import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormGroup,
    FormControl,
    Validators,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { UserService } from '../user.service';
import { A11yModule } from '@angular/cdk/a11y';
import { ResetService } from '../reset.service';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-edit-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, A11yModule],
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.css'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                animate('400ms ease-in', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class EditProfileComponent implements OnInit {
    editProfileForm: FormGroup;
    selectedImagePreview: string | null = null;
    selectedImageFile: File | null = null;
    imageError: string | null = null;
    apiUrl: string = environment.apiUrl.slice(0, -4);

    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLParagraphElement>;

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor(
        private router: Router,
        private userService: UserService,
        private resetService: ResetService
    ) {
        this.editProfileForm = new FormGroup({
            first_name: new FormControl('', [
                Validators.required,
                Validators.minLength(2),
                Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
            ]),
            last_name: new FormControl('', [
                Validators.required,
                Validators.minLength(2),
                Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/),
            ]),
            email: new FormControl('', [
                Validators.required,
                Validators.email,
                Validators.maxLength(50),
            ]),
            birth_date: new FormControl('', [
                Validators.required,
                this.minAgeValidator(13),
            ]),
            profile_image: new FormControl(null),
        });
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

    ngOnInit(): void {
        setTimeout(() => {
            this.firstFocusElement.nativeElement.focus();
        }, 0);

        this.userService.getCurrentUser().subscribe({
            next: (data: any) => {
                this.editProfileForm.patchValue({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    birth_date: data.birth_date.slice(0, 10),
                });

                if (data.profile_image_url) {
                    if (
                        !environment.production ||
                        data.profile_image_url.includes('default_profile.jpg')
                    ) {
                        this.selectedImagePreview =
                            this.apiUrl + data.profile_image_url;
                    } else {
                        this.selectedImagePreview = data.profile_image_url;
                    }
                }
            },
            error: (err) => {
                console.error('Error al obtener el usuario', err);
            },
        });
    }

    onFileChange(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

            if (!validTypes.includes(file.type)) {
                this.imageError = 'La imagen debe ser JPG, JPEG o PNG.';
                this.editProfileForm.patchValue({
                    profile_image: null,
                });
                return;
            }

            this.imageError = null;
            this.selectedImageFile = file;
            this.editProfileForm.patchValue({ profile_image: file });

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.selectedImagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    handleKeyPress(event: KeyboardEvent) {
        const keys = ['Enter'];
        if (keys.includes(event.key)) {
            event.preventDefault();
            this.fileInput.nativeElement.click();
        }
    }

    onSubmit() {
        if (this.editProfileForm.valid) {
            const formData = new FormData();
            formData.append(
                'first_name',
                this.editProfileForm.get('first_name')?.value
            );
            formData.append(
                'last_name',
                this.editProfileForm.get('last_name')?.value
            );
            formData.append('email', this.editProfileForm.get('email')?.value);
            formData.append(
                'birth_date',
                this.editProfileForm.get('birth_date')?.value
            );

            if (this.selectedImageFile) {
                formData.append('profile_image', this.selectedImageFile);
            }

            this.userService.updateProfile(formData).subscribe({
                next: () => {
                    this.router.navigate(['/map']);
                    this.resetService.resetComponentTrigger();
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
                        title: 'Actualización de datos exitosa',
                    });
                },
                error: (err) =>
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al procesar la solicitud',
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
                    }),
            });
        }
    }

    cancelEdit() {
        this.router.navigate(['/map']);
    }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { ResetService } from '../reset.service';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-delete-confirmation',
    imports: [A11yModule],
    templateUrl: './delete-confirmation.component.html',
    styleUrl: './delete-confirmation.component.css',
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
export class DeleteConfirmationComponent {
    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLParagraphElement>;

    constructor(
        private router: Router,
        private userService: UserService,
        private resetService: ResetService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.firstFocusElement.nativeElement.focus();
        }, 0);
    }

    cancel() {
        this.router.navigate(['/map']);
    }

    deleteProfile() {
        this.userService.deleteProfile().subscribe({
            next: () => {
                this.authService.logout();
                this.resetService.resetComponentTrigger();
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
                    title: 'Eliminación de perfil exitoso.',
                });
            },
            error: (error) => {
                console.error('Error deleting user:', error);
            },
        });
    }
}

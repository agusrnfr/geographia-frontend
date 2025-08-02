import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { ResetService } from '../reset.service';
import Swal from 'sweetalert2';
import { LocationService } from '../location.service';

@Component({
    selector: 'app-delete-confirmation',
    imports: [A11yModule],
    templateUrl: './delete-location-confirmation.component.html',
    styleUrl: './delete-location-confirmation.component.css',
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
export class DeleteLocationConfirmationComponent {
    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLParagraphElement>;

    locationId!: number;

    constructor(
        private router: Router,
        private resetService: ResetService,
        private locationService: LocationService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.firstFocusElement.nativeElement.focus();
        }, 0);
        this.route.queryParams.subscribe((params) => {
            this.locationId = +params['locationId'];
        });
    }

    cancel() {
        this.router.navigate(
            [
                '/map',
                {
                    outlets: {
                        modal: null,
                        popup: ['location'],
                    },
                },
            ],
            {
                queryParams: { locationId: this.locationId },
            }
        );
        this.resetService.resetComponentTrigger();
    }

    deleteLocation() {
        this.locationService.deleteLocation(this.locationId).subscribe({
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
                    title: 'Eliminación de locación exitosa.',
                });
                this.resetService.resetComponentTrigger();
            },
            error: (error) => {
                console.error('Error deleting location:', error);
            },
        });
    }
}

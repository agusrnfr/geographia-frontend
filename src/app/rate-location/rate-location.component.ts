import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { LocationService } from '../location.service';
import Swal from 'sweetalert2';
import { ResetService } from '../reset.service';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
    standalone: true,
    selector: 'app-rate-location',
    imports: [A11yModule, CommonModule],
    templateUrl: './rate-location.component.html',
    styleUrls: ['./rate-location.component.css'],
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
export class RateLocationComponent {
    hoveredRating: number | null = null;
    selectedRating: number = 0;
    locationId!: number;
    clicked: boolean = false;
    update: boolean = false;

    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLHeadElement>;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private locationService: LocationService,
        private resetService: ResetService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.firstFocusElement.nativeElement.focus();
        }, 0);
        this.route.queryParams.subscribe((params) => {
            this.locationId = +params['locationId'];
        });

        this.locationService.getMyRating(this.locationId).subscribe({
            next: (location) => {
                if (location && location.score) {
                    this.selectedRating = location.score;
                    this.update = true;
                }
            },
            error: (error) => {},
        });
    }

    setRating(rating: number) {
        if (!this.clicked) {
            this.selectedRating = rating;
        }
    }

    clickedRating(rating: number) {
        this.selectedRating = rating;
        this.clicked = true;
    }

    clearHover() {
        this.hoveredRating = null;
    }

    isFilled(star: number) {
        const rating = this.hoveredRating ?? this.selectedRating;
        return rating >= star;
    }

    confirmRating() {
        if (this.update) {
            this.locationService
                .updateRating(this.locationId, this.selectedRating)
                .subscribe(() => {
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
                        title: 'Actualización de puntaje exitosa.',
                    });
                    this.resetService.resetComponentTrigger();
                });
        } else {
            this.locationService
                .addRating(this.locationId, this.selectedRating)
                .subscribe(() => {
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
                        title: 'Elección de puntaje confirmado.',
                    });
                    this.resetService.resetComponentTrigger();
                });
        }
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
}

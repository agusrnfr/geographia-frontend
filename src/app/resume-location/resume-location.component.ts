import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { LocationService } from '../location.service';
import { Location } from '../models/location.model';

@Component({
    selector: 'app-resume-location',
    imports: [],
    templateUrl: './resume-location.component.html',
    styleUrl: './resume-location.component.css',
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
export class ResumeLocationComponent {
    location: Location | null = null;

    constructor(
        private router: Router,
        private locationService: LocationService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.locationService
                .getLocationById(+params['locationId'])
                .subscribe((location) => {
                    this.location = location;
                });
        });
    }

    goToLocationDetails(): void {
        this.router.navigate(
            [
                '/map',
                {
                    outlets: {
                        popup: ['location'],
                    },
                },
            ],
            {
                queryParams: {
                    locationId: this.location?.id,
                },
            }
        );
    }

    cancel(): void {
        this.router.navigate(['/map']);
    }
}

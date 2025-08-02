import {
    Component,
    ElementRef,
    ViewChild,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { LocationService } from '../location.service';
import { Location, LocationType } from '../models/location.model';
import { environment } from '../../environments/environment';
import { TypeService } from '../type.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-list-locations',
    standalone: true,
    imports: [A11yModule, CommonModule],
    templateUrl: './list-locations.component.html',
    styleUrl: './list-locations.component.css',
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
export class ListLocationsComponent implements OnInit, OnDestroy {
    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLHeadingElement>;

    locations: Location[] = [];
    filteredLocations: Location[] = [];
    paginatedLocations: Location[] = [];

    currentPage: number = 1;
    pageSize: number = 5;
    totalPages: number = 1;
    protected apiUrl = environment.apiUrl.slice(0, -4);
    type: LocationType = LocationType.SATELITE;

    private typeSub!: Subscription;

    constructor(
        private router: Router,
        private locationService: LocationService,
        private typeService: TypeService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.firstFocusElement.nativeElement.focus();
        }, 0);

        this.locationService.getAllLocations().subscribe({
            next: (response) => {
                this.locations = response;
                this.typeSub = this.typeService
                    .getCurrentType()
                    .subscribe((type) => {
                        this.applyFilter(type);
                        this.type = type;
                    });
            },
        });
    }

    applyFilter(type: string): void {
        if (type === 'SATÉLITE') {
            this.filteredLocations = [...this.locations];
        } else {
            this.filteredLocations = this.locations.filter(
                (loc) => loc.type?.toLowerCase() === type.toLowerCase()
            );
        }

        this.totalPages = Math.max(
            1,
            Math.ceil(this.filteredLocations.length / this.pageSize)
        );
        this.currentPage = 1;
        this.updatePaginatedLocations();
    }

    updatePaginatedLocations(): void {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedLocations = this.filteredLocations.slice(start, end);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedLocations();
        }
    }

    cancel(): void {
        this.router.navigate(['/map']);
    }

    goToLocation(locationId: number): void {
        this.router.navigate(['/map', { outlets: { popup: ['location'] } }], {
            queryParams: { locationId },
        });
    }

    ngOnDestroy(): void {
        this.typeSub?.unsubscribe();
    }
}

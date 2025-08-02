import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { LocationService } from '../location.service';
import { Location, LocationType } from '../models/location.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
    selector: 'app-search-bar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.css'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'scaleY(0.85)',
                    transformOrigin: 'top left',
                }),
                animate(
                    '400ms ease-out',
                    style({ opacity: 1, transform: 'scaleY(1)' })
                ),
            ]),
            transition(':leave', [
                animate(
                    '400ms ease-in',
                    style({
                        opacity: 0,
                        transform: 'scaleY(0.85)',
                        transformOrigin: 'top left',
                    })
                ),
            ]),
        ]),
    ],
})
export class SearchBarComponent implements OnInit, OnDestroy {
    searchTerm = '';
    showDropdown = false;
    private blurTimeout: any;

    recentSearches: Location[] = [];
    searchResults: Location[] = [];

    private searchInput$ = new Subject<string>();
    private subscriptions = new Subscription();

    protected apiUrl = environment.apiUrl.slice(0, -4);

    constructor(
        private locationService: LocationService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadRecentSearches();

        this.subscriptions.add(
            this.searchInput$.pipe(debounceTime(300)).subscribe((term) => {
                if (term.trim().length > 0) {
                    this.locationService
                        .searchLocations(term)
                        .subscribe((results) => {
                            console.log('Search results:', results);
                            this.searchResults = results.map(
                                (location: Location) => ({
                                    ...location,
                                    images: !environment.production
                                        ? location.images.map(
                                              (image) => this.apiUrl + image
                                          )
                                        : location.images,
                                })
                            );
                        });
                } else {
                    this.searchResults = [];
                }
            })
        );
    }

    onInputChange() {
        this.searchInput$.next(this.searchTerm);
    }

    selectItem(location: Location) {
        this.searchTerm = location.name;
        this.addToRecents(location);
        this.showDropdown = false;
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
                    locationId: location?.id,
                },
            }
        );
        this.searchTerm = '';
    }

    addToRecents(location: Location): void {
        const existingIndex = this.recentSearches.findIndex(
            (r) => r.id === location.id
        );
        if (existingIndex !== -1) {
            this.recentSearches.splice(existingIndex, 1);
        }
        this.recentSearches.unshift(location);
        this.recentSearches = this.recentSearches.slice(0, 5);
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(
                'recentSearches',
                JSON.stringify(this.recentSearches)
            );
        }
    }

    loadRecentSearches(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            const stored = localStorage.getItem('recentSearches');
            if (stored) {
                this.recentSearches = JSON.parse(stored);
            }
        }
    }

    onWrapperFocus() {
        clearTimeout(this.blurTimeout);
        this.showDropdown = true;
    }

    onWrapperBlur() {
        this.blurTimeout = setTimeout(() => {
            this.showDropdown = false;
        }, 200);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}

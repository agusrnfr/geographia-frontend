import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MapComponent as MglMapComponent,
    ControlComponent,
    PopupComponent,
    AttributionControlDirective,
    FullscreenControlDirective,
    GeolocateControlDirective,
    NavigationControlDirective,
    ScaleControlDirective,
    GeoJSONSourceComponent,
    LayerComponent,
} from 'ngx-mapbox-gl';
import { MapMouseEvent } from 'mapbox-gl';
import { MglMapResizeDirective } from '../mgl-map-resize.directive';
import { trigger, style, transition, animate } from '@angular/animations';
import { NavigationEnd, Router } from '@angular/router';
import { MapTypesListComponent } from '../map-types-list/map-types-list.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ProfileIconComponent } from '../profile-icon/profile-icon.component';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import {
    bboxPolygon,
    booleanPointInPolygon,
    difference,
    featureCollection,
    point,
} from '@turf/turf';
import { HttpClient } from '@angular/common/http';
import { ButtonListLocationsComponent } from '../button-list-locations/button-list-locations.component';
import { ButtonAddLocationComponent } from '../button-add-location/button-add-location.component';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';
import { LoginButtonComponent } from '../login-button/login-button.component';
import { AddLocationComponent } from '../add-location/add-location.component';
import { Location, LocationType } from '../models/location.model';
import { LocationService } from '../location.service';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { TypeService } from '../type.service';
import { UserService } from '../user.service';
import { MapboxService } from '../mapbox.service';

@Component({
    selector: 'app-map',
    imports: [
        MglMapComponent,
        PopupComponent,
        CommonModule,
        MglMapResizeDirective,
        ControlComponent,
        AttributionControlDirective,
        FullscreenControlDirective,
        GeolocateControlDirective,
        NavigationControlDirective,
        MapTypesListComponent,
        SearchBarComponent,
        ProfileIconComponent,
        RouterOutlet,
        GeoJSONSourceComponent,
        LayerComponent,
        ButtonListLocationsComponent,
        ButtonAddLocationComponent,
        LoginButtonComponent,
    ],
    templateUrl: './map.component.html',
    styleUrl: './map.component.css',
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
export class MapComponent {
    popup: { coordinates: [number, number] } | null = null;
    private routerSub!: Subscription;
    maskGeoJSON: any;
    isLoggedIn: boolean = false;
    private authSub!: Subscription;
    protected apiUrl = environment.apiUrl.slice(0, -4);
    isBrowser: boolean;
    private typeSub!: Subscription;
    selectedType: LocationType = LocationType.SATELITE;
    locations: Location[] = [];
    filteredLocations: Location[] = [];
    mapStyle: string = 'mapbox://styles/mapbox/standard';

    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLDivElement>;

    argentinaBounds: [[number, number], [number, number]] = [
        [-73.5, -56.0],
        [-52.5, -20.0],
    ];

    constructor(
        private router: Router,
        private http: HttpClient,
        private authService: AuthService,
        private locationService: LocationService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private typeService: TypeService,
        private userService: UserService,
        private mapboxService: MapboxService
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    ngOnInit() {
        this.authSub = this.authService.isLoggedIn$.subscribe((loggedIn) => {
            this.isLoggedIn = loggedIn;
        });

        if (
            this.isLoggedIn &&
            this.isBrowser &&
            !sessionStorage.getItem('location-sent')
        ) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    this.mapboxService
                        .reverseGeocode(longitude, latitude)
                        .subscribe({
                            next: (response) => {
                                if (
                                    response?.features?.length > 0 &&
                                    response.features[0].properties?.context
                                        ?.place?.name
                                ) {
                                    const place =
                                        response.features[0].properties.context
                                            .place.name;
                                    const region =
                                        response.features[0].properties.context
                                            .region?.name || '';
                                    const address = `${place}, ${region}`;

                                    this.userService
                                        .saveCurrentLocation(address)
                                        .subscribe({
                                            next: () => {
                                                sessionStorage.setItem(
                                                    'location-sent',
                                                    'true'
                                                );
                                            },
                                            error: (err) => {
                                                console.error(
                                                    'Error al enviar ubicación:',
                                                    err
                                                );
                                            },
                                        });
                                } else {
                                    console.warn(
                                        'No se pudo obtener dirección'
                                    );
                                }
                            },
                            error: (err) => {
                                console.error(
                                    'Error obteniendo dirección:',
                                    err
                                );
                            },
                        });
                },
                (error) => {
                    console.warn('Ubicación no disponible:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                }
            );
        }

        this.locationService.getAllLocations().subscribe((locations) => {
            this.locations = locations.map((location: Location) => ({
                ...location,
                images: !environment.production
                    ? location.images.map((img) => {
                          return this.apiUrl + img;
                      })
                    : location.images,
            }));
            this.filterLocations(this.selectedType);
        });

        this.typeSub = this.typeService.getCurrentType().subscribe((type) => {
            this.selectedType = type;
            this.filterLocations(type);

            switch (type) {
                case LocationType.SATELITE:
                    this.mapStyle = 'mapbox://styles/mapbox/outdoors-v12';
                    break;
                case LocationType.RURAL:
                    this.mapStyle =
                        'mapbox://styles/mapbox/satellite-streets-v12';
                    break;
                case LocationType.GEOGRAFICA:
                    this.mapStyle =
                        'mapbox://styles/ationno/cmdrr2mla000801s2hxgn57r0';
                    break;
                case LocationType.HISTORICA:
                    this.mapStyle =
                        'mapbox://styles/ationno/cmdrr5wsp00lm01qpbjfrfhsl';
                    break;
                default:
                    this.mapStyle = 'mapbox://styles/mapbox/standard';
            }
        });

        this.http.get('argentina-mask.geojson').subscribe((argentina: any) => {
            const world = bboxPolygon([-180, -90, 180, 90]);
            this.maskGeoJSON = difference(
                featureCollection([world, ...argentina.features])
            );
        });

        this.routerSub = this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event) => {
                if (this.router.url === '/map') {
                    setTimeout(() => {
                        this.firstFocusElement.nativeElement.focus();
                    }, 0);
                }
            });
    }

    ngOnDestroy() {
        this.authSub?.unsubscribe();
        this.routerSub?.unsubscribe();
        this.typeSub?.unsubscribe();
    }

    filterLocations(type: LocationType) {
        if (type === LocationType.SATELITE) {
            this.filteredLocations = [...this.locations];
        } else {
            this.filteredLocations = this.locations.filter(
                (loc) => loc.type === type
            );
        }
    }

    onMapClick(event: mapboxgl.MapMouseEvent) {
        this.http.get('argentina-mask.geojson').subscribe((argentina: any) => {
            const clickedPoint = point([event.lngLat.lng, event.lngLat.lat]);

            const withinArgentina = argentina.features.some((feature: any) =>
                booleanPointInPolygon(clickedPoint, feature)
            );

            if (!withinArgentina) {
                return;
            }

            if (this.popup) {
                this.popup = null;
            } else {
                this.popup = {
                    coordinates: [event.lngLat.lng, event.lngLat.lat],
                };
            }
        });
    }

    ngAfterViewInit() {
        if (typeof document !== 'undefined') {
            setTimeout(() => {
                const canvas = document.querySelector('.mapboxgl-canvas');
                if (canvas) {
                    canvas.setAttribute(
                        'aria-label',
                        'Mapa interactivo de Geographia'
                    );
                }

                const fullscreenBtn = document.querySelector(
                    '.mapboxgl-ctrl-fullscreen'
                );
                if (fullscreenBtn) {
                    fullscreenBtn.setAttribute(
                        'aria-label',
                        'Control de pantalla completa'
                    );
                    const fullscreenIcon = fullscreenBtn.querySelector(
                        '.mapboxgl-ctrl-icon'
                    );
                    if (fullscreenIcon) {
                        fullscreenIcon.setAttribute(
                            'title',
                            'Pantalla completa'
                        );
                    }
                }

                const geolocateBtn = document.querySelector(
                    '.mapboxgl-ctrl-geolocate'
                );
                if (geolocateBtn) {
                    geolocateBtn.setAttribute(
                        'aria-label',
                        'Ubicar mi posición'
                    );
                    const geolocateIcon = geolocateBtn.querySelector(
                        '.mapboxgl-ctrl-icon'
                    );
                    if (geolocateIcon) {
                        geolocateIcon.setAttribute(
                            'title',
                            'Ubicar mi posición'
                        );
                    }
                }

                const zoomInBtn = document.querySelector(
                    '.mapboxgl-ctrl-zoom-in'
                );
                if (zoomInBtn) {
                    zoomInBtn.setAttribute('aria-label', 'Acercar zoom');
                    const zoomInIcon = zoomInBtn.querySelector(
                        '.mapboxgl-ctrl-icon'
                    );
                    if (zoomInIcon) {
                        zoomInIcon.setAttribute('title', 'Acercar zoom');
                    }
                }

                const zoomOutBtn = document.querySelector(
                    '.mapboxgl-ctrl-zoom-out'
                );
                if (zoomOutBtn) {
                    zoomOutBtn.setAttribute('aria-label', 'Alejar zoom');
                    const zoomOutIcon = zoomOutBtn.querySelector(
                        '.mapboxgl-ctrl-icon'
                    );
                    if (zoomOutIcon) {
                        zoomOutIcon.setAttribute('title', 'Alejar zoom');
                    }
                }

                const compass = document.querySelector(
                    '.mapboxgl-ctrl-compass'
                );
                if (compass) {
                    compass.setAttribute('aria-label', 'Reorientar mapa');
                    const compassIcon = compass.querySelector(
                        '.mapboxgl-ctrl-icon'
                    );
                    if (compassIcon) {
                        compassIcon.setAttribute('title', 'Reorientar mapa');
                    }
                }
            }, 100);
        }
    }

    addLocation() {
        if (this.isLoggedIn) {
            this.router.navigate(
                [
                    '/map',
                    {
                        outlets: {
                            popup: ['addLocation'],
                        },
                    },
                ],
                {
                    queryParams: {
                        lat: this.popup?.coordinates[1],
                        lng: this.popup?.coordinates[0],
                    },
                }
            );
            this.popup = null;
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Inicio de sesión requerido',
                text: 'Para realizar esta acción, por favor, inicie sesión.',
                timerProgressBar: true,
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    popup: 'montserrat-swal',
                    closeButton: 'montserrat-close',
                },
            });
        }
    }

    goToLocation(locationId: number) {
        this.router.navigate(
            [
                '/map',
                {
                    outlets: {
                        popup: ['resumeLocation'],
                    },
                },
            ],
            {
                queryParams: {
                    locationId: locationId,
                },
            }
        );
    }
}

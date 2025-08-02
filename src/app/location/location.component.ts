import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { LocationService } from '../location.service';
import { Location } from '../models/location.model';
import { User } from '../models/user.model';
import { UserService } from '../user.service';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { ResetService } from '../reset.service';
import { MapboxService } from '../mapbox.service';
import { Comment } from '../models/comment.model';

@Component({
    selector: 'app-location',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, A11yModule],
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.css'],
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
export class LocationComponent implements OnInit {
    currentImageIndex = 0;
    myRating: number = 0;
    commentForm!: FormGroup;
    handleProfileHover: ReturnType<typeof setTimeout> | null = null;

    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLParagraphElement>;

    @ViewChild('commentsContainer')
    commentsContainer!: ElementRef<HTMLDivElement>;

    location: Location | null = null;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private locationService: LocationService,
        private userService: UserService,
        private resetService: ResetService,
        private mapboxService: MapboxService
    ) {}

    userLoggedIn: User | null = null;
    userCreator: User | null = null;
    protected apiUrl = environment.apiUrl.slice(0, -4);

    comments: Comment[] = [];

    ngOnInit(): void {
        this.commentForm = this.fb.group({
            text: ['', [Validators.required, Validators.maxLength(500)]],
        });

        this.route.queryParams.subscribe((params) => {
            console.log('Query Params:', params);
            setTimeout(() => {
                this.firstFocusElement.nativeElement.focus();
            }, 0);
            const locationId = +params['locationId'];
            this.locationService.getLocationById(locationId).subscribe({
                next: (location) => {
                    location.averageRating = Math.ceil(
                        Number(location.averageRating)
                    );
                    location.createdAt = new Date(location.createdAt);
                    this.location = location;

                    if (
                        !environment.production &&
                        this.location &&
                        this.location.images
                    ) {
                        this.location.images = this.location.images.map(
                            (image) => this.apiUrl + image
                        );
                    }

                    this.userService
                        .getUserById(location.UserId)
                        .subscribe((user) => {
                            this.userCreator = user;
                            if (this.userCreator) {
                                if (
                                    !environment.production ||
                                    this.userCreator.profile_image_url.includes(
                                        'default_profile.jpg'
                                    )
                                ) {
                                    this.userCreator.profile_image_url =
                                        this.apiUrl +
                                        this.userCreator.profile_image_url;
                                }
                            }
                        });
                },
                error: () => {
                    const recentSearchesStr =
                        localStorage.getItem('recentSearches');
                    if (recentSearchesStr) {
                        const recentSearches = JSON.parse(recentSearchesStr);
                        const updatedSearches = recentSearches.filter(
                            (item: any) => item.id !== locationId
                        );
                        localStorage.setItem(
                            'recentSearches',
                            JSON.stringify(updatedSearches)
                        );
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al acceder a la locación',
                        text: 'Ocurrió un error al momento de acceder a la locación. Puede que la locación haya sido eliminada o no exista.',
                        timer: 4000,
                        timerProgressBar: true,
                        showCloseButton: true,
                        showConfirmButton: false,
                        customClass: {
                            popup: 'montserrat-swal',
                            closeButton: 'montserrat-close',
                        },
                    });
                    this.router.navigate(['/map']);
                    this.resetService.resetComponentTrigger();
                },
            });

            this.locationService.getComments(locationId).subscribe({
                next: (comments) => {
                    this.comments = comments.map((c: any) => ({
                        ...c,
                        user_profile_image_url:
                            !environment.production ||
                            c.user_profile_image_url.includes(
                                'default_profile.jpg'
                            )
                                ? this.apiUrl + c.user_profile_image_url
                                : c.user_profile_image_url,
                        createdAt: new Date(c.createdAt),
                    }));
                },
                error: (error) => {
                    if (error.status === 404) {
                        this.comments = [];
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al cargar los comentarios',
                            text: 'Ocurrió un error al cargar los comentarios. Por favor, intentá de nuevo más tarde.',
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

            this.locationService
                .getMyRating(locationId)
                .subscribe((location) => {
                    if (location && location.score) {
                        this.myRating = location.score;
                    }
                });
        });

        this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.userLoggedIn = {
                    ...user,
                    profile_image_url:
                        !environment.production ||
                        user?.profile_image_url.includes('default_profile.jpg')
                            ? this.apiUrl + user?.profile_image_url
                            : user?.profile_image_url,
                };
            },
            error: () => {
                this.userLoggedIn = null;
            },
        });
    }

    nextImage() {
        const imagesLength = this.location?.images?.length ?? 0;
        if (imagesLength > 0) {
            this.currentImageIndex =
                (this.currentImageIndex + 1) % imagesLength;
        }
    }

    prevImage() {
        const imagesLength = this.location?.images?.length ?? 0;
        if (imagesLength > 0) {
            this.currentImageIndex =
                (this.currentImageIndex - 1 + imagesLength) % imagesLength;
        }
    }

    selectImage(index: number) {
        this.currentImageIndex = index;
    }

    onSubmitComment() {
        if (this.commentForm.invalid) return;

        const commentText = this.commentForm.value.text.trim();
        if (!commentText) return;

        if (!navigator.geolocation) {
            console.warn('Geolocalización no soportada');
            this.saveComment(commentText, 'Ubicación no compartida');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                console.log('Coordenadas obtenidas:', latitude, longitude);

                this.mapboxService
                    .reverseGeocode(longitude, latitude)
                    .subscribe({
                        next: (response) => {
                            if (response?.features?.length > 0) {
                                const address =
                                    response.features[0].properties.context
                                        .place.name +
                                    ', ' +
                                    response.features[0].properties.context
                                        .region.name;

                                this.saveComment(commentText, address);
                            } else {
                                console.warn('No se pudo obtener la dirección');
                                this.saveComment(
                                    commentText,
                                    'Ubicación no compartida'
                                );
                            }
                        },
                        error: (err) => {
                            console.warn('Error obteniendo dirección:', err);
                            this.saveComment(
                                commentText,
                                'Ubicación no compartida'
                            );
                        },
                    });
            },
            (error) => {
                console.warn('Ubicación no compartida o error:', error);
                this.saveComment(commentText, 'Ubicación no compartida');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    }

    saveComment(text: string, address: string) {
        if (!this.userLoggedIn) {
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
            return;
        }

        this.locationService
            .addComment(this.location!.id, text, address)
            .subscribe({
                next: (comment) => {
                    comment.createdAt = new Date(comment.createdAt);
                    comment.user_first_name =
                        this.userLoggedIn?.first_name || '';
                    comment.user_last_name = this.userLoggedIn?.last_name || '';
                    comment.user_profile_image_url =
                        this.userLoggedIn?.profile_image_url;
                    if (!this.userLoggedIn?.show_location) {
                        comment.comment_address = 'Ubicación no compartida';
                    }
                    this.comments.push(comment);
                    this.commentForm.reset();

                    setTimeout(() => {
                        if (this.commentsContainer) {
                            const container =
                                this.commentsContainer.nativeElement;
                            container.scrollTop = container.scrollHeight + 55;
                        }
                    }, 100);
                },
                error: (err) => {
                    console.error('Error al agregar comentario:', err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al agregar comentario',
                        text: 'Ocurrió un error al agregar el comentario. Por favor, intentá de nuevo más tarde.',
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

    cancel() {
        this.router.navigate(['/map']);
    }

    deleteLocation() {
        this.router.navigate(
            [
                '/map',
                {
                    outlets: {
                        popup: ['location'],
                        modal: ['deleteLocationConfirmation'],
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

    handleProfileHoverEnter(event: Event, userId: number) {
        if (this.handleProfileHover) {
            clearTimeout(this.handleProfileHover);
            this.handleProfileHover = null;
        }

        this.handleProfileHover = setTimeout(() => {
            const element = event.target as HTMLElement;

            if (!element || typeof element.getBoundingClientRect !== 'function')
                return;

            const rect = element.getBoundingClientRect();
            const elemX = rect.left + rect.width / 2;
            const elemY = rect.top;

            this.router.navigate(
                [
                    '/map',
                    {
                        outlets: {
                            popup: ['location'],
                            modal: ['profileResume'],
                        },
                    },
                ],
                {
                    queryParams: {
                        userId,
                        locationId: this.location?.id,
                        elemX,
                        elemY,
                    },
                }
            );
        }, 500);
    }

    rateLocation() {
        this.router.navigate(
            [
                '/map',
                {
                    outlets: {
                        popup: ['location'],
                        modal: ['rateLocation'],
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
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { MapboxService } from '../mapbox.service';
import { catchError, finalize, of, Subject } from 'rxjs';
import { ViewChild, ElementRef } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { LocationService } from '../location.service';
import { ResetService } from '../reset.service';
import Swal from 'sweetalert2';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-add-location',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, A11yModule],
    templateUrl: './add-location.component.html',
    styleUrls: ['./add-location.component.css'],
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
export class AddLocationComponent {
    @ViewChild('tagInputElement')
    tagInputElement!: ElementRef<HTMLInputElement>;

    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLParagraphElement>;

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    addLocationForm: FormGroup;
    selectedImages: File[] = [];
    lat!: number | null;
    lng!: number | null;
    selectedImagePreviews: string[] = [];
    isAccesibility: boolean = false;
    imageError: boolean = false;

    tags: string[] = [];
    isEditingTags = false;
    tagInputControl = new FormControl('');

    addressSuggestions: any[] = [];
    showSuggestions: boolean = false;
    private addressInput$ = new Subject<string>();
    isAddressSelected = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private mapboxService: MapboxService,
        private locationService: LocationService,
        private resetService: ResetService
    ) {
        this.addLocationForm = new FormGroup({
            name: new FormControl('', [Validators.required]),
            address: new FormControl('', [Validators.required]),
            latitude: new FormControl(null, [Validators.required]),
            longitude: new FormControl(null, [Validators.required]),
            images: new FormControl([], [Validators.required]),
            tags: new FormControl([]),
            details: new FormControl(''),
            type: new FormControl('', [Validators.required]),
        });
    }

    ngOnInit() {
        setTimeout(() => {
            this.firstFocusElement.nativeElement.focus();
        }, 0);

        this.route.queryParams.subscribe((params) => {
            this.lat = +params['lat'];
            this.lng = +params['lng'];

            if (this.lat === -1 || this.lng === -1) {
                this.isAccesibility = true;
                this.lat = null;
                this.lng = null;
            }
        });

        this.fetchAddress();

        this.addLocationForm.patchValue({
            latitude: this.lat,
            longitude: this.lng,
        });

        if (this.isAccesibility) {
            this.addressInput$
                .pipe(
                    debounceTime(300),
                    switchMap((query) => {
                        if (!query.trim()) return of([]);
                        return this.mapboxService.forwardGeocode(query);
                    }),
                    catchError(() => of([]))
                )
                .subscribe((res: any) => {
                    this.addressSuggestions = res?.features || [];
                    console.log(
                        'Address suggestions:',
                        this.addressSuggestions
                    );
                    this.showSuggestions = true;
                });
        }
    }

    handleKeyPress(event: KeyboardEvent) {
        const keys = ['Enter'];
        if (keys.includes(event.key)) {
            event.preventDefault();
            this.fileInput.nativeElement.click();
        }
    }

    fetchAddress(): void {
        if (!this.lat || !this.lng) {
            return;
        }

        this.mapboxService
            .reverseGeocode(this.lng, this.lat)
            .pipe(
                catchError((error) => {
                    console.error('Geocoding error:', error);
                    return of(null);
                }),
                finalize(() => {})
            )
            .subscribe((response) => {
                if (response?.features?.length > 0) {
                    const address =
                        response.features[0].properties.full_address;
                    this.addLocationForm.patchValue({ address });
                }
            });
    }

    closeAddLocation() {
        this.router.navigate(['/map']);
    }

    onFileChange(event: any) {
        const files: FileList = event.target.files;
        if (files.length > 0) {
            for (const file of files) {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

                if (!validTypes.includes(file.type)) {
                    this.imageError = true;
                    this.addLocationForm.patchValue({
                        images: null,
                    });
                    return;
                }
            }
            this.imageError = false;
            this.selectedImages = Array.from(files);
            this.addLocationForm.patchValue({
                images: this.selectedImages,
            });
            this.addLocationForm.get('images')?.updateValueAndValidity();

            this.selectedImagePreviews = [];
            for (const file of this.selectedImages) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.selectedImagePreviews.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    onSubmit() {
        const lat = this.addLocationForm.get('latitude')?.value;
        const lng = this.addLocationForm.get('longitude')?.value;
        console.log('Lat:', lat, 'Lng:', lng);
        if (!lat || !lng) {
            console.error('Latitud y longitud son obligatorias');
            this.addLocationForm.get('address')?.setErrors({
                invalidLocation: true,
            });
            return;
        }

        if (this.addLocationForm.valid) {
            const data: FormData = new FormData();
            data.append('name', this.addLocationForm.get('name')?.value);
            data.append('address', this.addLocationForm.get('address')?.value);
            data.append(
                'latitude',
                this.addLocationForm.get('latitude')?.value.toString()
            );
            data.append(
                'longitude',
                this.addLocationForm.get('longitude')?.value.toString()
            );
            if (this.addLocationForm.get('details')?.value) {
                data.append(
                    'details',
                    this.addLocationForm.get('details')?.value
                );
            }
            data.append('type', this.addLocationForm.get('type')?.value);
            if (this.tags.length > 0) {
                data.append('tags', JSON.stringify(this.tags));
            }
            this.selectedImages.forEach((image) => {
                data.append('images', image, image.name);
            });

            this.locationService.addLocation(data).subscribe({
                next: (response) => {
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
                        title: 'Locación agregada exitosamente.',
                    });
                },
                error: (error) => {
                    console.error('Error al agregar locación:', error);
                    if (error.status == 409) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al agregar locación',
                            text: 'No se puede agregar una locacion tan cerca de otra existente.',
                            timer: 4000,
                            timerProgressBar: true,
                            showCloseButton: true,
                            showConfirmButton: false,
                            customClass: {
                                popup: 'montserrat-swal',
                                closeButton: 'montserrat-close',
                            },
                        });
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

    onTagsFocus() {
        this.isEditingTags = true;
        this.tagInputControl.setValue(
            this.tags.map((tag) => `#${tag}`).join(' ')
        );
    }

    onTagsBlur() {
        const raw = this.tagInputControl.value || '';

        if (!raw.includes('#')) {
            this.isEditingTags = false;
            return;
        }

        const parsed = raw
            .split('#')
            .map((t) => t.trim())
            .filter((t) => t !== '');

        this.tags = parsed;
        this.addLocationForm.get('tags')?.setValue(this.tags);
        this.isEditingTags = false;
    }

    deleteTag(index: number) {
        this.tags.splice(index, 1);
        this.addLocationForm.get('tags')?.setValue(this.tags);
    }

    enableTagEdit() {
        this.isEditingTags = true;
        setTimeout(() => {
            this.tagInputElement.nativeElement.focus();
        }, 0);
    }

    onAddressInput() {
        const value = this.addLocationForm.get('address')?.value;
        if (this.isAccesibility && value) {
            this.addressInput$.next(value);
        }
    }

    onAddressFocus() {
        this.showSuggestions = true;
    }

    onAddressBlur() {
        setTimeout(() => {
            const activeEl = document.activeElement;

            const suggestionList = document.querySelector(
                '.address-suggestions'
            );
            if (suggestionList?.contains(activeEl)) {
                return;
            }

            this.showSuggestions = false;

            const lat = this.addLocationForm.get('latitude')?.value;
            const lng = this.addLocationForm.get('longitude')?.value;

            if (!lat || !lng) {
                this.addLocationForm.get('address')?.setErrors({
                    invalidLocation: true,
                });
            } else {
                this.addLocationForm.get('address')?.setErrors(null);
            }
        }, 150);
    }

    selectSuggestion(suggestion: any) {
        const { full_address, coordinates } = suggestion.properties;
        this.addLocationForm.patchValue({
            address: full_address,
            latitude: coordinates['latitude'],
            longitude: coordinates['longitude'],
        });
        this.showSuggestions = false;
        this.isAddressSelected = true; // ✅ Importante
    }

    clearSelectedAddress() {
        this.addLocationForm.patchValue({
            address: '',
            latitude: null,
            longitude: null,
        });

        this.isAddressSelected = false;
        this.showSuggestions = false;
        setTimeout(() => {
            const addressInput = document.getElementById(
                'address'
            ) as HTMLInputElement;
            addressInput?.focus();
        }, 0);
    }
}

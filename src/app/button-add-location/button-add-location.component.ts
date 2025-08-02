import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-button-add-location',
    imports: [],
    templateUrl: './button-add-location.component.html',
    styleUrl: './button-add-location.component.css',
})
export class ButtonAddLocationComponent {
    isLoggedIn: boolean = false;
    private authSub!: Subscription;

    constructor(private router: Router, private authService: AuthService) {}

    ngOnInit() {
        this.authSub = this.authService.isLoggedIn$.subscribe((loggedIn) => {
            this.isLoggedIn = loggedIn;
        });
    }

    openAddLocations() {
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
                        lat: -1,
                        lng: -1,
                    },
                }
            );
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
}

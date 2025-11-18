import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
@Component({
    selector: 'app-profile-icon',
    imports: [CommonModule],
    templateUrl: './profile-icon.component.html',
    styleUrl: './profile-icon.component.css',
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
export class ProfileIconComponent {
    visibleMenu = false;
    user: User | null = null;
    apiUrl = environment.apiUrl.slice(0, -4);
    constructor(
        private elementRef: ElementRef,
        private router: Router,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.user = {
                    ...user,
                    profile_image_url:
                        !environment.production ||
                        user?.profile_image_url.includes('default_profile.jpg')
                            ? this.apiUrl + user.profile_image_url
                            : user.profile_image_url,
                };
            },
            error: (error) => {
                console.error('Error fetching user data:', error);
            },
        });
    }

    toggleMenu() {
        this.visibleMenu = !this.visibleMenu;
    }

    @HostListener('document:click', ['$event.target'])
    onClickOutside(target: HTMLElement) {
        const clickedInside = this.elementRef.nativeElement.contains(target);
        if (!clickedInside) {
            this.visibleMenu = false;
        }
    }

    editProfile() {
        this.router.navigate(['/map', { outlets: { popup: ['editProfile'] } }]);
    }

    changePassword() {
        this.router.navigate([
            '/map',
            { outlets: { popup: ['changePassword'] } },
        ]);
    }

    privacity() {
        this.router.navigate([
            '/map',
            { outlets: { popup: ['privacySettings'] } },
        ]);
    }

    closeSesion() {
        this.router.navigate(['/map', { outlets: { popup: ['closeSesion'] } }]);
    }

    deleteProfile() {
        this.router.navigate([
            '/map',
            { outlets: { popup: ['deleteConfirmation'] } },
        ]);
    }

    preferences() {
        this.router.navigate(['/map', { outlets: { popup: ['preferences'] } }]);
    }
}

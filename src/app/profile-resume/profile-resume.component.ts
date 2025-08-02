import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { ResetService } from '../reset.service';
import Swal from 'sweetalert2';
import { LocationService } from '../location.service';
import { UserService } from '../user.service';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-profile-resume',
    imports: [A11yModule, CommonModule],
    templateUrl: './profile-resume.component.html',
    styleUrl: './profile-resume.component.css',
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
export class ProfileResumeComponent {
    user: User | null = null;
    locationId!: number;
    apiUrl = environment.apiUrl.slice(0, -4);

    @ViewChild('firstFocusElement', { static: true })
    firstFocusElement!: ElementRef<HTMLParagraphElement>;

    @ViewChild('resumeProfileContainer', { static: true })
    resumeProfileContainer!: ElementRef<HTMLDivElement>;

    constructor(
        private router: Router,
        private userService: UserService,
        private route: ActivatedRoute
    ) {}

    parseLocalDate(dateString: string): Date {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const x = +params['elemX'];
            const y = +params['elemY'];
            this.locationId = +params['locationId'];
            const userId = +params['userId'];

            this.userService.getUserById(userId).subscribe((user) => {
                user.createdAt = new Date(user.createdAt);

                if (user.show_birth_date) {
                    user.birth_date = this.parseLocalDate(user.birth_date);
                }
                this.user = {
                    ...user,
                    profile_image_url:
                        !environment.production ||
                        user?.profile_image_url.includes('default_profile.jpg')
                            ? this.apiUrl + user.profile_image_url
                            : user.profile_image_url,
                };
                console.log('User data:', this.user);
            });

            if (this.resumeProfileContainer) {
                const container = this.resumeProfileContainer.nativeElement;
                container.style.position = 'fixed';
                container.style.left = `${x}px`;
                container.style.top = `${y - 24}px`;
                container.style.transform = 'translateX(-50%)';
            }

            setTimeout(() => {
                this.firstFocusElement.nativeElement.focus();
            }, 0);
        });
    }

    handleProfileHoverLeave() {
        setTimeout(() => {
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
        }, 500);
    }

    cancel() {}
}

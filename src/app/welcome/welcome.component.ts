import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common'; // update this
import { Router } from '@angular/router';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {
    images: string[] = [
        'Andes.jpg',
        'Iguazu.jpg',
        'Nahuel.jpg',
        'Perito.jpg',
        'Salta.jpg',
    ];

    isBrowser = signal(false);

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router
    ) {
        this.isBrowser.set(isPlatformBrowser(platformId));
    }

    currentImage: string = this.images[0];
    currentIndex = 0;

    ngOnInit(): void {
        this.cycleBackground();
    }

    cycleBackground(): void {
        if (this.isBrowser()) {
            setInterval(() => {
                this.currentIndex =
                    (this.currentIndex + 1) % this.images.length;
                this.currentImage = this.images[this.currentIndex];
            }, 6000);
        }
    }

    map() {
        this.router.navigate(['/map']);
    }
}

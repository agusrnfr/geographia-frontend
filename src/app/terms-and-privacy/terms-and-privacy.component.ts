import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-terms-and-privacy',
    imports: [],
    templateUrl: './terms-and-privacy.component.html',
    styleUrl: './terms-and-privacy.component.css',
})
export class TermsAndPrivacyComponent {
    @ViewChild('privacySection') privacySection!: ElementRef;

    scrollToPrivacySection(event: Event): void {
        event.preventDefault();
        if (this.privacySection) {
            this.privacySection.nativeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }
}

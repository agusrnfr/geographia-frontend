import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-button-list-locations',
    imports: [],
    templateUrl: './button-list-locations.component.html',
    styleUrl: './button-list-locations.component.css',
})
export class ButtonListLocationsComponent {
    constructor(private router: Router) {}

    openListLocations() {
        this.router.navigate([
            '/map',
            { outlets: { popup: ['listLocations'] } },
        ]);
    }
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResetService } from './reset.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    title = 'Frontend';
    showComponent = true;
    constructor(private resetService: ResetService) {}

    ngOnInit() {
        this.resetService.onResetComponent().subscribe(() => {
            this.resetComponent();
        });
    }

    resetComponent() {
        this.showComponent = false;
        setTimeout(() => (this.showComponent = true), 10);
    }
}

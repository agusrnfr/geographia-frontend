import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-button',
    imports: [],
    templateUrl: './login-button.component.html',
    styleUrl: './login-button.component.css',
})
export class LoginButtonComponent {
    constructor(private router: Router) {}

    goToLogin() {
        this.router.navigate(['/login']);
    }
}

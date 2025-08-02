import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { CodeVerificationComponent } from '../code-verification/code-verification.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
    selector: 'app-recover-password',
    standalone: true,
    imports: [
        CommonModule,
        ForgotPasswordComponent,
        CodeVerificationComponent,
        ResetPasswordComponent,
    ],
    templateUrl: './recover-password.component.html',
    styleUrls: ['./recover-password.component.css'],
})
export class RecoverPasswordComponent {
    step: 'email' | 'code' | 'reset' = 'email';
    email = '';
    token = '';

    onEmailSubmitted(email: string) {
        this.email = email;
        this.step = 'code';
    }

    onCodeVerified() {
        this.step = 'reset';
    }

    onPasswordReset() {
        this.step = 'email';
    }

    onTokenReceived(token: string) {
        this.token = token;
    }
}

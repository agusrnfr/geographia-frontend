import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = environment.apiUrl + '/auth';
    private loggedIn!: BehaviorSubject<boolean>;
    isLoggedIn$!: Observable<boolean>;

    constructor(
        private http: HttpClient,
        private cookieService: CookieService
    ) {
        this.loggedIn = new BehaviorSubject<boolean>(this.hasToken());
        this.isLoggedIn$ = this.loggedIn.asObservable();
    }

    register(user: FormData): Observable<any> {
        return this.http.post(this.apiUrl + '/register', user);
    }

    login(email: string, password: string): Observable<any> {
        const post = this.http.post(this.apiUrl + '/login', {
            email,
            password,
        });

        post.subscribe({
            next: () => {
                this.loggedIn.next(true);
            },
        });

        return post;
    }

    logout(): void {
        this.cookieService.delete('token', '/');
        if (
            typeof window !== 'undefined' &&
            typeof sessionStorage !== 'undefined'
        ) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('location-sent');
        }

        this.loggedIn.next(false);
    }

    hasToken(): boolean {
        const hasSessionToken =
            typeof window !== 'undefined' &&
            typeof sessionStorage !== 'undefined' &&
            sessionStorage.getItem('token') !== null;

        const hasCookieToken = this.cookieService.check('token');

        return hasSessionToken || hasCookieToken;
    }

    getToken(): string | null {
        if (
            typeof window !== 'undefined' &&
            typeof sessionStorage !== 'undefined'
        ) {
            const sessionToken = sessionStorage.getItem('token');
            if (sessionToken) return sessionToken;
        }

        return this.cookieService.check('token')
            ? this.cookieService.get('token')
            : null;
    }

    requestPasswordReset(email: string): Observable<any> {
        return this.http.post(this.apiUrl + '/request-password-reset', {
            email,
        });
    }

    verifyCode(token: string, code: string): Observable<any> {
        return this.http.post(this.apiUrl + '/verify-code', { token, code });
    }

    resetPassword(token: string, newPassword: string): Observable<any> {
        return this.http.post(this.apiUrl + '/reset-password', {
            token,
            newPassword,
        });
    }
}

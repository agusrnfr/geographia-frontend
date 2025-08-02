import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = environment.apiUrl + '/users';
    private token: string | null = null;

    constructor(private http: HttpClient, private authService: AuthService) {}

    getCurrentUser(): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.get(this.apiUrl + '/me', {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    updateProfile(user: FormData): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.put(this.apiUrl + '/me', user, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    updatePrivacySettings(data: FormData): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.put(this.apiUrl + '/me/privacy', data, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    changePassword(
        actual_password: string,
        new_password: string
    ): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.put(
            this.apiUrl + '/me/password',
            { actual_password, new_password },
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            }
        );
    }

    deleteProfile(): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.delete(this.apiUrl + '/me', {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    getUserById(userId: number): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.get(`${this.apiUrl}/profile/${userId}`, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    saveCurrentLocation(address: string): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.put(
            this.apiUrl + '/me/location',
            { address },
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            }
        );
    }
}

import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LocationService {
    private apiUrl = environment.apiUrl + '/locations';
    private apiUrlComments = environment.apiUrl + '/comments';
    private token: string | null = null;

    constructor(private http: HttpClient, private authService: AuthService) {}

    addLocation(data: FormData): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.post(this.apiUrl + '/create', data, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    getAllLocations(): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.get(this.apiUrl + '/all', {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    getLocationById(id: number): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.get(`${this.apiUrl}/location/${id}`, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    searchLocations(query: string): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.get(`${this.apiUrl}/search`, {
            headers: { Authorization: `Bearer ${this.token}` },
            params: { q: query },
        });
    }

    deleteLocation(id: number): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.delete(`${this.apiUrl}/location/${id}`, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    addComment(
        locationId: number,
        comment_text: string,
        comment_address: string
    ): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.post(
            `${this.apiUrlComments}/${locationId}`,
            {
                comment_text,
                comment_address,
            },
            {
                headers: { Authorization: `Bearer ${this.token}` },
            }
        );
    }

    getComments(locationId: number): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.get(`${this.apiUrlComments}/${locationId}`, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    getMyRating(locationId: number): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.get(`${this.apiUrl}/location/${locationId}/rate`, {
            headers: { Authorization: `Bearer ${this.token}` },
        });
    }

    addRating(locationId: number, score: number): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.post(
            `${this.apiUrl}/location/${locationId}/rate`,
            { score },
            {
                headers: { Authorization: `Bearer ${this.token}` },
            }
        );
    }

    updateRating(locationId: number, score: number): Observable<any> {
        this.token = this.authService.getToken();
        return this.http.put(
            `${this.apiUrl}/location/${locationId}/rate`,
            { score: score },
            {
                headers: { Authorization: `Bearer ${this.token}` },
            }
        );
    }
}

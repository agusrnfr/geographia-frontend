import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationType } from './models/location.model';

@Injectable({ providedIn: 'root' })
export class TypeService {
    private currentType$ = new BehaviorSubject<LocationType>(
        LocationType.SATELITE
    );

    setCurrentType(type: LocationType): void {
        this.currentType$.next(type);
    }

    getCurrentType(): Observable<LocationType> {
        return this.currentType$.asObservable();
    }
}

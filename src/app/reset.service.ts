import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResetService {
    private resetComponent$ = new Subject<void>();

    resetComponentTrigger() {
        this.resetComponent$.next();
    }

    onResetComponent() {
        return this.resetComponent$.asObservable();
    }
}

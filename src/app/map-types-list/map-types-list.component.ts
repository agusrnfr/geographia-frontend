import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { LocationType } from '../models/location.model';
import { TypeService } from '../type.service';

@Component({
    selector: 'app-map-types-list',
    imports: [CommonModule],
    templateUrl: './map-types-list.component.html',
    styleUrl: './map-types-list.component.css',
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({
                    opacity: 0,
                    transform: 'scaleY(0.85)',
                    transformOrigin: 'top left',
                }),
                animate(
                    '400ms ease-out',
                    style({ opacity: 1, transform: 'scaleY(1)' })
                ),
            ]),
            transition(':leave', [
                animate(
                    '400ms ease-in',
                    style({
                        opacity: 0,
                        transform: 'scaleY(0.85)',
                        transformOrigin: 'top left',
                    })
                ),
            ]),
        ]),
    ],
})
export class MapTypesListComponent {
    openMenu = false;
    mapTypes = Object.values(LocationType);
    selectedType: string = 'SATÉLITE';
    selectedAnnouncement: string =
        'Tipo de mapa seleccionado actualmente: SATÉLITE';

    constructor(private typeService: TypeService) {}

    toggleMenu() {
        this.openMenu = !this.openMenu;

        if (this.openMenu) {
            this.selectedAnnouncement = '';
            setTimeout(() => {
                this.selectedAnnouncement = `Tipo de mapa seleccionado actualmente: ${this.selectedType}`;
            }, 100);
        }
    }

    selectType(type: LocationType) {
        this.selectedType = type;
        this.typeService.setCurrentType(type);
    }

    getEnumKeyByValue<T extends object>(
        enumObj: T,
        value: string
    ): keyof T | undefined {
        return (Object.keys(enumObj) as Array<keyof T>).find(
            (key) => enumObj[key] === value
        );
    }

    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.openMenu = false;
            setTimeout(() => {
                const button = document.querySelector('.manage_search');
                if (button instanceof HTMLElement) {
                    button.focus();
                }
            }, 0);
        }
    }
}

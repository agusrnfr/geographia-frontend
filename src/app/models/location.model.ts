export interface Location {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    images: String[];
    details?: string;
    type: LocationType;
    tags?: string[];
    createdAt: Date;
    averageRating: number;
    UserId: number;
}

export enum LocationType {
    SATELITE = 'SATÉLITE',
    RURAL = 'RURAL',
    GEOGRAFICA = 'GEOGRÁFICA',
    HISTORICA = 'HISTÓRICA',
}

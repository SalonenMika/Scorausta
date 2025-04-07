export interface Kentta {
    id: number;
    nimi: string;
}

export interface Vayla {
    id: number;
    kentta_id: number;
    numero: number;
    pituus: number;
    par: number;
    hcp: number;
}

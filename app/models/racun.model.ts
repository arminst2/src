export class IRacun {
    public racunId!: number;
    public brojRacuna!: string;
    public klijentId!: number;
    public klijentNaziv?: string;

    public korisnikId!: number;
    public datum!: Date;
    public datumRacuna!: Date;
    public datumDospjeca!: Date;
    public skladisteUlazId!: number;
    public skladisteIzlazId!: number;
    public skladisteId!: number;
    public nazivSkladista! : string;
    public nazivSkladistaUlaz! : string;
    public nazivSkladistaIzlaz! : string;
    public nazivVrstePlacanja! :string;
    public nazivValute! :string;
    public evidencijskiBroj!: string;
    public fisbroj!: string;
    public iznosRacuna!: number;
    public iznosPoreza!: number;
    public iznosSaPdv!: number;
    public kupacId!: number;
    public nazivKupca!:string;
    public vrstaPlacanjaId!: number;
    public godina!: number;
    public dokumentId!: number;
    public valutaId!: number;
    public placen: boolean = false;
    public napomena!: string;
    public brojDobavljaca!:string;
    public dobavljacNaziv!:string;
    public zakljucan!:Boolean;
    public nabavniIznos!:number;
    public marzaIznos!:number;
}
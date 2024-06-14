export class IOtpremnica{
  public otpremnicaId!: number;
  public brojOtpremnice!: string;
  public klijentId!: number;
  public klijentNaziv?: string;

  public korisnikId!: number;
  public datum!: Date;
  public datumOtpremnice!: Date;
  public datumDospjeca!: Date;
  public skladisteIzlazId!: number;
  public nazivSkladista! : string;
  public nazivVrstePlacanja! :string;
  public nazivValute! :string;
  public evidencijskiBroj!: string;
  public fisbroj!: string;
  public iznosRacuna!: number;
  public iznosPoreza!: number;
  public iznosSaPdv!: number;
  public kupacId!: number;
  public vrstaPlacanjaId!: number;
  public godina!: number;
  public dokumentId!: number;
  public valutaId!: number;
  public placen: boolean = false;
  public napomena!: string;
  public brojDobavljaca!:string;
}

import { Component, OnInit } from '@angular/core';
import { IOtpremnica } from '../models/otpremnica.model';
import { IRacun } from '../models/racun.model';
import { IStavka } from '../models/stavka.model';
import { User } from '../models/user.model';
import { RacunService } from '../services/racun.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StavkaService } from '../services/stavka.service';
import { SkladisteService } from '../services/skladiste.service';
import { ArtiklService } from '../services/artikl.service';
import { JedinicamjereService } from '../services/jedinicamjere.service';
import { VrstaplacanjaService } from '../services/vrstaplacanja.service';
import { CustomerService } from '../services/customer.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-otpremnica',
  templateUrl: './otpremnica.component.html',
  styleUrls: ['./otpremnica.component.css']
})
export class OtpremnicaComponent implements OnInit {
  public otpremnice: IRacun[] = [];
  public otpremniceDB: IRacun[] = [];
  closeResult: string = '';
  otpremnica!: IOtpremnica;
  currUser!: User;
  idOtpremnice: number = 0;
  //pageing
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  promiseOtpremnice: any;
  promiseStavke: any;

  idDokumenta: number = 3;
  public stavkeBaza: IStavka[] = [];
  public stavkeBazaPrikaz: IStavka[] = [];
  public skladista: any[] = [];
  public kupci: any[] = [];
  public vrstePlacanja: any[] = [];
  public artikli: any[] = [];
  public jediniceMjere: any[] = [];

  dateDatumRacuna = new FormControl();

  klijentId: number = 0;
  korisnikId: number = 0;

  constructor(
    private _racunService: RacunService,
    private _stavkaService: StavkaService,
    private _skladisteService: SkladisteService,
    private _artiklService: ArtiklService,
    private _jediniceMjereService: JedinicamjereService,
    private _vrstaPlacanjaService: VrstaplacanjaService,
    private _kupacService: CustomerService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getData()
  }

  async getData() {
    this.getTokens();
    await this.getSkladista();
    await this.getVrstePlacanja();
    await this.getKupce();
    await this.getOtpremnice();
    await this.getArtikli();
    await this.getJediniceMjere();
    await this.getStavke();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getSkladista() {
    this.skladista = await this._skladisteService.getSkladistePromise(this.klijentId);
  }

  async getVrstePlacanja() {
    this.vrstePlacanja = await this._vrstaPlacanjaService.getVrstaPromise(this.klijentId);
  }

  async getKupce() {
    this.kupci = await this._kupacService.getCustomersPromise(this.klijentId);
  }

  async getOtpremnice() {
    this.otpremnice = await this._racunService.getRacuniPromise(this.klijentId, this.idDokumenta);
    this.otpremnice.map(racun => {
      racun.nazivSkladista = this.skladista.find(skladiste => skladiste.skladisteId == racun.skladisteId)!.naziv
      racun.nazivVrstePlacanja = this.vrstePlacanja.find(vrsta => vrsta.vrstaPlacanjaId == racun.vrstaPlacanjaId)!.naziv
      racun.nazivKupca = this.kupci.find(k => k.kupacId == racun.kupacId)!.naziv!;
    })
    this.otpremniceDB = this.otpremnice;
    console.log(this.otpremnice);
  }

  async getArtikli() {
    this.artikli = await this._artiklService.getArtikliPromise(this.klijentId);
  }

  async getJediniceMjere() {
    this.jediniceMjere = await this._jediniceMjereService.getJedinicaMjerePromise();
  }

  async getStavke() {
    this.stavkeBaza = await this._stavkaService.getStavkePromise(this.klijentId);
    this.stavkeBaza.map(stavka => {
      var artikl = this.artikli.find(artikl => artikl.artiklId == stavka.artiklId)
      stavka.nazivArtikla = artikl!.naziv
      stavka.sifraArtikla = artikl!.sifra
      stavka.vpc = artikl!.vpc
      stavka.mpc = artikl!.mpc
      stavka.jedMjere = artikl!.jedinicaMjereId
      var jedinica = this.jediniceMjere.find(jedinica => jedinica.jedinicaMjereId == stavka.jedMjere)
      stavka.jedMjereNaziv = jedinica!.naziv
    })
  }

  async DeleteOtpremnica() {
    await this._racunService.deleteRacunPromise(this.idOtpremnice);
    this.getOtpremnice();
    this.modalService.dismissAll();
  }

  filterPoNazivu(pretraga: any) {
    this.otpremnice = this.otpremniceDB.filter(obj => obj.nazivKupca.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  filterDatumRacuna() {
    this.otpremnice = this.otpremniceDB.filter(obj =>
      new Date(obj.datumRacuna).getUTCDate() == this.dateDatumRacuna.value.getDate()
      && new Date(obj.datumRacuna).getUTCMonth() == this.dateDatumRacuna.value.getUTCMonth()
      && new Date(obj.datumRacuna).getUTCFullYear() == this.dateDatumRacuna.value.getUTCFullYear());
  }

  clearFilterDatumRacuna() {
    this.dateDatumRacuna = new FormControl();
    this.otpremnice = this.otpremniceDB;
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  Get(content: any, id: any) {
    this.idOtpremnice = id;
    this.stavkeBazaPrikaz = this.stavkeBaza.filter(obj => obj.racunId == this.idOtpremnice);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  Delete(content2: any, item: IRacun) {
    this.idOtpremnice = item.racunId;
    this.modalService.open(content2, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}

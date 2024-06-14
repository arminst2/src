import { Component, OnInit } from '@angular/core';
import { IRacun } from '../models/racun.model';
import { RacunService } from '../services/racun.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IStavka } from '../models/stavka.model';
import { StavkaService } from '../services/stavka.service';
import { SkladisteService } from '../services/skladiste.service';
import { ArtiklService } from '../services/artikl.service';
import { JedinicamjereService } from '../services/jedinicamjere.service';
import { User } from '../models/user.model';
import { VrstaplacanjaService } from '../services/vrstaplacanja.service';
import { CustomerService } from '../services/customer.service';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-outputs',
  templateUrl: '/outputs.component.html',
  styleUrls: ['/outputs.component.css']
})
export class OutputsComponent implements OnInit {
  public racuni: IRacun[] = [];
  public racuniDB: IRacun[] = [];
  public skladista: any[] = [];
  public vrstePlacanja: any[] = [];
  public kupci: any[] = [];
  public jediniceMjere: any[] = [];
  public artikli: any[] = [];
  public stavke: any[] = [];
  public stavkeDB: IStavka[] = [];
  closeResult: string = '';
  racun!: IRacun;
  currUser!: User;
  idRacuna: number = 0;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  promiseRacuni: any;
  promiseStavke: any;

  klijentId: number = 0;
  korisnikId: number = 0;

  idDokumenta: number = 1;

  dateDatumRacuna = new FormControl();

  constructor(
    private _racunService: RacunService,
    private modalService: NgbModal,
    private _stavkaService: StavkaService,
    private _skladisteService: SkladisteService,
    private _artiklService: ArtiklService,
    private _jediniceMjereService: JedinicamjereService,
    private _vrstaPlacanjaService: VrstaplacanjaService,
    private _kupacService: CustomerService) {
  }

  ngOnInit(): void {
    this.getData();
    this.getStavke();

  }
  async getData() {
    await this.getTokens();
    await this.getSkladista();
    await this.getVrstePlacanja();
    await this.getKupci();
    await this.getRacuni();
    await this.getJediniceMjere();
    await this.getArtikli();
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

  async getKupci() {
    this.kupci = await this._kupacService.getCustomersPromise(this.klijentId);
  }

  async getRacuni() {
    this.racuni = await this._racunService.getRacuniPromise(this.klijentId, this.idDokumenta);
    this.racuni.map(racun => {
      racun.nazivSkladista = this.skladista.find(skladiste => skladiste.skladisteId == racun.skladisteId)!.naziv
      racun.nazivVrstePlacanja = this.vrstePlacanja.find(vrsta => vrsta.vrstaPlacanjaId == racun.vrstaPlacanjaId)!.naziv
      racun.nazivKupca = this.kupci.find(k => k.kupacId == racun.kupacId)!.naziv!;
    })
    this.racuniDB = this.racuni;
  }

  async getJediniceMjere() {
    this.jediniceMjere = await this._jediniceMjereService.getJedinicaMjerePromise();
  }

  async getArtikli() {
    this.artikli = await this._artiklService.getArtikliPromise();
  }

  async getStavke() {
    this.stavke = await this._stavkaService.getStavkePromise(this.klijentId, this.idDokumenta);
    this.stavke.map(stavka => {
      var article = this.artikli.find(a => a.artiklId == stavka.artiklId);
      if (article != null) {
        stavka.nazivArtikla = article.naziv;
        stavka.sifraArtikla = article.sifra;
        stavka.vpc = article.vpc;
        stavka.mpc = article.mpc;
        stavka.jedMjere = article.jedinicaMjereId;
        if (article.jedinicaMjereId != null) {
          stavka.jedMjereNaziv = this.jediniceMjere.find(jm => jm.jedinicaMjereId == article!.jedinicaMjereId) == undefined ? "" : this.jediniceMjere.find(jm => jm.jedinicaMjereId == article!.jedinicaMjereId)!.naziv;;
        }
      }
    });
    this.stavkeDB = this.stavke;
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  filterPoNazivu(pretraga: any) {
    this.racuni = this.racuniDB.filter(obj => obj.nazivKupca.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  filterDatumRacuna() {
    this.racuni = this.racuniDB.filter(obj => new Date(obj.datumRacuna).getUTCDate() == this.dateDatumRacuna.value.getDate()
      && new Date(obj.datumRacuna).getUTCMonth() == this.dateDatumRacuna.value.getUTCMonth()
      && new Date(obj.datumRacuna).getUTCFullYear() == this.dateDatumRacuna.value.getUTCFullYear());
  }

  clearFilterDatumRacuna() {
    this.dateDatumRacuna = new FormControl();
    this.racuni = this.racuniDB;
  }

  async DeleteRacun() {
    await this._racunService.deleteRacunPromise(this.idRacuna);
    await this.getRacuni();
    this.modalService.dismissAll();
  }

  /**Modal GetItems */
  Get(content: any, id: any) {
    this.idRacuna = id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  Delete(content2: any, item: IRacun) {
    this.idRacuna = item.racunId;
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

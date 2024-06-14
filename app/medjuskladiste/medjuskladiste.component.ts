import { Component, OnInit } from '@angular/core';
import { IRacun } from '../models/racun.model';
import { RacunService } from '../services/racun.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IStavka } from '../models/stavka.model';
import { StavkaService } from '../services/stavka.service';
import { ArtiklService } from '../services/artikl.service';
import { IArtikl } from '../models/artikl.model';
import { SkladisteService } from '../services/skladiste.service';
import { VrstaplacanjaService } from '../services/vrstaplacanja.service';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { JedinicamjereService } from '../services/jedinicamjere.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-medjuskladiste',
  templateUrl: './medjuskladiste.component.html',
  styleUrls: ['./medjuskladiste.component.css']
})
export class MedjuskladisteComponent implements OnInit {
  public racuni: IRacun[] = [];
  public racuniDB: IRacun[] = [];
  closeResult: string = '';
  racun!: IRacun;
  idRacuna: number = 0;
  idStavke: number = 0;
  stavkaEditID: number = 0;
  public stavke: IStavka[] = [];
  public stavkeDB: IStavka[] = [];
  brisanje: boolean = false;
  public dodavanje: boolean = false;
  public artikli: IArtikl[] = [];
  EditeStavka!: IStavka;
  artikl: any;
  currUser!: User;
  idDokumenta: number = 4;

  skladista: any = [];
  vrstePlacanja: any = [];
  jediniceMjere: any = [];

  dateDatumRacuna = new FormControl();

  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  promiseStavke: any;
  racunNaziv: any;

  klijentId: number = 0;
  korisnikId: number = 0;

  constructor(
    private _racunService: RacunService,
    private modalService: NgbModal,
    private _stavkaService: StavkaService,
    private _artiklService: ArtiklService,
    private _skladisteService: SkladisteService,
    private _vrstaPlacanjaService: VrstaplacanjaService,
    private _jediniceMjereService: JedinicamjereService) { }

  ngOnInit(): void {
    this.setDefaults();
    this.getData()
  }
  setDefaults() {
    this.artikl = null;
    this.racun = new IRacun();
  }
  async getData() {
    this.getTokens();
    await this.getSkladista();
    await this.getVrstePlacanja();
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

  async getRacuni() {
    this.racuni = await this._racunService.getRacuniPromise(this.klijentId, this.idDokumenta);
    this.racuni.map(r => {
      r.nazivSkladistaUlaz = this.skladista.find(skladiste => skladiste.skladisteId == r.skladisteUlazId)!.naziv;
      r.nazivSkladistaIzlaz = this.skladista.find(skladiste => skladiste.skladisteId == r.skladisteIzlazId)!.naziv;
      r.nazivVrstePlacanja = this.vrstePlacanja.find(vrsta => vrsta.vrstaPlacanjaId == r.vrstaPlacanjaId)!.naziv;
    })
    this.racuniDB = this.racuni;
  }

  async getJediniceMjere() {
    this.jediniceMjere = await this._jediniceMjereService.getJedinicaMjerePromise();
  }

  async getArtikli() {
    this.artikli = await this._artiklService.getArtikliPromise(this.klijentId);
  }

  async getStavke() {
    this.stavke = await this._stavkaService.getStavkePromise(this.klijentId, this.idDokumenta);
    this.stavke.map(stavka => {
      var article = this.artikli.find(artikal => artikal.artiklId == stavka.artiklId);
      if (article != null) {
        stavka.nazivArtikla = article.naziv;
        stavka.sifraArtikla = article.sifra;
        stavka.vpc = article.vpc;
        stavka.mpc = article.mpc;
        stavka.jedMjere = article.jedinicaMjereId;
        if (article.jedinicaMjereId != null) {
          stavka.jedMjereNaziv = this.jediniceMjere.find(jm => jm.jedinicaMjereId == article!.jedinicaMjereId) == undefined
            ? "" : this.jediniceMjere.find(jm => jm.jedinicaMjereId == article!.jedinicaMjereId)!.naziv;
        }
      }
    });
    this.stavkeDB = this.stavke;
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  filterPoNazivu(pretraga: any) {
    this.racuni = this.racuniDB.filter(obj => obj.dobavljacNaziv.toLowerCase().includes(pretraga.value.toLowerCase()));
  }

  filterDatumRacuna() {
    this.racuni = this.racuniDB.filter(obj =>
      new Date(obj.datumRacuna).getUTCDate() == this.dateDatumRacuna.value.getDate()
      && new Date(obj.datumRacuna).getUTCMonth() == this.dateDatumRacuna.value.getUTCMonth()
      && new Date(obj.datumRacuna).getUTCFullYear() == this.dateDatumRacuna.value.getUTCFullYear());
  }

  clearFilterDatumRacuna() {
    this.dateDatumRacuna = new FormControl();
    this.racuni = this.racuniDB;
  }

  async DeleteRacun() {
    await this._racunService.deleteRacunPromise(this.idRacuna);
    this.getRacuni();
    this.modalService.dismissAll();
  }

  async DeleteStavka() {
    await this._stavkaService.deleteStavkaPromise(this.idStavke);
    this.getStavke();
  }

  getArtiklById(id: any) {
    this.artikl = this.artikli.find(artikal => artikal.artiklId == id);
    this.modalService.dismissAll();
  }

  /**Modal Artikli */
  Artikli(contentArtikli: any) {
    this.modalService.open(contentArtikli, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal StavkaEdit */
  GetEdit(contentEdit: any, id: any) {

    this.modalService.open(contentEdit, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

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

  /**Modal Delete racun */
  Delete(content2: any, item: IRacun) {
    this.idRacuna = item.racunId;
    this.modalService.open(content2, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete stavka */
  Delete1(content3: any, item: IStavka) {
    this.idRacuna = item.racunId;
    this.idStavke = item.stavkeId;
    this.modalService.open(content3, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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

import { Component, OnInit } from '@angular/core';
import { IRacun } from '../models/racun.model';
import { RacunService } from '../services/racun.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from 'jquery';
import { IStavka } from '../models/stavka.model';
import { StavkaService } from '../services/stavka.service';
import { ArtiklService } from '../services/artikl.service';
import { IArtikl } from '../models/artikl.model';
import { SkladisteService } from '../services/skladiste.service';
import { VrstaplacanjaService } from '../services/vrstaplacanja.service';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { JedinicamjereService } from '../services/jedinicamjere.service';
import { map } from 'rxjs/operators';
import { CustomerService } from '../services/customer.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { FormControl } from '@angular/forms';



@Component({
  selector: 'app-inputs',
  templateUrl: '/inputs.component.html',
  styleUrls: ['/inputs.component.css']
})
export class InputsComponent implements OnInit {
  public racuni: IRacun[] = [];
  public racuniDB: IRacun[] = [];
  public stavkeBaza: IStavka[] = [];
  public artikli: IArtikl[] = [];
  public skladista: any[] = [];
  public vrstePlacanja: any[] = [];
  public kupci: any[] = [];
  public jediniceMjere: any[] = [];
  closeResult: string = '';
  racun!: IRacun;
  idRacuna: number = 0;
  idStavke: number = 0;
  stavkaEditID: number = 0;
  brisanje: boolean = false;
  public dodavanje: boolean = false;
  EditeStavka!: IStavka;
  artikl: any;
  currUser!: User;
  idDokumenta: number = 2;
  klijentId: number = 0;
  korisnikId: number = 0;

  dateDatumRacuna = new FormControl();

  //pageing
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  promiseStavke: any;
  //search
  racunNaziv: any;

  constructor(
    private _racunService: RacunService,
    private modalService: NgbModal,
    private _stavkaService: StavkaService,
    private _artiklService: ArtiklService,
    private _skladisteService: SkladisteService,
    private _vrstaPlacanjaService: VrstaplacanjaService,
    private _kupacService: CustomerService,
    private _korisnikService: UserService,
    private _jediniceMjereService: JedinicamjereService) {
    this.artikl = null;
    this.racun = new IRacun();
  }

  ngOnInit(): void {
    this.getData()
  }

  async getData() {
    await this.getTokens();
    await this.getCurrentUser();
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

  async getCurrentUser() {
    this.currUser = await this._korisnikService.getUserByIdPromise(this.korisnikId);
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
      racun.nazivSkladista = this.skladista.find(skladiste => skladiste.skladisteId == racun.skladisteId)?.naziv;
      racun.nazivVrstePlacanja = this.vrstePlacanja.find(vrsta => vrsta.vrstaPlacanjaId == racun.vrstaPlacanjaId)?.naziv;
      racun.dobavljacNaziv = this.kupci.find(kupac => kupac.kupacId == racun.kupacId)?.naziv;
    });
    this.racuniDB = this.racuni;
  }

  async getJediniceMjere() {
    this.jediniceMjere = await this._jediniceMjereService.getJedinicaMjerePromise();
  }

  async getArtikli() {
    this.artikli = await this._artiklService.getArtikliPromise();
  }

  async getStavke() {
    this.stavkeBaza = await this._stavkaService.getStavkePromise(this.klijentId, this.idDokumenta);
    this.stavkeBaza.map(stavka => {
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
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  filterPoNazivu(pretraga: any) {
    this.racunNaziv = pretraga.value;
    this.racuni = this.racuniDB.filter((racun: IRacun) => racun.dobavljacNaziv.toLowerCase().includes(this.racunNaziv.toLowerCase()));
  }

  filterDatumRacuna() {
    this.racuni = this.racuniDB.filter(obj => 
      new Date(obj.datumRacuna).getUTCDate() == this.dateDatumRacuna.value.getDate()
        && new Date(obj.datumRacuna).getUTCMonth() == this.dateDatumRacuna.value.getUTCMonth()
          && new Date(obj.datumRacuna).getUTCFullYear() == this.dateDatumRacuna.value.getUTCFullYear());
  }

  clearFilterDatumRacuna() {
    this.racuni = this.racuniDB;
    this.dateDatumRacuna = new FormControl();
  }

  async DeleteRacun() {
    await this._racunService.deleteRacunPromise(this.idRacuna).then(() => {
      this.modalService.dismissAll();
      this.racuni = []
      this.getRacuni();
    });
  }

  DeleteStavka() {
    return this._stavkaService.deleteStavka(this.idStavke)
      .subscribe(
        (result) => {
          window.location.reload();
        }
      );
  }

  getArtiklById(id: any) {
    this._artiklService.getArtiklById(id).subscribe(data => this.artikl = data);
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

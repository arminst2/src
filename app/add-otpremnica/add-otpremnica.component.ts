import { Component, OnInit } from '@angular/core';
import { IRacun } from '../models/racun.model';
import { Skladiste } from '../models/skladiste.model';
import { VrstaPlacanja } from '../models/vrstaplacanja.model';
import { Valuta } from '../models/valuta.model';
import { Customer } from '../models/customer.model';
import { User } from '../models/user.model';
import { RacunService } from '../services/racun.service';
import { SkladisteService } from '../services/skladiste.service';
import { Router } from '@angular/router';
import { VrstaplacanjaService } from '../services/vrstaplacanja.service';
import { ValutaService } from '../services/valuta.service';
import { CustomerService } from '../services/customer.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GradService } from '../services/grad.service';
import { Grad } from '../models/grad.model';

@Component({
  selector: 'app-add-otpremnica',
  templateUrl: './add-otpremnica.component.html',
  styleUrls: ['./add-otpremnica.component.css']
})
export class AddOtpremnicaComponent implements OnInit {
  closeResult: string = '';
  otpremnice: IRacun;
  skladista: Skladiste[] = [];
  vrstePlacanja: VrstaPlacanja[] = [];
  valute: Valuta[] = [];
  customers: Customer[] = [];
  customersDB: Customer[] = [];
  gradovi: Grad[] = [];
  dodavanje: boolean = false;
  datum1: Date;
  customer: any;
  brojDobavljaca: any;
  tempOtpremnica: IRacun;
  brojOtpremnice: any;
  ekstenzijaOtpremnice: any = "/" + new Date().getFullYear().toString();
  idDokumenta: number = 3; // idDokumenta 3 je za otpremnicu
  currUser!: User;
  klijentId: number = 0;
  korisnikId: number = 0;

  constructor(
    private _skladisteService: SkladisteService,
    private _racunService: RacunService,
    private router: Router,
    private _vrstaPlacanja: VrstaplacanjaService,
    private _valuteService: ValutaService,
    private _customerService: CustomerService,
    private modalService: NgbModal,
    private _gradService: GradService) {
  }

  filterPoNazivuKupac(pretraga: any) {
    this.customers = this.customersDB.filter(obj => obj.naziv?.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  ngOnInit(): void {
    this.setDefaults();
    this.getData();
  }

  setDefaults() {
    this.otpremnice = new IRacun();
    this.tempOtpremnica = new IRacun();
    this.datum1 = new Date();
    this.customer = null;
  }
  
  async getData() {
    this.getTokens();
    await this.setBrojRacuna();
    await this.getVrstePlacanja();
    await this.getValute();
    await this.getSkladista();
    await this.getGradovi();
    await this.getCustomers();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getVrstePlacanja() {
    this.vrstePlacanja = await this._vrstaPlacanja.getVrstaPromise(this.klijentId);
  }

  async getValute() {
    this.valute = await this._valuteService.getValutaPromise();
  }

  async getSkladista() {
    this.skladista = await this._skladisteService.getSkladistePromise(this.klijentId);
  }

  async getGradovi() {
    this.gradovi = await this._gradService.getGradoviPromise(this.klijentId);
  }

  async getCustomers() {
    this.customers = await this._customerService.getCustomersPromise(this.klijentId);
    this.customers.map(customer => {
      customer.gradNaziv = this.gradovi.find(f => f.gradId == customer.gradId)!.naziv;
    })
    this.customersDB = this.customers;
  }
  
  async setBrojRacuna() {
    let brojRacuna = await this._racunService.getZadnjiBrojURacunu(this.klijentId, this.idDokumenta);
    this.brojOtpremnice = (brojRacuna.zadnjiBrojRacuna + 1) + this.ekstenzijaOtpremnice
  }

  validationForm() {
    if (this.customer == null) {
      var elem = document.getElementById('kupacValidacija');
      elem!.style.display = "block";
    }
    if (!this.otpremnice.hasOwnProperty('skladisteId')) {
      var elem1 = document.getElementById('skladisteValidacija');
      elem1!.style.display = "block";
    }
    if (!this.otpremnice.hasOwnProperty('vrstaPlacanjaId')) {
      var elem2 = document.getElementById('vrstaPlacanjaValidacija');
      elem2!.style.display = "block";
    }
    if (!this.otpremnice.hasOwnProperty('valutaId')) {
      var elem3 = document.getElementById('valutaValidacija');
      elem3!.style.display = "block";
    }
    if (!this.otpremnice.hasOwnProperty('datumRacuna')) {
      var elem3 = document.getElementById('datumRacunaValidacija');
      elem3!.style.display = "block";
    }
    if (!this.otpremnice.hasOwnProperty('datumDospijeca')) {
      var elem3 = document.getElementById('datumDospijecaValidacija');
      elem3!.style.display = "block";
    }
  }

  async onSubmit() {
    this.otpremnice.kupacId = this.customer.kupacId;
    this.otpremnice.brojRacuna = this.brojOtpremnice
    this.otpremnice.datum = new Date();
    this.otpremnice.dokumentId = this.idDokumenta;
    this.otpremnice.skladisteId = this.otpremnice.skladisteId;
    this.otpremnice.iznosRacuna = 0;
    this.otpremnice.iznosPoreza = 0;
    this.otpremnice.iznosSaPdv = 0;
    this.tempOtpremnica = await this._racunService.addRacunPromise(this.otpremnice)
    let idOtpremnice = this.tempOtpremnica.racunId;
    this.router.navigate([`/adminpanel/editOtpremnica/${idOtpremnice}`]);
  }

  /**Modal GetStavke */
  Get(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
  getCustomerById(id: any) {
    this.customer = this.customers.find(f => f.kupacId == id);
    var elem = document.getElementById('kupacValidacija');
    elem!.style.display = "none";
    this.modalService.dismissAll();
  }

}

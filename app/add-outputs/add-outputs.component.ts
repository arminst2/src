import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Customer } from '../models/customer.model';
import { IRacun } from '../models/racun.model';
import { Skladiste } from '../models/skladiste.model';
import { User } from '../models/user.model';
import { Valuta } from '../models/valuta.model';
import { VrstaPlacanja } from '../models/vrstaplacanja.model';
import { CustomerService } from '../services/customer.service';
import { GradService } from '../services/grad.service';
import { RacunService } from '../services/racun.service';
import { SkladisteService } from '../services/skladiste.service';
import { ToastService } from '../services/toast.service';
import { ValutaService } from '../services/valuta.service';
import { VrstaplacanjaService } from '../services/vrstaplacanja.service';

@Component({
  selector: 'app-add-outputs',
  templateUrl: './add-outputs.component.html',
  styleUrls: ['./add-outputs.component.css']
})


export class AddOutputsComponent implements OnInit {
  closeResult: string = '';
  racun: IRacun;
  skladista: Skladiste[] = [];
  vrstePlacanja: VrstaPlacanja[] = [];
  valute: Valuta[] = [];
  customers: Customer[] = [];
  customersDB: Customer[] = [];
  gradovi: any[] = [];
  dodavanje: boolean = false;
  datum1: Date;
  cust: any;
  brojDobavljaca: any;
  tempRacun: IRacun;
  BrojRacuna: any;
  ekstenzijaRacuna: any = "/" + new Date().getFullYear().toString();
  idDokumenta: number = 1;
  currUser!: User;
  dateDatumRacuna = new FormControl(new Date());
  dateDatumDospijeca = new FormControl(new Date());
  klijentId: number = 0;
  korisnikId: number = 0;

  @ViewChild('submitForm') form: NgForm;

  constructor(
    private _racunService: RacunService,
    private _skladisteService: SkladisteService,
    private router: Router,
    private _vrstaPlacanja: VrstaplacanjaService,
    private _valuteService: ValutaService,
    private _customerService: CustomerService, 
    private modalService: NgbModal, 
    private _gradService: GradService,
    private toastService: ToastService, 
    private dateAdapter: DateAdapter<Date>) {
    this.racun = new IRacun();
    this.tempRacun = new IRacun();
    this.datum1 = new Date();
    this.cust = null;

    this.dateAdapter.setLocale('bs');
  }

  ngOnInit(): void {
    this.getData();
  }

  async getData() {
    this.getTokens();
    await this.setBrojRacuna();
    await this.getVrstePlacanja();
    await this.getValute();
    await this.getSkladista();
    await this.getGradovi();
    await this.getCustomers();
    setTimeout(() => {
      var elem = document.getElementById('dodajKupca') as HTMLInputElement;
      elem.focus();
    }, 1000);
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getVrstePlacanja() {
    this.vrstePlacanja = await this._vrstaPlacanja.getVrstaPromise();
  }

  async getValute() {
    this.valute = await this._valuteService.getValutaPromise();
  }
  
  async getSkladista() {
    this.skladista = await this._skladisteService.getSkladistePromise(this.klijentId);
  }

  async getCustomers() { 
    this.customers = await this._customerService.getCustomersPromise(this.klijentId);
    this.customers.map((customer: any) => {
      customer.gradNaziv = this.gradovi.find((grad: any) => grad.gradId == customer.gradId)?.naziv;
    });
    this.customersDB = this.customers;
  }

  async getGradovi() {
    this.gradovi = await this._gradService.getGradoviPromise(this.klijentId);
  }
  
  async setBrojRacuna() {
    let brojRacuna = await this._racunService.getZadnjiBrojURacunu(this.klijentId, this.idDokumenta);
    this.BrojRacuna = (brojRacuna.zadnjiBrojRacuna + 1) + this.ekstenzijaRacuna
  }
  
  async onSubmit() {
    this.racun.klijentId = this.klijentId;
    this.racun.kupacId = this.cust.kupacId;
    this.racun.brojRacuna = this.BrojRacuna
    this.racun.datum = new Date();
    this.racun.dokumentId = 1;
    this.racun.datumRacuna = this.dateDatumRacuna.value;
    this.racun.datumDospjeca = this.dateDatumDospijeca.value;
    this.racun.dokumentId = this.idDokumenta;
    this.racun.skladisteIzlazId = this.racun.skladisteId;
    this.racun.iznosRacuna = 0;
    this.racun.iznosSaPdv = 0;
    this.racun.iznosPoreza = 0;

    this.tempRacun = await this._racunService.addRacunPromise(this.racun);
    this.toastService.showSuccess("Uspješno ste dodali račun!", "Uspješno!");
    let ID = this.tempRacun.racunId;
    this.router.navigate([`/adminpanel/editOutputs/${ID}`]);
  }

  filterPoNazivuKupac(pretraga: any) {
    this.customers = this.customersDB.filter(obj => obj.naziv?.toLowerCase()?.includes(pretraga.value.toLowerCase()));
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
    // this.cust=null;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getCustomerById(id: any) {
    this._customerService.getCustomerById(id).subscribe(data => {
      this.cust = data;
      var elem = document.getElementById('kupacValidacija');
      elem!.style.display = "none";
      var today = new Date(this.dateDatumRacuna.value);
      //move today by this.cust.brojDana
      today.setDate(today.getDate() + this.cust.brojDana);
      this.dateDatumDospijeca.setValue(today);
    });

    this.modalService.dismissAll();
  }

  changeDatumRacuna(date: any) {
    var day = new Date(date);
    if (this.cust != null) {
      day.setDate(day.getDate() + this.cust.brojDana);
      this.dateDatumDospijeca.setValue(day);
    } else {
      this.dateDatumDospijeca.setValue(day);
    }
  }
  
  validationForm() {
    if (this.cust == null) {
      var elem = document.getElementById('kupacValidacija');
      elem!.style.display = "block";
    }
    if (!this.racun.hasOwnProperty('skladisteId')) {
      var elem1 = document.getElementById('skladisteValidacija');
      elem1!.style.display = "block";
    }
    if (!this.racun.hasOwnProperty('vrstaPlacanjaId')) {
      var elem2 = document.getElementById('vrstaPlacanjaValidacija');
      elem2!.style.display = "block";
    }
    if (!this.racun.hasOwnProperty('valutaId')) {
      var elem3 = document.getElementById('valutaValidacija');
      elem3!.style.display = "block";
    }
  }
}

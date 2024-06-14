import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Customer } from '../models/customer.model';
import { Grad } from '../models/grad.model';
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
  selector: 'app-add-medjuskladiste',
  templateUrl: './add-medjuskladiste.component.html',
  styleUrls: ['./add-medjuskladiste.component.css']
})

export class AddMedjuskladisteComponent implements OnInit {
  closeResult: string = '';
  racun: IRacun;
  skladista: Skladiste[] = [];
  vrstePlacanja: VrstaPlacanja[] = [];
  valute: Valuta[] = [];
  customers: Customer[] = [];
  customersDB: Customer[] = [];
  gradovi: Grad[] = [];
  dodavanje: boolean = false;
  brojDobavljaca: any;
  tempRacun: IRacun;
  brojRacuna: any;
  ekstenzijaRacuna: any = "/" + new Date().getFullYear().toString();
  idDokumenta: number = 4;
  klijentId: number = 0;
  korisnikId: number = 0;
  currUser!: User;
  dateDatumRacuna = new FormControl(new Date());
  dateDatumDospijeca = new FormControl(new Date());
  skladisteValidacija: boolean = true;
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
    private dateAdapter: DateAdapter<Date>
  ) {
  }

  ngOnInit(): void {
    this.setDefaults();
    this.getData();
  }

  setDefaults() {
    this.racun = new IRacun();
    this.tempRacun = new IRacun();
    this.dateAdapter.setLocale('bs');
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

  async setBrojRacuna() {
    let brojRacuna = await this._racunService.getZadnjiBrojURacunu(this.klijentId, this.idDokumenta);
    this.brojRacuna = (brojRacuna.zadnjiBrojRacuna + 1) + this.ekstenzijaRacuna
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

  async onSubmit() {
    this.racun.brojRacuna = this.brojRacuna
    this.racun.datum = new Date();
    this.racun.dokumentId = 1;
    this.racun.datumRacuna = this.dateDatumRacuna.value;
    this.racun.datumDospjeca = this.dateDatumDospijeca.value;
    this.racun.dokumentId = this.idDokumenta;
    this.racun.iznosRacuna = 0;
    this.racun.iznosSaPdv = 0;
    this.racun.iznosPoreza = 0;
    this.tempRacun = await this._racunService.addRacunPromise(this.racun)
    this.toastService.showSuccess("Uspješno ste dodali međuskladišnicu!", "Uspješno!");
    let id = this.tempRacun.racunId;
    this.router.navigate([`/adminpanel/editmedjuskladisnicu/${id}`]);
  }

  filterPoNazivuKupac(pretraga: any) {
    this.customers = this.customersDB.filter(obj => obj?.naziv?.toLowerCase()?.includes(pretraga.value.toLowerCase()))
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

  changeDatumRacuna(date: any) {
    var day = new Date(date);
    this.dateDatumDospijeca.setValue(day);
  }

  validationForm() {
    if (!this.racun.hasOwnProperty('skladisteIzlazId')) {
      var elem1 = document.getElementById('skladisteIzlazValidacija');
      elem1!.style.display = "block";
    }
    if (!this.racun.hasOwnProperty('skladisteUlazId')) {
      var elem1 = document.getElementById('skladisteUlazValidacija');
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

  provjeriSkladisteValidaciju() {
    if (this.racun.hasOwnProperty('skladisteUlazId') && this.racun.hasOwnProperty('skladisteIzlazId')) {
      if (this.racun.skladisteIzlazId != this.racun.skladisteUlazId) {
        var elemInputUlaz = document.getElementById('inputStateSkladisteUlaz');
        elemInputUlaz!.classList.remove('borderRed');
        var elemInputIzlaz = document.getElementById('inputStateSkladisteIzlaz');
        elemInputIzlaz!.classList.remove('borderRed');
        this.skladisteValidacija = false;
        var elemIzlazUlaz = document.getElementById('skladisteIzlazUlazValidacija');
        elemIzlazUlaz!.classList.add('d-none');
        elemIzlazUlaz!.classList.remove('d-block');
        var elemIzlazUlaz = document.getElementById('skladisteUlazIzlazValidacija');
        elemIzlazUlaz!.classList.add('d-none');
        elemIzlazUlaz!.classList.remove('d-block');
      } else {
        var elemInputUlaz = document.getElementById('inputStateSkladisteUlaz');
        elemInputUlaz!.classList.add('borderRed');
        var elemInputIzlaz = document.getElementById('inputStateSkladisteIzlaz');
        elemInputIzlaz!.classList.add('borderRed');
        this.skladisteValidacija = true;
        var elemIzlazUlaz = document.getElementById('skladisteIzlazUlazValidacija');
        elemIzlazUlaz!.classList.add('d-block');
        elemIzlazUlaz!.classList.remove('d-none');
        var elemIzlazUlaz = document.getElementById('skladisteUlazIzlazValidacija');
        elemIzlazUlaz!.classList.add('d-block');
        elemIzlazUlaz!.classList.remove('d-none');
      }
    }
  }

}

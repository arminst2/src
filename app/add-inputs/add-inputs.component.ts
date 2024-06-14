import { DatePipe } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
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
  selector: 'app-add-inputs',
  templateUrl: './add-inputs.component.html',
  styleUrls: ['./add-inputs.component.css']
})

export class AddInputsComponent implements OnInit {
  racuni: IRacun;
  skladista: Skladiste[] = [];
  racuniLista: IRacun[] = [];
  vrstePlacanja: VrstaPlacanja[] = [];
  valute: Valuta[] = [];
  SkladisteId:number=0;
  iznosPDV:number;
  iznosracun:number;
  pdv:number;

  evidencijskiBroj:any;
  brojDobavljaca:any;

  customers: Customer[] = [];
  customersDB: Customer[] = [];
  gradovi: Grad[] = [];
  TempRacun: IRacun;
  GetLenght:number=0;
  ekstenzijaRacuna:any="/"+new Date().getFullYear().toString();
  BrojRacuna:any;
  datum1:Date;
  currUser!: User;
  idDokumenta: number = 2;
  closeResult:string='';
  customer:any;

  dateDatumDanas = new FormControl(new Date());
  dateDatumRacuna = new FormControl(new Date());
  dateDatumDospijeca = new FormControl();

  ID:number=0;
  klijentId: number = 0;
  korisnikId: number = 0;
  @ViewChild('submitForm') submitForm: NgForm ;

  constructor(
    private _racunService: RacunService,
    private router: Router, 
    private _skladisteService:SkladisteService,
    private _vrstaPlacanja:VrstaplacanjaService,
    private _valutaService:ValutaService,
    private _customerService:CustomerService,
    private _gradService:GradService,
    private datePipe:DatePipe,
    private modalService: NgbModal,
    private dateAdapter: DateAdapter<Date>,
    private toastService: ToastService,
    ) {
    }

  ngOnInit(): void {
    this.setDefaults();    
    this.getData();

    var elem = document.getElementById("evidencijskiBroj") as HTMLInputElement;
    elem.focus();
  }  

  setDefaults() {
    this.racuni = new IRacun();
    this.TempRacun = new IRacun();
    this.datum1 = new Date();
    this.iznosPDV;
    this.iznosracun;
    this.pdv;
    this.BrojRacuna = this.ekstenzijaRacuna;
    this.dateAdapter.setLocale('bs');
    var elem = document.getElementById("evidencijskiBroj") as HTMLInputElement;
    elem.focus();
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
    this.valute = await this._valutaService.getValutaPromise();
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
    this.BrojRacuna = (brojRacuna.zadnjiBrojRacuna + 1) + this.ekstenzijaRacuna
  }
  
  async onSubmit(){
    this.racuni.iznosRacuna=this.iznosracun;
    this.racuni.iznosPoreza=this.pdv;
    this.racuni.iznosSaPdv=this.iznosPDV;
    this.racuni.brojRacuna = this.BrojRacuna
    this.racuni.evidencijskiBroj=this.evidencijskiBroj;
    this.racuni.kupacId=this.customer.kupacId;
    this.racuni.brojDobavljaca=this.brojDobavljaca;
    this.racuni.dokumentId=2;
    this.racuni.datum=new Date(this.dateDatumDanas.value);
    this.racuni.datumRacuna=new Date(this.dateDatumRacuna.value);
    this.racuni.datumDospjeca=new Date(this.dateDatumDospijeca.value);
    this.racuni.skladisteUlazId = this.racuni.skladisteId;
    this.racuni.nabavniIznos = 0;
    this.racuni.marzaIznos = 0;
    this.TempRacun = await this._racunService.addRacunPromise(this.racuni);
    this.toastService.showSuccess("Uspješno ste dodali račun!", "Uspješno!");
    let id = this.TempRacun.racunId;
    this.router.navigate([`/adminpanel/editInputs/${id}`]);      
  }

  filterPoNazivuKupac(pretraga: any){
    this.customers = this.customersDB.filter(obj => obj.klijentId == this.currUser.klijentId && obj.naziv?.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  /**Modal GetStavke */
  Get(content:any) {
    this.modalService.open(content,{ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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

  getCustomerById(id: any){
    this.customer = this.customersDB.find(f => f.kupacId == id)!
    var elem = document.getElementById('kupacValidacija');
    elem!.style.display = "none";
    var today = new Date(this.dateDatumDanas.value);
    today.setDate(today.getDate() + this.customer.brojDana);
    this.dateDatumDospijeca.setValue(today);
    this.modalService.dismissAll();
  }

  changeDatumRacuna(date: any){
    var day = new Date(date);
    if(this.customer != null){
      day.setDate(day.getDate() + this.customer.brojDana);
      this.dateDatumDospijeca.setValue(day);
    } else{
      this.dateDatumDospijeca.setValue(day);
    }
  }

  pdvIzracun(){
    this.iznosPDV=this.iznosracun+this.pdv;
  }

  Zatvori(){
    this.router.navigate(["/adminpanel/inputs"]);
  }
  
  validationForm(){
    if(this.evidencijskiBroj == null){
      var elem = document.getElementById('evidencijskiBrojValidacija');
      elem!.style.display = "block";
    }
    if(this.brojDobavljaca == null){
      var elem = document.getElementById('brojDobavljacaValidacija');
      elem!.style.display = "block";
    }
    if(this.customer == null){
      var elem = document.getElementById('kupacValidacija');
      elem!.style.display = "block";
    }
    if(this.racuni.hasOwnProperty('skladisteUlazId')==false){
      var elem = document.getElementById('skladisteValidacija');
      elem!.style.display = "block";
    }
    if(this.racuni.hasOwnProperty('vrstaPlacanjaId')==false){
      var elem = document.getElementById('vrstaPlacanjaValidacija');
      elem!.style.display = "block";
    }
    if(this.racuni.hasOwnProperty('valutaId')==false){
      var elem = document.getElementById('valutaValidacija');
      elem!.style.display = "block";
    }
    if(this.iznosracun == null){
      var elem = document.getElementById('iznosValidacija');
      elem!.style.display = "block";
    }
    if(this.pdv == null){
      var elem = document.getElementById('PDVValidacija');
      elem!.style.display = "block";
    }    
    if(this.iznosPDV == null){
      var elem = document.getElementById('iznosPDVValidacija');
      elem!.style.display = "block";
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { Client } from '../models/client.model';
import { User } from '../models/user.model';
import { ClientService } from '../services/client.service';
import { UserService } from '../services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css']
})
export class CompanyProfileComponent implements OnInit {
  currUser?: User;
  useri: User[] = [];
  korisnikId: number = 0;
  currClient?: Client;
  klijentId: number = 0;
  currClientUpdate?: Client;
  imageUrl:string='/assets/img/profile.png';
  fileToUpload:File = null as any;
  ImageM: any = '';
  imageRes: any;
  imageChangedEvent: any = '';
  public base64Slika: string='';

  constructor(
    private _sanitizer: DomSanitizer,
    public _clientService: ClientService,
    public _korisnikService: UserService,
    private toastService: ToastService
    ) {
  }
 

  ngOnInit(): void {
    this.getData();
  }
  async getData() {
    await this.getTokens();
    await this.getClient();
    await this.getCurrentUser();    
  }

  async getClient() {
    this.currClient = await this._clientService.getClientByIdPromise(this.klijentId);
    this.imageRes = this.currClient?.image;
    this.ImageM = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + atob(this.currClient.image!));
  }

  async getCurrentUser() {
    this.currUser = await this._korisnikService.getUserByIdPromise(this.korisnikId);
    await this.getIsAdmin();
  }
  
  async getIsAdmin() {
    this.currUser!.isAdmin = await this._korisnikService.getIsAdmin(this.korisnikId);
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.base64Slika = btoa(binaryString);
  }

  fileChangeEvent($event) {
    //this.imageChangedEvent = event;
    var file: File = $event.target.files[0];
        
    var reader = new FileReader();
    reader.onload = this.handleReaderLoaded.bind(this);
    reader.readAsBinaryString(file);
        
    var reader1 = new FileReader();
    
    reader1.onload=(event:any)=>{
      this.ImageM=event.target.result;
    }
    reader1.readAsDataURL(file);
  }

  async UpdateForImage() {
    this.toastService.showInfo('Spremanje slike...', 'Spremanje slike u tijeku...');
    this.currClientUpdate = this.currClient;
    this.currClientUpdate!.image = btoa(this.base64Slika);
    this._clientService.formData = this.currClientUpdate!;
    await this._clientService.putClientPromise();
    this.toastService.showSuccess("Uspješno spremljena slika", "Uspješno ste izmjenili podatke o klijentu!");
    window.location.reload();
  }
  
  async onSubmit(form: NgForm) {
    this._clientService.formData.idbroj = form.controls['idbroj'].value;
    this._clientService.formData.naziv = form.controls['naziv'].value;
    this._clientService.formData.telefon = form.controls['telefon'].value;
    this._clientService.formData.adresa = form.controls['adresa'].value;
    this._clientService.formData.mjesto = form.controls['mjesto'].value;
    this._clientService.formData.pdvbroj = form.controls['pdvbroj'].value;
    this._clientService.formData.brojBankovnogRacuna = form.controls['brojBankovnogRacuna'].value;
    this._clientService.formData.image = this.imageRes;
    this.updateRecord(form);
    this._korisnikService.formData = this.currUser!;
    var username= document.getElementById("korisnikUsername") as HTMLInputElement;
    this._korisnikService.formData.ime = username.value;
    var lastname= document.getElementById("korisnikLastname") as HTMLInputElement;
    this._korisnikService.formData.prezime = lastname.value;
    this._korisnikService.formData.korisnikId = this.currUser?.korisnikId;
    await this._korisnikService.putUserPromise();
    this.toastService.showSuccess("Uspješno izmjenjeni podaci", "Uspješno ste izmjenili podatke o korisniku!");
    await this.getCurrentUser();
  }

  async updateRecord(form: NgForm) {
    await this._clientService.putClientPromise();
    this.toastService.showSuccess("Uspješno izmjenjeni podaci", "Uspješno ste izmjenili podatke o klijentu!");
    await this.getClient();
  }
}

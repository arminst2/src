import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { data } from 'jquery';
import { delay, map } from 'rxjs/operators';
import { IKlijent } from '../models/registracija.model';
import { User } from '../models/user.model';
import { ClientService } from '../services/client.service';
import { RegistracijaService } from '../services/registracija.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-registracija',
  templateUrl:'./registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent implements OnInit {
  klijent: IKlijent;
  korisnik:User;
  isRegistrovan:boolean=false;
  isAvailable:boolean=true;
  useri: User[] = [];
  iDSameAsPDV: any = false;

  constructor(
    private _registracijaService: RegistracijaService,
    private router: Router,
    private _korisnikService: UserService) 
  {
  }

  ngOnInit(): void {
    this.setDefaults();
  }

  setDefaults() {
    sessionStorage.setItem('token', window.btoa("test:test"));
    this.klijent=new IKlijent();
    this.korisnik=new User();
  }

  async onSubmit(){
    if(await this.checkIfUsernameExists()){
      this.isAvailable=false;
      return;
    } else {
      this.klijent.potvrdjenMail = false;
      sessionStorage.setItem('token', window.btoa(this.korisnik.korisnickoIme + ':' + this.korisnik.lozinka));
      this.klijent = await this._registracijaService.addKlijentPromise(this.klijent)
      this.korisnik.klijentId = this.klijent.klijentId;
      this.korisnik.isAdmin = true;
      this.korisnik = await this._korisnikService.addKorisnikPromise(this.korisnik);
      this.isRegistrovan=true;
      this.isAvailable=true;
      setTimeout(() => {
        this.router.navigate(['/prijava/0']);
      }, 5000);
    }
  }
  
  async checkIfUsernameExists() {
    return await this._korisnikService.getIsZauzetoKorisnickoImePromise(this.korisnik.korisnickoIme!)
  }

  unosIDBroja(){
    if(this.klijent.idbroj == this.klijent.pdvbroj){
      this.iDSameAsPDV = true;
    } else{
      this.iDSameAsPDV = false;
    }
  }

  refreshValidation(){
    this.isAvailable=true;
  }
}

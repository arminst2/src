import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first, map } from 'rxjs/operators';
import { error } from 'selenium-webdriver';
import { AuthenticationService } from '../authentication/authentication-service';
import { Client } from '../models/client.model';
import { User } from '../models/user.model';
import { ClientService } from '../services/client.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.css']
})
export class PrijavaComponent implements OnInit {

  loading = false;
  submitted = false;
  returnUrl?: string;
  error = '';
  isError: boolean = false;
  user: User = new User();
  klijent: Client = new Client();
  useri: User[] = [];
  idklijenta?: string | null;
  isPotvrdjenMail: boolean = false;

  constructor(
    private router: Router, 
    public _userService: UserService, 
    public _clientService: ClientService, 
    private route: ActivatedRoute, 
    private authenticationService: AuthenticationService)
  {

  }

  ngOnInit(): void {
    this.setDefaults();
    this.getData();
    
  }

  setDefaults() {
    this._userService.formData= new User;
    this.checkMailConfirmation();
  }

  async checkMailConfirmation() {
    this.route.paramMap.subscribe(params => { this.idklijenta = params.get('id'); })
    var num: number = parseInt(this.idklijenta!);
    if (num != 0) {
      this.klijent = await this._clientService.setPotvrdenMailPromise(num);
    }
    this.isPotvrdjenMail = false;
  }

  getData() {

  }

  async onSubmit() {
    
    this.submitted = true;
    this.loading = true;
    sessionStorage.setItem('token', window.btoa(this._userService.formData.korisnickoIme + ':' + this._userService.formData.lozinka));
    console.log(this.klijent.potvrdjenMail);
    await this.authenticationService.loginPromise(this._userService.formData.korisnickoIme).then(async (users: any) => {
      if (users.length > 0) {
        this.user = users[0];
        sessionStorage.setItem('tokenKlijentId', window.btoa(this.user.klijentId!.toString()));
        this.klijent = await this._clientService.getClientByIdPromise(this.user.klijentId!);
        console.log(this.klijent.potvrdjenMail);
        if (this.klijent!.potvrdjenMail == true) {
          sessionStorage.setItem('tokenKorisnikId', window.btoa(this.user.korisnikId!.toString()));
          this.router.navigate(['/adminpanel/companyProfile']);
        } else {
          this.isPotvrdjenMail = true;
        }
      } 
    }, error => {
      this.error = error;
      this.isError = true;
      this.loading = false;
    });
  }
}

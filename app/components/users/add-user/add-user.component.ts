import { Component, HostListener, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { Client } from '../../../models/client.model';
import { User } from '../../../models/user.model';
import { ClientService } from '../../../services/client.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  currUser?: User;
  isAvailable: boolean = true;
  isUsernameLenghtValid: boolean = true;
  form!: User;
  _routerSub = Subscription.EMPTY;
  ifsubmit: boolean = true;
  sameUsername: any;
  klijentId: number = 0;
  korisnikId: number = 0;

  constructor(
    public _userService: UserService,
    public _clientService: ClientService,
    private router: Router,
    private toastService: ToastService
  ) {
    this._routerSub = this.router.events.subscribe((ev) => {
      if (this.ifsubmit) { 
        if (ev instanceof NavigationStart) { 
          if (this.canDeactivate()) {
            router.navigateByUrl(router.url, { replaceUrl: true });
          } else { }
        }
      }
    });
  }

  ngOnInit(): void {
    this.sameUsername = this._userService.formData.korisnickoIme;
    this.setDefaults()
    this.getData();
  }

  setDefaults() {
    this.form = Object.assign({}, this._userService.formData);
  }

  async getData() {
    this.getTokens();
    await this.getCurrentUser();
    await this.getIsAdmin();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getCurrentUser() {
    this.currUser = await this._userService.getUserByIdPromise(this.korisnikId);
  }

  async getIsAdmin() {
    if(this._userService.formData.korisnikId != 0){
      this._userService.formData.isAdmin = await this._userService.getIsAdmin(this._userService.formData.korisnikId);
      this.form.isAdmin = this._userService.formData.isAdmin;
    }
  }

  ngOnDestroy() {
    this._routerSub.unsubscribe();
  }

  canDeactivate(): boolean { 
    if (JSON.stringify(this.form) !== JSON.stringify(this._userService.formData)) { 
      if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.canDeactivate()) {
      return false;
    } return true;
  }

  async onSubmit(form: NgForm) {
    this.ifsubmit = false;
    if (this._userService.formData.korisnikId == 0) {      
      if(await this.checkIfUsernameExists()) {
        this.toastService.showError("Korisničko ime je zauzeto!", "Greška");
        this.isAvailable = false;
        return;
      }
      await this.insertRecord(form);
      this.toastService.showSuccess("Korisnik uspješno dodan!", "Uspješno");
    }
    else {
      await this.updateRecord(form);
      this.toastService.showSuccess("Korisnik uspješno izmjenjen!", "Uspješno");
    }
    form.reset();
    this.router.navigate(['/adminpanel/users']);
  }

  async insertRecord(form: NgForm) {
    this._userService.formData.klijentId = this.klijentId;
    this._userService.formData.korisnikId = undefined;
    this.currUser = await this._userService.postUserPromise();
  }

  async updateRecord(form: NgForm) {
    this.currUser = await this._userService.putUserPromise();  
  }

  async checkIfUsernameExists() {
    return await this._userService.getIsZauzetoKorisnickoImePromise(this._userService.formData.korisnickoIme!)
  }

  provjeri() {
    this.isAvailable = true;
    if (this._userService.formData.korisnickoIme!.length < 3) {
      this.isUsernameLenghtValid = false;
    } else {
      this.isUsernameLenghtValid = true;
    }
  }
}

import { Component, HostListener, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { Customer } from '../../../models/customer.model';
import { Grad } from '../../../models/grad.model';
import { CustomerService } from '../../../services/customer.service';
import { GradService } from '../../../services/grad.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent implements OnInit {
  gradovi: Grad[] = [];
  form!: Customer;
  _routerSub = Subscription.EMPTY;
  ifsubmit: boolean = true;
  currUser!: User;
  IDSameAsPDV: any = false;
  klijentId: number = 0;
  korisnikId: number = 0;

  constructor(public service: CustomerService, public serviceclient: ClientService, public servicegrad: GradService,
    private router: Router, private _korisnikService: UserService, private toastService: ToastService) {
    this.form = Object.assign({}, this.service.formData);
    this._routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        if (this.ifsubmit) {
          if (this.canDeactivate()) {
            router.navigateByUrl(router.url, { replaceUrl: true });
          } else {
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  async getData() {
    await this.getTokens();
    await this.getGradovi();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getGradovi() {
    this.gradovi = await this.servicegrad.getGradoviPromise(this.klijentId);
  }

  ngOnDestroy() {
    this._routerSub.unsubscribe();
  }

  canDeactivate(): boolean {
    if (JSON.stringify(this.form) !== JSON.stringify(this.service.formData)) {
      if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  //aktivacija na refresh
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.canDeactivate()) {
      return false; // ako ima promjena returning false otvara dialog
    } return true; // ako nema promjena refresha
  }

  onSubmit(form: NgForm) {
    this.ifsubmit = false;
    if (form.value.brojDana == '') {
      form.value.brojDana = 0;
    }
    if (this.service.formData.kupacId == 0) {
      this.insertRecord(form);
      this.toastService.showSuccess("Uspješno dodan kupac/dobavljač!", "Uspješno!");
    }
    else {
      this.updateRecord(form);
      this.toastService.showSuccess("Uspješno izmjenjen kupac/dobavljač!", "Uspješno!");
    }
    this.resetForm(form);
    form.reset();
    this.router.navigate(['/adminpanel/customers']);
  }

  async insertRecord(form: NgForm) {
    await this.service.postCustomerPromise(this.klijentId)
  }

  async updateRecord(form: NgForm) {
    await this.service.putCustomerPromise();
  }

  unosIdBroja() {
    if (this.service.formData.idbroj == this.service.formData.pdvbroj) {
      this.IDSameAsPDV = true;
    } else {
      this.IDSameAsPDV = false;
    }
  }

  resetForm(form: NgForm) {
    form.form.reset();
    this.service.formData = new Customer();
  }

  otkazi(form: NgForm) {
    this.router.navigate(['/adminpanel/customers']);
  }
}

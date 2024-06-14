import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { ToastService } from 'src/app/services/toast.service';
import { GradService } from 'src/app/services/grad.service';
import { Grad } from 'src/app/models/grad.model';

@Component({
  selector: 'app-customers',
  templateUrl: '/customers.component.html',
  styleUrls: ['/customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  customersDB: Customer[] = [];
  gradovi: Grad[] = [];
  closeResult: string = '';
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  klijentId: number = 0;
  korisnikId: number = 0;
  customerId: number = 0;
  sortirajPoNazivuOpadajuce:boolean=false;
  sortirajPoSifri:boolean=false;
  constructor(
    private modalService: NgbModal,
    private router: Router,
    public _customerService: CustomerService,
    public _gradoviService: GradService,
    private toastService: ToastService) {
  }
  Sortiranje()
  {
      if(!this.sortirajPoNazivuOpadajuce){
        this.customers.sort((a,b)=>{
          return a.naziv!.localeCompare(b.naziv!)
        });
      }else{
        this.customers.sort((a,b)=>{
          return b.naziv!.localeCompare(a.naziv!)
        });
      }
  this.sortirajPoNazivuOpadajuce=!this.sortirajPoNazivuOpadajuce;
}
SortiranjePoSifri()
  {
      if(!this.sortirajPoSifri){
        this.customers.sort((a,b)=>{
          return a.sifra!.localeCompare(b.sifra!)
        });
      }else{
        this.customers.sort((a,b)=>{
          return b.sifra!.localeCompare(a.sifra!)
        });
      }
  this.sortirajPoSifri=!this.sortirajPoSifri;
}

  ngOnInit(): void {
    this.getData();
  }
  async getData() {
    await this.getTokens();
    await this.getGradovi();
    await this.getCustomers();
  }
  
  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }
  
  async getGradovi() {
    this.gradovi = await this._gradoviService.getGradoviPromise();
  }

  async getCustomers() {
    this.customers = await this._customerService.getCustomersPromise(this.klijentId);
    this.customers.map((customer: any) => {
      customer.gradNaziv = this.gradovi.find((grad: any) => grad.gradId === customer.gradId)?.naziv;
    });
    this.customersDB = this.customers;
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  resetForm() {
    this._customerService.formData = new Customer();
  }

  addCustomer() {
    this.resetForm();
    if (this.customers.length > 0) {
      this._customerService.formData.sifra = (Number.parseInt(this.customers[this.customers.length - 1].sifra!) + 1).toString();
    }
    this.router.navigate(['/adminpanel/addcustomer']);
  }

  editCustomer(customer: Customer) {
    this._customerService.formData = customer;
    this.router.navigate(['/adminpanel/addcustomer']);
  }

  async deleteCustomer() {
    await this._customerService.deleteCustomerPromise(this.customerId as number);
    await this.getCustomers();
    this.toastService.showSuccess("Uspješno ste obrisali kupca!", "Uspješno!");
  }

  filterPoNazivu(pretraga: any) {
    this.customers = this.customersDB.filter((customer: any) => {
      return customer.naziv.toLowerCase().includes(pretraga.value.toLowerCase());
    });
  }

  /**Modal Add */
  Add(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  DeleteModal(content: any, cutomer: Customer) {
    this.customerId = cutomer.kupacId!;
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
}

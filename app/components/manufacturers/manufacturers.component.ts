import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { Client } from '../../models/client.model';
import { Manufacturer } from '../../models/manufacturer.model';
import { MyConfig } from '../../my-config';
import { ClientService } from '../../services/client.service';
import { ManufacturerService } from '../../services/manufacturer.service';

@Component({
  selector: 'app-manufacturers',
  templateUrl: './manufacturers.component.html',
  styleUrls: ['./manufacturers.component.css']
})
export class ManufacturersComponent implements OnInit{
  client!: Client;
  manufacturers: Manufacturer[] = [];
  manufacturersDB: Manufacturer[] = [];
  manufacturer!: Manufacturer;
  closeResult: string = '';
  form!: Manufacturer;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  klijentId: number = 0;
  korisnikId: number = 0;
  readonly url: string = MyConfig.adresaServera + '/proizvodjac';
  constructor(
    private modalService: NgbModal,
    public _manufacturerService: ManufacturerService, 
    public _clientservice: ClientService, 
    public _userService: UserService, 
    private toastService: ToastService) 
    {
      this.manufacturer = new Manufacturer();
    }
  
  ngOnInit(): void {
    this.getData();
  }

  async getData() {
    await this.getTokens();
    await this.getManufacturers();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getManufacturers() {
    this.manufacturers = await this._manufacturerService.getManufacturersPromise(this.klijentId);
    this.manufacturersDB = this.manufacturers;
  }

  async onSubmit() {
    this.manufacturer.klijentId = this.klijentId;
    await this._manufacturerService.postManufacturerPromise(this.manufacturer);
    await this.getManufacturers();
    const paging = Math.ceil((this.manufacturers.length + 1) / this.itemsPerPage);
    this.onPageChange(paging);
    this.currentPage = paging;
    this.toastService.showSuccess("Proizvođač uspješno dodan!", "Uspješno!");
  }

  async uredi() {
    await this._manufacturerService.putManufacturerPromise(this._manufacturerService.formData.proizvodjacId!, this._manufacturerService.formData);
    await this.getManufacturers();
    this.toastService.showSuccess("Proizvođač uspješno uređen!", "Uspješno!");
  }

  async obrisi() {
    await this._manufacturerService.deleteManufacturerPromise(this.manufacturer.proizvodjacId!);
    await this.getManufacturers();
    this.toastService.showSuccess("Proizvođač uspješno obrisan!", "Uspješno!");
    this.modalService.dismissAll();
  }

  canDeactivate(): boolean {
    if(JSON.stringify(this.form) !== JSON.stringify(this._manufacturerService.formData)){
      if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
        return false;
      } else {
        return true;
      }
    }else {
      return false;
    }
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage*(pageNum - 1);
  }

  filterPoNazivu(pretraga:any){
    this.manufacturers = this.manufacturersDB.filter(obj=> obj.naziv?.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  /**Modal Add */
  Add(content: any) {
    this.manufacturer = new Manufacturer();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' })
    .result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content1: any, item: Manufacturer) {
    this._manufacturerService.formData = Object.assign({}, item);
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' })
      .result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  /**Modal Delete */
  Delete(content2: any, item: Manufacturer) {
    this.manufacturer = item;
    this.modalService.open(content2, { ariaLabelledBy: 'modal-basic-title' })
      .result.then((result) => {
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

  private beforeDismiss(reason: any): void {
    this.canDeactivate();
  }
}


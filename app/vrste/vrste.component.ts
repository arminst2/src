import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Vrsta } from '../models/vrsta.model';
import { VrstaService } from '../services/vrsta.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-vrste',
  templateUrl: './vrste.component.html',
  styleUrls: ['./vrste.component.css']
})
export class VrsteComponent implements OnInit {
  public vrste: Vrsta[] = [];
  public vrsteDB: Vrsta[] = [];
  closeResult: string = '';
  vrsta!: Vrsta;
  idvrsta: number = 0;
  currUser!: User;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  klijentId: number = 0;
  korisnikId: number = 0;
  constructor(
    public _vrsteService: VrstaService, 
    private modalService: NgbModal, 
    private _korisnikService: UserService, 
    private toastService: ToastService) {
      this.vrsta = new Vrsta();
  }

  ngOnInit(): void {
    this.getData();
  }
  async getData() {
    await this.getTokens();
    await this.getVrste();
    await this.getCurrentUser();
  }

  async getCurrentUser() {
    this.currUser = await this._korisnikService.getUserByIdPromise(this.korisnikId);
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getVrste() {
    this.vrsta.klijentId = this.klijentId;
    this.vrste = await this._vrsteService.getVrstePromise(this.klijentId!);
    this.vrsteDB = this.vrste;
  }

  async onSubmit() {
    this.vrsta.klijentId = this.klijentId;
    await this._vrsteService.addVrstaPromise(this.vrsta);
    this.vrste = await this._vrsteService.getVrstePromise(this.klijentId!);
    this.toastService.showSuccess("Uspješno ste dodali vrstu!", "Uspješno!");
  }

  async updateVrsta() {
    await this._vrsteService.updateVrstaPromise(this._vrsteService.formData.vrstaId, this._vrsteService.formData);
    this.vrste = await this._vrsteService.getVrstePromise(this.klijentId!);
    this.toastService.showSuccess("Uspješno ste izmjenili vrstu!", "Uspješno!");
    setTimeout(() => {
      this.ngOnInit(); 
    }, 1500);
  }

  async DeleteVrsta() {
    await this._vrsteService.deleteVrstaPromise(this.idvrsta);
    this.vrste = await this._vrsteService.getVrstePromise(this.klijentId!);
    this.toastService.showSuccess("Uspješno ste izbrisali vrstu!", "Uspješno!");
    this.modalService.dismissAll();
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }
  
  filterPoNazivu(pretraga: any) {
    this.vrste = this.vrsteDB.filter(obj => obj.naziv.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  /**Modal Add */
  Add(content: any) {
    this.vrsta = new Vrsta();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content1: any, item: Vrsta) {
    this.idvrsta = item.vrstaId;
    this._vrsteService.formData = Object.assign({}, item);
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  Delete(content2: any, item: Vrsta) {
    this.idvrsta = item.vrstaId;
    this.modalService.open(content2, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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

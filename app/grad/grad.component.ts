import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Grad } from '../models/grad.model';
import { GradService } from '../services/grad.service';
import { data } from 'jquery';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { ToastService } from '../services/toast.service';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-grad',
  templateUrl: './grad.component.html',
  styleUrls: ['./grad.component.css']
})
export class GradComponent implements OnInit {
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  public gradovi: Grad[] = [];
  public gradoviDB: Grad[] = [];
  closeResult: string = '';
  gradTemp!: Grad;
  idGrada: number = 0;
  currUser!: User;
  klijentId: number = 0;
  korisnikId: number = 0;
  constructor(
    public _gradService: GradService,
    private modalService: NgbModal,
    private _korisnikService: UserService,
    private toastService: ToastService) {
    this.gradTemp = new Grad();
  }

  ngOnInit(): void {
    this.getData()
  }

  async getData() {
    await this.getTokens();
    await this.getGradovi();
  }

  async getGradovi() {
    this.gradovi = await this._gradService.getGradoviPromise(this.klijentId!);
    this.gradoviDB = this.gradovi;
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async onSubmit() {
    this.gradTemp.klijentId = this.klijentId;
    await this._gradService.addGradPromise(this.gradTemp);
    await this.getGradovi();
    this.toastService.showSuccess("Grad uspješno dodan!", "Uspješno!");
  }
  
  async updateGrad() {
    await this._gradService.updateGradPromise(this._gradService.formData.gradId, this._gradService.formData);
    await this.getGradovi();
    this.toastService.showSuccess("Grad uspješno ažuriran!", "Uspješno!");
  }

  async DeleteGrad() {
    await this._gradService.deleteGradPromise(this.idGrada);
    await this.getGradovi();
    this.toastService.showSuccess("Grad uspješno obrisan!", "Uspješno!");
    this.modalService.dismissAll();
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  filterPoNazivu(pretraga: any) {
    this.gradovi = this.gradoviDB.filter(obj => obj.naziv.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  /**Modal Add */
  Add(content: any) {
    this.gradTemp = new Grad();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content1: any, item: Grad) {
    this.idGrada = item.gradId;
    this._gradService.formData = Object.assign({}, item);
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  Delete(content2: any, item: Grad) {
    // console.log(item.gradId);
    this.idGrada = item.gradId;
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

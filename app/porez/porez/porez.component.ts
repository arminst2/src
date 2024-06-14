import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Porez } from '../../models/porez.model';
import { PorezService } from '../../services/porez.service';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-porez',
  templateUrl: './porez.component.html',
  styleUrls: ['./porez.component.css']
})

export class PorezComponent implements OnInit {
  public porezi: Porez[] = [];
  public poreziDB: Porez[] = [];
  closeResult: string = '';
  porezTemp!: Porez;
  idPoreza: number = 0;
  currUser!: User;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  klijentId: number = 0;
  korisnikId: number = 0;

  constructor(
    public _porezService: PorezService,
    private modalService: NgbModal,
    private toastService: ToastService) {
    this.porezTemp = new Porez();
  }

  ngOnInit(): void {
    this.getData()
  }

  async getData() {
    await this.getTokens()
    await this.getPorezi()
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getPorezi() {
    this.porezi = await this._porezService.getPorezPromise(this.klijentId);
    this.poreziDB = this.porezi;
  }

  async onSubmit() {
    this.porezTemp.klijentId = this.klijentId;
    await this._porezService.addPorezPromise(this.porezTemp);
    await this.getPorezi();
    this.toastService.showSuccess("Porez je uspješno dodan!", "Uspješno!");
  }

  async updatePorez() {
    await this._porezService.updatePorezPromise(this._porezService.formData.porezId, this._porezService.formData);
    await this.getPorezi();
    this.toastService.showSuccess("Porez je uspješno ažuriran!", "Uspješno!");
  }

  async DeletePorez() {
    await this._porezService.deletePorezPromise(this.idPoreza);
    await this.getPorezi();
    this.toastService.showSuccess("Porez je uspješno obrisan!", "Uspješno!");
    this.modalService.dismissAll();
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  filterPoNazivu(pretraga: any) {
    this.porezi = this.poreziDB.filter(obj => obj.nazivPoreza.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  /**Modal Add */
  Add(content: any) {
    this.porezTemp = new Porez();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content1: any, item: Porez) {
    this.idPoreza = item.porezId;
    this._porezService.formData = Object.assign({}, item);
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  Delete(content2: any, item: Porez) {
    // console.log(item.porezId);
    this.idPoreza = item.porezId;
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

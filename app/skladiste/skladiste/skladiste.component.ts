import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from 'jquery';
import { Skladiste } from 'src/app/models/skladiste.model';
import { User } from 'src/app/models/user.model';
import { SkladisteService } from 'src/app/services/skladiste.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-skladiste',
  templateUrl: './skladiste.component.html',
  styleUrls: ['./skladiste.component.css']
})
export class SkladisteComponent implements OnInit {
  public skladiste: Skladiste[] = [];
  public skladisteDB: Skladiste[] = [];
  closeResult: string = '';
  skladisteTemp!: Skladiste;
  idSkladista: number = 0;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  klijentId: number = 0;
  korisnikId: number = 0;
  constructor(
    public _skladisteService: SkladisteService,
    private modalService: NgbModal,
    private _korisnikService: UserService,
    private toastService: ToastService) {
    this.skladisteTemp = new Skladiste();
  }

  ngOnInit(): void {
    this.getData();
    this.getSkladista()
  }

  async getData() {
    await this.getTokens();
    await this.getSkladista();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getSkladista() {
    this.skladiste = await this._skladisteService.getSkladistePromise(this.klijentId!);
    this.skladisteDB = this.skladiste;
  }

  async onSubmit() {
    this.skladisteTemp.klijentId = this.klijentId;
    await this._skladisteService.addSkladistePromise(this.skladisteTemp);
    await this.getSkladista();
    this.toastService.showSuccess("Uspesno dodavanje skladista", "Uspješno");
  }

  async updateSkladiste() {
    await this._skladisteService.updateSkladistePromise(this._skladisteService.formData.skladisteId, this._skladisteService.formData);
    await this.getSkladista();
    this.toastService.showSuccess("Uspesno izmenjeno skladista", "Uspješno");
  }

  async DeleteSkladiste() {
    await this._skladisteService.deleteSkladistePromise(this.idSkladista);
    await this.getSkladista();
    this.toastService.showSuccess("Uspesno obrisano skladista", "Uspješno");
    this.modalService.dismissAll();
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  filterPoNazivu(pretraga: any) {
    this.skladiste = this.skladisteDB.filter(obj =>
      obj.naziv.toLowerCase()?.includes(pretraga.value.toLowerCase())
    );
  }

  /**Modal Add */
  Add(content: any) {
    this.skladisteTemp = new Skladiste();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content1: any, item: Skladiste) {
    this.idSkladista = item.skladisteId;
    this._skladisteService.formData = Object.assign({}, item);
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  Delete(content2: any, item: Skladiste) {
    // console.log(item.skladisteId);
    this.idSkladista = item.skladisteId;
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


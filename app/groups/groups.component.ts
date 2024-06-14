import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Groups } from '../models/grupe.model';
import { GroupsService } from '../services/groups.service';
import { data } from 'jquery';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscriber, Subscription } from 'rxjs';
import { Porez } from '../models/porez.model';
import { PorezService } from '../services/porez.service';
import { Vrsta } from '../models/vrsta.model';
import { VrstaService } from '../services/vrsta.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-groups',
  templateUrl: '/groups.component.html',
  styleUrls: ['/groups.component.css']
})
export class GroupsComponent implements OnInit {
  public grupe: Groups[] = [];
  public grupeDB: Groups[] = [];
  porezi: Porez[] = [];
  vrste: Vrsta[] = [];
  closeResult: string = '';
  grupa!: Groups;
  idgroup: number = 0;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  uspjesnoDodavanje: boolean = false;
  klijentId: number = 0;
  korisnikId: number = 0;
  private routeSub!: Subscription;
  currUser!: User;
  constructor(
    public _groupService: GroupsService,
    private modalService: NgbModal,
    private router: Router,
    private _porezService: PorezService,
    private _vrstaService: VrstaService,
    private _korisnikService: UserService,
    private toastService: ToastService) {
    this.grupa = new Groups();
  }

  ngOnInit(): void {
    this.getData();
  }
  async getData() {
    await this.getTokens();
    await this.getVrste();
    await this.getGroups();
    await this.getPorezi();
    await this.getCurrentUser();
  }
  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }
  async getCurrentUser() {
    this.currUser = await this._korisnikService.getUserByIdPromise(this.korisnikId);
  }
  async getPorezi() {
    this.porezi = await this._porezService.getPorezPromise(this.klijentId);
  }
  async getVrste() {
    this.vrste = await this._vrstaService.getVrstePromise(this.klijentId);
  }
  async getGroups() {
    this.grupe = await this._groupService.getGroupsPromise(this.klijentId);
    this.grupe.map((grupa: any) => {
      grupa.vrstaNaziv = this.vrste.find((vrsta) => vrsta.vrstaId == grupa.vrstaId)?.naziv;
      grupa.porezNaziv = this.porezi.find((porez) => porez.porezId == grupa.porezId)?.nazivPoreza;
    });
    this.grupeDB = this.grupe;
  }

  async onSubmit() {
    this.grupa.klijentId = this.klijentId;
    await this._groupService.addGroupPromise(this.grupa);
    this.getGroups();
    this.toastService.showSuccess("Uspješno ste dodali novu grupu", "Uspješno!");
  }

  async updateGroups() {
    await this._groupService.updateGroupPromise(this._groupService.formData.grupaId, this._groupService.formData);
    this.getGroups();
    this.toastService.showSuccess("Uspješno ste izmjenili grupu", "Uspješno!");
  }

  Zatvori() {
    this.router.navigate(["/adminpanel/groups"]);
  }

  async DeleteGroup() {
    await this._groupService.deleteGroupPromise(this.idgroup);
    this.getGroups();
    this.toastService.showSuccess("Uspješno ste obrisali grupu", "Uspješno!");
    this.modalService.dismissAll();
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  filterPoNazivu(pretraga: any) {
    this.grupe = this.grupeDB.filter(obj => obj.klijentId == this.currUser.klijentId && obj.naziv.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  /**Modal Add */
  Add(content: any) {
    this.grupa = new Groups();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content: any, item: Groups) {
    this.idgroup = item.grupaId;
    this._groupService.formData = Object.assign({}, item);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  Delete(content2: any, item: Groups) {
    // console.log(item.grupaId);
    this.idgroup = item.grupaId;
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

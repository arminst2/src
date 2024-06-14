import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../authentication/authentication-service';
import { Client } from '../models/client.model';
import { User } from '../models/user.model';
import { ClientService } from '../services/client.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl:'./admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  closeResult:string="";
  currUser?: User;
  currClient?: Client;
  ImageM:any='';
  klijentId: number = 0;
  korisnikId: number = 0;
  isAdmin = false;
  constructor(
    private _sanitizer: DomSanitizer,
    private _clientService: ClientService,
    private modalService: NgbModal, 
    public service: AuthenticationService, 
    private router: Router, 
    private _korisnikService:UserService
    ) {
 }

  async ngOnInit() {
    this.getData();
  }

  async getData() {
    await this.getTokens();
    await this.getCurrentClient();
    await this.getCurrentUser();
    await this.getIsAdmin();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getCurrentClient() {
    this.currClient = await this._clientService.getClientByIdPromise(this.klijentId);
    this.ImageM = this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + atob(this.currClient.image!));
  }

  async getCurrentUser() {
    this.currUser = await this._korisnikService.getUserByIdPromise(this.korisnikId);
  }

  async getIsAdmin() {
    this.isAdmin = await this._korisnikService.getIsAdmin(this.korisnikId);
  }

  /**Modal Add */
  Add(content:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content1:any) {
    this.modalService.open(content1, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  Delete(content2:any) {
    this.modalService.open(content2, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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

  odjavi(){
    this.service.logout();
    this.router.navigate(['prijava/0']);
  }


}

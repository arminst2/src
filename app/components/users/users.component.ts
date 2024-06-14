import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

import { FormGroup } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  loginForm?: FormGroup;
  loading = false;
  submitted = false;
  returnUrl?: string;
  error = '';
  user: User = new User();
  currUser!: User;
  users: User[] = [];
  usersDB: User[] = [];
  isAdmin: boolean = false;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  klijentId: number = 0;
  korisnikId: number = 0;
  korisnikDeleteId: number = 0;
  closeResult: string = '';

  constructor(
    private router: Router, 
    private modalService: NgbModal,
    public _userService: UserService, 
    private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.getData();
  }

  async getData() {
    this.getTokens();
    await this.getIsAdmin();
    await this.getUsers();
    await this.getCurrentUser();    
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getIsAdmin() {
    this.isAdmin = await this._userService.getIsAdmin(this.korisnikId);
  }

  async getUsers() {
    this.users = await this._userService.getUsersPromise(this.klijentId)
    this.usersDB = this.users;
  }

  async getCurrentUser() {
    this.currUser = await this._userService.getUserByIdPromise(this.korisnikId)
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage*(pageNum - 1);
  }

  filterPoNazivu(pretraga:any){
    if(pretraga == ""){
      this.users = this.usersDB;
    }
    else{
      this.users = this.usersDB.filter((user: any) => user.ime.toLowerCase().includes(pretraga.toLowerCase()));
    }
  }

  dodaj() {
    this._userService.formData = Object.assign({}, new User());
    this.router.navigate(['/adminpanel/adduser']);
  }

  uredi(user: User) {
    this._userService.formData = user;
    this.router.navigate(['/adminpanel/adduser']);
  }

  async obrisi() {
    await this._userService.deleteUsersPromise(this.korisnikDeleteId);
    this.toastService.showSuccess("Uspješno ste obrisali korisnika!", "Uspješno!");
    this.getUsers();
  }

  DeleteModal(content: any, userId: number) {
    this.korisnikDeleteId = userId!;
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

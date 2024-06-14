import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IArtikl } from '../models/artikl.model';
import { Subscriber, Subscription } from 'rxjs';
import { ArtiklService } from '../services/artikl.service';
import { ActivatedRoute } from '@angular/router';
import { Groups } from '../models/grupe.model';
import { Manufacturer } from '../models/manufacturer.model';
import { GroupsService } from '../services/groups.service';
import { ManufacturerService } from '../services/manufacturer.service';
import { GradService } from '../services/grad.service';
import { JedinicamjereService } from '../services/jedinicamjere.service';
import { IJedinicaMjere } from '../models/jedinicamjere.model';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { PorezService } from '../services/porez.service';
import { ToastService } from '../services/toast.service';
//import { parse } from 'path';



@Component({
  selector: 'app-items',
  templateUrl: '/items.component.html',
  styleUrls: ['/items.component.css']
})
export class ItemsComponent implements OnInit {
  
  public artikli: IArtikl[] = [];
  public artikliDB: IArtikl[] = [];
  grupe: Groups[] = [];
  proizvodjaci: Manufacturer[] = [];
  jediniceMjere: IJedinicaMjere[] = [];
  porezi: any[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  pageSize!: number;
  closeResult: string = '';
  artikl!: IArtikl;
  idartikl: number = 0;
  // private routeSub!: Subscription;
  currUser!: User;
  lastArticle: IArtikl;  
  klijentId: number = 0;
  korisnikId: number = 0;
  sortirajPoNazivuOpadajuce:boolean=false;
  sortirajPoSifri:boolean=false;

  
 
 


  constructor(
   
    public _artiklService: ArtiklService, 
    public _jedinicaMjereService: JedinicamjereService,
    private modalService: NgbModal,
    // private route: ActivatedRoute, 
    public _grupeService: GroupsService,
    public _proizvodjacService: ManufacturerService,
    private _korisnikService: UserService, 
    private _porezService: PorezService,
    private toastService: ToastService) 
    {
      this.artikl = new IArtikl();

      
      
  }
 
  ngOnInit(): void {
    this.getData();
    
  }

  
  async getData() {
    await this.getTokens();
    await this.getProizvodjaci();
    await this.getJediniceMjere();
    await this.getGroups();
    await this.getPorezi();
    await this.getArtikli();
 


    
  }
  
  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getProizvodjaci() {
    this.proizvodjaci = await this._proizvodjacService.getManufacturersPromise(this.klijentId);
  }

  async getJediniceMjere() {
    this.jediniceMjere = await this._jedinicaMjereService.getJedinicaMjerePromise();
  }

  async getGroups() {
    this.grupe = await this._grupeService.getGroupsPromise(this.klijentId);
  }

  async getPorezi() {
    this.porezi = await this._porezService.getPorezPromise(this.klijentId);
  }
  
  async  getArtikli() {
    this.artikli = await this._artiklService.getArtikliPromise(this.klijentId);
    this.artikli.map((artikal:any) => {
      artikal.jedinicaMjereNaziv = this.jediniceMjere.find((jedinica:any) => jedinica.jedinicaMjereId == artikal.jedinicaMjereId)?.naziv;
      artikal.grupaNaziv = this.grupe.find((grupa:any) => grupa.grupaId == artikal.grupaId)?.naziv;
      artikal.proizvodjacNaziv = this.proizvodjaci.find((proizvodjac:any) => proizvodjac.proizvodjacId == artikal.proizvodjacId)?.naziv;
    });
    this.artikliDB = this.artikli;
  }

  async onSubmit() {
    if(this.artikl.nc !== undefined && this.artikl.marza !== undefined)
      this.artikl.vpc=this.artikl.nc-(1/this.artikl.marza);
    if(this.artikl.mpc !== undefined && this.artikl.nc !== undefined && this.artikl.mpc !== undefined)
      this.artikl.marzaIznos=(this.artikl.mpc-this.artikl.nc)/this.artikl.mpc;
    if(this.artikl.mpc !== undefined && this.artikl.nc !== undefined)
      this.artikl.marzaIznos=this.artikl.mpc-this.artikl.nc;
    if(this.artikl.nc === undefined)
      this.artikl.nc = 0;
    if(this.artikl.marza === undefined)
      this.artikl.marza = 0;
    if(this.artikl.vpc === undefined)
      this.artikl.vpc = 0;
    if(this.artikl.mpc === undefined)
      this.artikl.mpc = 0;
    if(this.artikl.cijenaHh === undefined)
      this.artikl.cijenaHh = 0;
    await this._artiklService.addArtiklPromise(this.artikl)
    await this.getArtikli();
    this.toastService.showSuccess("Uspješno dodan artikl", "Uspješno");
  }

  async updateArtikl() {
    if(this._artiklService.formData.mpc !== undefined && this._artiklService.formData.nc !== undefined)
      this._artiklService.formData.marzaIznos=this._artiklService.formData.mpc-this._artiklService.formData.nc;
    await this._artiklService.updateArtiklPromise(this._artiklService.formData.artiklId, this._artiklService.formData);
    await this.getArtikli();
    this.toastService.showSuccess("Uspješno izmjenjen artikl", "Uspješno");
  }

  async DeleteArtikl() {
    await this._artiklService.deleteArtiklPromise(this.idartikl);
    await this.getArtikli();
    this.toastService.showSuccess("Uspješno obrisan artikl", "Uspješno");
    this.modalService.dismissAll();
  }

  filterPoNazivu(pretraga:any){
    this.artikli = this.artikliDB.filter(obj => obj.naziv.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }
  Sortiranje()
  {
    if(!this.sortirajPoNazivuOpadajuce){
      this.artikli.sort((a,b)=>{
      return a.grupaNaziv.localeCompare(b.grupaNaziv)
    });
  }else{
      this.artikli.sort((a,b)=>{
        return b.grupaNaziv.localeCompare(a.grupaNaziv)
      });
}
  this.sortirajPoNazivuOpadajuce=!this.sortirajPoNazivuOpadajuce;
}
SortiranjePoSifri()
  {
    if(!this.sortirajPoSifri){
      this.artikli.sort((a,b)=>{
      return a.sifra.localeCompare(b.sifra)
    });
  }else{
      this.artikli.sort((a,b)=>{
        return b.sifra.localeCompare(a.sifra)
      });
      this.sortirajPoSifri=!this.sortirajPoSifri;
}
  
}


  odabranaGrupa() {
    if (this.artikl.grupaId) {
      var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this.artikl.grupaId);
      var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
      if(this.artikl.vpc !== undefined){
        this.unosCijene();
        this.artikl.mpc = +(this.artikl.vpc * (1 + porez.stopa / 100)).toFixed(2);
      }
    }
  }

  odabranaGrupaUpdate(){
    if (this._artiklService.formData.grupaId) {
      var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this._artiklService.formData.grupaId);
      var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
      this.unosCijeneUpdate();
      this._artiklService.formData.mpc = +(this._artiklService.formData.vpc * (1 + porez.stopa / 100)).toFixed(2);
    }
  }

  unosNC() {
    this.artikl.marza ? this.artikl.marza : this.artikl.marza = 0;
    this.artikl.vpc = +(this.artikl.nc * (1 + this.artikl.marza / 100)).toFixed(2);
    if (this.artikl.grupaId) {
      var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this.artikl.grupaId);
      var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
      this.artikl.mpc = +(this.artikl.vpc * (1 + porez.stopa / 100)).toFixed(2);
    }
  }

  unosMarza() {
    this.artikl.nc ? this.artikl.nc : this.artikl.nc = 0;
    this.artikl.vpc = +(this.artikl.nc * (1 + this.artikl.marza / 100)).toFixed(2);
    if (this.artikl.grupaId) {
      var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this.artikl.grupaId);
      var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
      this.artikl.mpc = +(this.artikl.vpc * (1 + porez.stopa / 100)).toFixed(2);
    }
  }

  unosNCUpdate() {
    this._artiklService.formData.marza ? this._artiklService.formData.marza : this._artiklService.formData.marza = 0;
    this._artiklService.formData.vpc = +(this._artiklService.formData.nc * (1 + this._artiklService.formData.marza / 100)).toFixed(2);
    if (this._artiklService.formData.grupaId) {
      var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this._artiklService.formData.grupaId);
      var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
      this._artiklService.formData.mpc = +(this._artiklService.formData.vpc * (1 + porez.stopa / 100)).toFixed(2);
    }
  }

  unosMarzaUpdate() {
    this._artiklService.formData.nc ? this._artiklService.formData.nc : this._artiklService.formData.nc = 0;
    this._artiklService.formData.vpc = +(this._artiklService.formData.nc * (1 + this._artiklService.formData.marza / 100)).toFixed(2);
    if (this._artiklService.formData.grupaId) {
      var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this._artiklService.formData.grupaId);
      var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
      this._artiklService.formData.mpc = +(this._artiklService.formData.vpc * (1 + porez.stopa / 100)).toFixed(2);
    }
  }

  unosVPC() {
    this.odabranaGrupa();
    if (this.artikl.nc > 0 && this.artikl.vpc > 0) {
      this.artikl.marza = +(((this.artikl.vpc - this.artikl.nc) / this.artikl.nc) * 100).toFixed(2);
      if (this.artikl.grupaId) {
        var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this.artikl.grupaId);
        var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
        this.artikl.mpc = +(this.artikl.vpc * (1 + porez.stopa / 100)).toFixed(2);
      }
    }
  }

  unosCijene() {
    //if (this.artikl.vpc > 0) {
      if (this.artikl.grupaId) {
        var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this.artikl.grupaId);
        var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
        this.artikl.vpc = +(this.artikl.mpc / (1 + porez.stopa / 100)).toFixed(2);
        if(this.artikl.nc > 0){
          this.artikl.marza = +((((this.artikl.mpc / (1 + porez.stopa / 100)) / this.artikl.nc) - 1) * 100).toFixed(2);
        }
      }else{
        this.artikl.vpc = +(this.artikl.mpc / 1).toFixed(2);
      }
    //}
  }

  unosVPCUpdate() {
    if (this._artiklService.formData.nc > 0 && this._artiklService.formData.vpc > 0) {
      this._artiklService.formData.marza = +(((this._artiklService.formData.vpc - this._artiklService.formData.nc) / this._artiklService.formData.nc) * 100).toFixed(2);
      if (this._artiklService.formData.grupaId) {
        var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this._artiklService.formData.grupaId);
        var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
        this._artiklService.formData.mpc = +(this._artiklService.formData.vpc * (1 + porez.stopa / 100)).toFixed(2);
      }
    }
  }

  unosCijeneUpdate() {
    //if (this._artiklService.formData.vpc > 0) {
      if (this._artiklService.formData.grupaId) {
        var grupa = this.grupe.find((grupa:any) => grupa.grupaId == this._artiklService.formData.grupaId);
        var porez = this.porezi.find((porez:any) => porez.porezId == grupa?.porezId);
        this._artiklService.formData.vpc = +(this._artiklService.formData.mpc / (1 + porez.stopa / 100)).toFixed(2);
        if(this._artiklService.formData.nc > 0){
          this._artiklService.formData.marza = +((((this._artiklService.formData.mpc / (1 + porez.stopa / 100)) / this._artiklService.formData.nc) - 1) * 100).toFixed(2);
        }
      }
    //}
  }

  public onPageChange(pageNum: number): void {
    this.pageSize = this.itemsPerPage * (pageNum - 1);
  }

  /**Modal Add */
  Add(content: any) {
    this.artikl = new IArtikl();
    if (this.artikli.length > 0) {
      this.artikl.sifra = (Number.parseInt(this.artikli[this.artikli.length - 1].sifra!) + 1).toString();
      this.artikl.fisbroj = (this.artikli[this.artikli.length - 1].fisbroj! + 1);
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Update */
  Update(content1: any, item: IArtikl) {
    this.idartikl = item.artiklId;
    this._artiklService.formData = Object.assign({}, item);
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal Delete */
  Delete(content2: any, item: IArtikl) {
    // console.log(item.artiklId);
    this.idartikl = item.artiklId;
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

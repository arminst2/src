import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { IArtikl } from '../models/artikl.model';
import { IStavka } from '../models/stavka.model';
import { IRacun } from '../models/racun.model';
import { ArtiklService } from '../services/artikl.service';
import { RacunService } from '../services/racun.service';
import { StavkaService } from '../services/stavka.service';
import { Skladiste } from '../models/skladiste.model';
import { VrstaPlacanja } from '../models/vrstaplacanja.model';
import { Valuta } from '../models/valuta.model';
import { VrstaplacanjaService } from '../services/vrstaplacanja.service';
import { ValutaService } from '../services/valuta.service';
import { SkladisteService } from '../services/skladiste.service';
import { JedinicamjereService } from '../services/jedinicamjere.service';
import { IJedinicaMjere } from '../models/jedinicamjere.model';
import { User } from '../models/user.model';
import { Customer } from '../models/customer.model';
import { CustomerService } from '../services/customer.service';
import { GradService } from '../services/grad.service';
import { FormControl, NgForm } from '@angular/forms';
import { formatDate } from '@angular/common';
import { GroupsService } from '../services/groups.service';
import { PorezService } from '../services/porez.service';
import { ToastService } from '../services/toast.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DateAdapter } from '@angular/material/core';
import { Grad } from '../models/grad.model';
import { UserService } from '../services/user.service';
import { ClientService } from '../services/client.service';
import { DomSanitizer } from '@angular/platform-browser';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-edit-outputs',
  templateUrl: './edit-outputs.component.html',
  styleUrls: ['./edit-outputs.component.css']
})
export class EditOutputsComponent implements OnInit {
  closeResult: string = '';
  id: number = 0;
  racun!: IRacun;
  racunZaPoredit!: IRacun;
  artikl: any;
  stavka: IStavka = new IStavka();
  stavkaZaDelete: IStavka = new IStavka();
  public artikli: IArtikl[] = [];
  public stavke: IStavka[] = [];
  public grupe: any[] = [];
  public stope: any[] = [];
  public jedinicemjere: IJedinicaMjere[] = [];
  skladista: Skladiste[] = [];
  vrsteplacanja: VrstaPlacanja[] = [];

  public stavkeZaPrikazSaId: IStavka[] = [];
  private routeSub!: Subscription;
  valute: Valuta[] = [];
  currUser!: User;
  customer: any;
  customers: Customer[] = [];
  customersDB: Customer[] = [];
  gradovi: Grad[] = [];
  promjenaCust: boolean = false;
  datum2: Date;
  currentArticleVPC: any; 
  stavkaRabatUkupno: any;
  stavkaIznos: any;
  promiseStavke: any;
  stavkaVPCRabatIznos: any;
  stavkaVPCRabatArtikal: any;
  stavkaMPCRabat: any;
  stopa: any;
  klijent: any;
  artiklNaziv: any;
  public artikliFilter: IArtikl[] = [];
  _routerSub = Subscription.EMPTY;
  ifsubmit: boolean = true;
  isAdmin: boolean = true;
  klijentId: number = 0;
  korisnikId: number = 0;
  idDokumenta: number = 1;
  @ViewChild('updateForm') updateForm: NgForm;
  @ViewChild('submitStavka') submitStavka: NgForm;
  dateDatumDospijeca = new FormControl(); 

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private _racunService: RacunService,
    private _artiklService: ArtiklService,
    private _stavkaService: StavkaService,
    private _vrstaPlacanja: VrstaplacanjaService,
    private _valuteService: ValutaService,
    private _skladisteService: SkladisteService,
    private _jediniceMjereService: JedinicamjereService,
    private _customerService: CustomerService,
    private _korisnikService: UserService,
    private _klijentService: ClientService,
    private _gradService: GradService,
    private _grupeService: GroupsService,
    private _porezService: PorezService,
    private toastService: ToastService,
    private dateAdapter: DateAdapter<Date>,
    private _sanitizer: DomSanitizer
  ) {
    this._routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        if (this.ifsubmit) {
          if (this.canDeactivate()) {
            router.navigateByUrl(router.url, { replaceUrl: true });
          } else {
          }
        }
      }
    });
  }
 
  ngOnInit(): void {
    this.getData();
    this.setDefaults();
  }

  setDefaults() {
    this.dateAdapter.setLocale('bs');
    this.racun = new IRacun();
    this.stavka = new IStavka();
    this.stavka.rabat1 = 0;
    this.stavka.rabat2 = 0;
    this.artikl = null;
    this.customer = null;
  }

  async getData() {
    this.getTokens();
    await this.getIsAdmin();
    await this.getSkladista();
    await this.getGradovi();
    await this.getCustomers();
    await this.getRacun();
    await this.getJediniceMjere();
    await this.getVrstePlacanja();
    await this.getValute();
    await this.getArtikli();
    await this.getGrupe();
    await this.getStope();
    await this.getStavke();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getIsAdmin() {
    this.isAdmin = await this._korisnikService.getIsAdmin(this.korisnikId);
  }

  async getSkladista() {
    this.skladista = await this._skladisteService.getSkladistePromise(this.klijentId);
  }

  async getGradovi() {
    this.gradovi = await this._gradService.getGradoviPromise(this.klijentId);
  }

  async getCustomers() {
    this.customers = await this._customerService.getCustomersPromise(this.klijentId);
    this.customers.map((customer: any) => {
      customer.gradNaziv = this.gradovi.find((grad: any) => grad.gradId == customer.gradId)?.naziv;
    });
    this.customersDB = this.customers;
  }

  getCustomer(kupacId: number) {
    this.customer = this.customers.find(c => c.kupacId == kupacId);
  }

  async getRacun() {
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id']
    });
    this.racun = await this._racunService.getRacunByIdPromise(this.id);
    this.dateDatumDospijeca.setValue(this.racun.datumDospjeca);
    this.datum2 = this.racun.datum;
    this.getCustomer(this.racun.kupacId);
    this.racunZaPoredit = Object.assign({}, this.racun);
  }

  async getJediniceMjere() {
    this.jedinicemjere = await this._jediniceMjereService.getJedinicaMjerePromise();
  }

  async getVrstePlacanja() {
    this.vrsteplacanja = await this._vrstaPlacanja.getVrstaPromise(this.klijentId);
  }

  async getValute() {
    this.valute = await this._valuteService.getValutaPromise();
  }

  async getArtikli() {
    this.artikli = await this._artiklService.getArtikliPromise(this.klijentId);
    this.artikliFilter = this.artikli;
  }

  async getGrupe() {
    this.grupe = await this._grupeService.getGroupsPromise(this.klijentId);
  }

  async getStope() {
    this.stope = await this._porezService.getPorezPromise(this.klijentId)
  }

  async getStavke() {
    var stavkePromise = await this._stavkaService.getStavkePromise(this.klijentId, this.idDokumenta, this.id)
    stavkePromise.forEach(async stavka => {
      var article = this.artikli.find(art => art.artiklId == stavka.artiklId);
      if (article != null) {
        stavka.nazivArtikla = article.naziv
        stavka.sifraArtikla = article.sifra
        // stavka.vpc = article.vpc
        // stavka.mpc = article.mpc
        stavka.jedMjere = article.jedinicaMjereId
        if (article.jedinicaMjereId != null) {
          var jedMjera = this.jedinicemjere.find(jm => jm.jedinicaMjereId == article!.jedinicaMjereId);
          stavka.jedMjereNaziv = jedMjera!.naziv
          var grupa = this.grupe.find(gr => gr.grupaId == article!.grupaId);
          var stopa = this.stope.find(st => st.porezId == grupa!.porezId);
          var porez = this.stope.find(st => st.porezId == grupa!.porezId);
          stavka.stopaPoreza = stopa!.stopa
          this.stavka.porezId = porez.porezId;
        } else {
          stavka.jedMjereNaziv = ""
        }
      } else {
        stavka.nazivArtikla = "Artikl nije pronadjen"
        stavka.sifraArtikla = "Artikl nije pronadjen"
        stavka.vpc = 0
        stavka.mpc = 0
        stavka.jedMjere = 0
      }
      if (stavka.racunId == this.id) {
        this.stavkeZaPrikazSaId.push(stavka)
      }
    });
    this.stavke = stavkePromise.map((stavka, index) => {
      stavka.index = index + 1
      return stavka
    })
    this.stavke.sort((a, b) => a.index - b.index)
  }

  async getKlijent() {
    this.klijent = await this._klijentService.getClientByIdPromise(this.klijentId);
  }

  async getKorisnik() {
    this.currUser = await this._korisnikService.getUserByIdPromise(this.korisnikId);
  }

  ngOnDestroy() {
    this._routerSub.unsubscribe();
  }

  canDeactivate(): boolean {
    if (JSON.stringify(this.racun) !== JSON.stringify(this.racunZaPoredit)) {
      if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.canDeactivate()) {
      return false; // ako ima promjena returning false otvara dialog
    } return true; // ako nema promjena refresha
  }

  async DeleteStavka(idStavke: any) {
    if(this.racun.zakljucan == true){
      this.toastService.showError('Račun je zaključan i ne možete ga mijenjati.', 'Račun je zaključan!');
      this.modalService.dismissAll();
      return;
    }
    var stavka = this.stavke.find(st => st.stavkeId == idStavke);
    this.racun.iznosSaPdv -= Number(stavka!.mpv);
    this.racun.iznosRacuna -= Number(stavka!.vpv);
    this.racun.iznosPoreza -= Number(stavka!.mpv) - Number(stavka!.vpv);
    await this._racunService.updateRacunPromise(this.racun.racunId, this.racun).then(data => {
      this.racun = data
      this.racunZaPoredit = data;
      this.toastService.showSuccess('Račun uspješno ažuriran!', 'Uspješno ste ažurirali račun!');
      this.getRacun();
    });
    await this._stavkaService.deleteStavkaPromise(idStavke);
    this.modalService.dismissAll();
    this.toastService.showSuccess('Stavka uspješno obrisana!', 'Uspješno ste obrisali stavku na računu.');
    this.getStavke();
  }

  async dobaviCustomers() {
    this.customers = await this._customerService.getCustomersPromise(this.klijentId);
  }

  Search(pretraga: any) {
    this.artikliFilter = this.artikli.filter(fil => fil.naziv.toLowerCase()?.includes(pretraga.value.toLowerCase()))
  }

  filterPoNazivuKupac(pretraga: any) {
    this.customers = this.customersDB.filter(obj => obj.naziv?.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  async addStavka(id: any) {
    if(this.racun.zakljucan == true){
      this.toastService.showError('Račun je zaključan i ne možete ga mijenjati.', 'Račun je zaključan!');
      this.modalService.dismissAll();
      return;
    }
    this.stavka.artiklId = this.artikl.artiklId;
    this.stavka.klijentId = this.racun.klijentId;
    // this.stavka.skladisteIzlazId = this.racun.skladisteIzlazId;
    this.stavka.jedMjere = this.artikl.jedinicaMjereId;
    this.stavka.redniBroj = this.stavke.length + 1;
    this.stavka.racunId = id;
    this.stavka.cijenaBezPdv = this.submitStavka.controls['cijenaBezPdv'].value;
    this.stavka.nabavnaCijena = this.artikl.nc
    // this.stavka.rabat= this.stavkaRabatUkupno
    this.stavka.vpc = parseFloat(this.stavkaVPCRabatArtikal)
    this.stavka.vpv = parseFloat(this.stavkaVPCRabatIznos)
    this.stavka.mpv = parseFloat(this.stavkaMPCRabat)
    this.stavka.dokumentId = this.racun.dokumentId;
    this.stavka.ulaznaCijena = parseFloat(this.currentArticleVPC);
    if (this.stavka.rabat2 == null) {
      this.stavka.rabat2 = 0;
    }
    if (this.stavka.rabat1 == null) {
      this.stavka.rabat1 = 0;
    }
    if (this.stavka.rabat2Iznos == null) {
      this.stavka.rabat2Iznos = 0;
    }
    if (this.stavka.rabat1Iznos == null) {
      this.stavka.rabat1Iznos = 0;
    }
    if (this.stavka.rabatStopa == null) {
      this.stavka.rabatStopa = 0;
    }
    this.racun.iznosSaPdv += this.stavka.mpv;
    this.racun.iznosRacuna += this.stavka.vpv;
    this.racun.iznosPoreza += this.stavka.mpv - this.stavka.vpv;
    await this._racunService.updateRacunPromise(this.racun.racunId, this.racun).then(data => {
      this.racun = data
      this.racunZaPoredit = data;
      this.toastService.showSuccess('Račun uspješno ažuriran!', 'Uspješno ste ažurirali račun!');
      this.getRacun();
    });
    await this._stavkaService.addStavkaPromise(this.stavka).then(data => {
      this.stavka = data
      this.toastService.showSuccess('Stavka uspješno dodana!', 'Uspješno ste dodali stavku na račun.');
      this.getStavke();
      this.resetStavkaForma();
    })
  }

  resetStavkaForma() {
    this.artikliFilter = this.artikli;
    this.artikl = null;
    this.stavka = new IStavka();
    this.stavka.rabat1 = 0;
    this.stavka.rabat2 = 0;
    this.currentArticleVPC = 0;
    this.stavkaIznos = 0;
    this.stavkaRabatUkupno = 0;
    this.stavkaVPCRabatArtikal = 0;
    this.stavkaVPCRabatIznos = 0;
    this.stavkaMPCRabat = 0;
  }

  async updateRacun() {
    if(this.racun.zakljucan == true){
      this.toastService.showError('Račun je zaključan i ne možete ga mijenjati.', 'Račun je zaključan!');
      return;
    }
    this.ifsubmit = false;
    this.racun.datumRacuna = this.updateForm.controls['datumRacuna'].value;
    this.racun.datumDospjeca = this.dateDatumDospijeca.value//this.updateForm.controls['datumDospjeca'].value;
    this.racun.datumRacuna = new Date(formatDate(this.racun.datumRacuna, 'EEEE, MMMM d, y, h:mm:ss a zzzz', 'en-US', '+2400'));
    this.racun.datumDospjeca = new Date(formatDate(this.racun.datumDospjeca, 'EEEE, MMMM d, y, h:mm:ss a zzzz', 'en-US', '+2400'));
    this.racun.datum = this.datum2;
    this.racun.kupacId = this.customer.kupacId;
    this.racun = await this._racunService.updateRacunPromise(this.racun.racunId, this.racun);
    this.toastService.showSuccess('Račun uspješno ažuriran!', 'Uspješno ste ažurirali račun!');
    this.racunZaPoredit = this.racun;
    this.getRacun();
  }

  ToSection(id: string) {
    document.getElementById(id)?.scrollIntoView();
  }

  /**Modal GetStavke */
  Get(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  rabatCalc() {
    if (this.stavka.kolicina != 0 && this.currentArticleVPC != 0) {
      this.stavkaIznos = (this.stavka.kolicina * this.currentArticleVPC)
      this.stavkaVPCRabatIznos = this.stavkaIznos;
      this.stavkaVPCRabatIznos = this.stavkaVPCRabatIznos.toFixed(2);
      this.stavka.faktIznos = this.stavkaVPCRabatIznos;
      this.stavka.porezIznos = this.stavkaVPCRabatIznos * this.stopa / 100;
      this.stavka.porezJedIznos = this.stavka.porezIznos / this.stavka.kolicina;
    }
    var cijbezpdv = this.submitStavka.controls['cijenaBezPdv'].value;
    let rabatCijena = (this.stavka.kolicina * cijbezpdv * this.stavka.rabat1 / 100)
    let rabat2 = (this.stavka.kolicina * cijbezpdv - rabatCijena) * this.stavka.rabat2 / 100
    let rabat = (rabatCijena + rabat2)
    this.stavkaRabatUkupno = rabat
    this.stavkaRabatUkupno = this.stavkaRabatUkupno.toFixed(2);
    // this.stavka.rabat=Number.parseFloat(this.stavkaRabatUkupno.toFixed(2));
    if (isNaN(this.stavka.rabat)) {
      this.stavkaRabatUkupno = 0;
      this.stavka.rabat = 0;
      this.stavka.rabatStopa = 0;
    } else {
      this.artikl.nc = this.stavka.cijenaBezPdv;
    }
  }

  calcVPC() {
  }

  calcMPC() {
  }

  calc() {
    if (this.stavkaIznos != 0 && this.stavkaRabatUkupno != 0) {
      this.stavkaVPCRabatIznos = (this.stavkaIznos - this.stavkaRabatUkupno)
      this.stavkaVPCRabatIznos = Number.parseFloat(this.stavkaVPCRabatIznos.toFixed(2));
      this.stavka.faktIznos = this.stavkaVPCRabatIznos
      this.stavka.porezIznos = (this.stavkaVPCRabatIznos * this.stopa / 100)
      this.stavka.porezJedIznos = this.stavka.porezIznos / this.stavka.kolicina;
    }
    if (this.currentArticleVPC != 0) {
      let rabat1 = this.currentArticleVPC * this.stavka.rabat1 / 100
      this.stavka.rabat1Iznos = rabat1 * this.stavka.kolicina
      // this.stavka.fc=this.currentArticleVPC - ( this.currentArticleVPC * rabat1 / 100)
      let rabat2;
      if (this.stavka.rabat2 != 0 && this.stavka.rabat2 != undefined) {
        rabat2 = (this.currentArticleVPC - rabat1) * this.stavka.rabat2 / 100
        this.stavka.rabat2Iznos = rabat2 * this.stavka.kolicina
        this.stavkaVPCRabatArtikal = (this.currentArticleVPC - rabat1) - rabat2
        this.stavkaVPCRabatArtikal = Number.parseFloat(this.stavkaVPCRabatArtikal.toFixed(2));
        // this.stavka.fc = (this.currentArticleVPC - this.stavka.fc) * rabat2 / 100;
        this.stavka.rabat = (rabat1 + rabat2) * this.stavka.kolicina
        this.stavka.rabatStopa = ((1 - (1 - this.stavka.rabat1 / 100) * (1 - this.stavka.rabat2 / 100)) * 100);
      } else {
        this.stavkaVPCRabatArtikal = this.currentArticleVPC - rabat1
        this.stavkaVPCRabatArtikal = Number.parseFloat(this.stavkaVPCRabatArtikal.toFixed(2));
        this.stavka.rabat = rabat1 * this.stavka.kolicina
        if (this.stavka.rabat1 != 0) {
          this.stavka.rabatStopa = (1 - this.stavka.rabat1 / 100) * 100;
        }
      }
      if (isNaN(this.stavka.rabat)) {
        this.stavkaRabatUkupno = 0;
        this.stavka.rabat = 0;
        this.stavka.rabatStopa = 0;
      }
      this.stavka.fc = this.stavkaVPCRabatArtikal
    }
    if (this.artikl.artiklId && this.stavkaVPCRabatIznos != 0 && this.stavkaVPCRabatIznos != undefined) {
      this.stavkaMPCRabat = +(this.stavkaVPCRabatIznos * (1 + this.stopa / 100))
      this.stavkaMPCRabat = Number.parseFloat(this.stavkaMPCRabat.toFixed(2));
      this.stavka.mpc = +(this.stavkaVPCRabatArtikal * (1 + this.stopa / 100))
    }
  }

  formatNumber(num: number) {
    return Number(new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num));
  }

  onKey(event: any) {
    let rabatCijena = this.stavka.kolicina * this.stavka.cijenaBezPdv * this.stavka.rabat1 / 100;
    let rabat2 = (this.stavka.kolicina * this.stavka.cijenaBezPdv - rabatCijena) * this.stavka.rabat2 / 100;
    let rabat = rabatCijena + rabat2;
  }

  getArtiklById(id: any) {
    this.artikl = this.artikliFilter.find(x => x.artiklId == id);
    this.currentArticleVPC = this.artikl.vpc;
    this.stavkaVPCRabatArtikal = this.artikl.vpc
    this.stavkaVPCRabatArtikal = Number.parseFloat(this.stavkaVPCRabatArtikal.toFixed(2));
    var grupa = this.grupe.find(x => x.grupaId == this.artikl.grupaId);
    var porez = this.stope.find(x => x.porezId == grupa.porezId);
    this.stopa = porez.stopa;
    this.stavka.stopaPoreza = porez.stopa;
    if (this.stavka.kolicina != undefined) {
      this.stavkaVPCRabatIznos = this.stavka.kolicina * this.stavkaVPCRabatArtikal
      this.stavkaVPCRabatIznos = Number.parseFloat(this.stavkaVPCRabatIznos.toFixed(2));
      this.stavkaMPCRabat = this.stavkaVPCRabatIznos * (1 + this.stopa / 100)
      this.stavkaMPCRabat = Number.parseFloat(this.stavkaMPCRabat.toFixed(2));
      this.rabatCalc();
      this.calc();
    }
    var input = document.getElementById('stavkaKolicina') as HTMLInputElement;
    input.focus();
    this.modalService.dismissAll();
  }

  async zakljucajRacun() {
    this.racun.zakljucan = true;
    this.racun = await this._racunService.setZakljucajRacun(this.racun.racunId, true)
    this.toastService.showSuccess('Račun je zaključan', 'Uspješno');
    this.racunZaPoredit = this.racun;
  }

  async otkljucajRacun() {
    this.racun.zakljucan = false;
    this.racun = await this._racunService.setZakljucajRacun(this.racun.racunId, false)
    this.toastService.showSuccess('Račun je otključan', 'Uspješno');
    this.racunZaPoredit = this.racun;
  }

  noPermission(){
    this.toastService.showError('Nemate ovlasti za ovu akciju', 'Greška kod otključavanja računa');
  }

  /**Modal Delete */
  Delete(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (this.promjenaCust == false) {
      this.dobaviCustomers();
    }
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  getCustomerById(id: any) {
    if (id != this.racun.kupacId) {
      this.promjenaCust = true;
    }
    this.customer = this.customers.find(x => x.kupacId == id);
    this.customer.gradNaziv = this.gradovi.find(x => x.gradId == this.customer.gradId)!.naziv;
    var today = new Date(this.racun.datumRacuna);
    today.setDate(today.getDate() + this.customer.brojDana);
    this.dateDatumDospijeca.setValue(today);
    this.modalService.dismissAll();
  }

  changeDatumRacuna(date: any) {
    var day = new Date(date);
    if (this.customer != null) {
      day.setDate(day.getDate() + this.customer.brojDana);
      this.dateDatumDospijeca.setValue(day);
    } else {
      this.dateDatumDospijeca.setValue(day);
    }
  }


  async printPdf() {
    await this.getKlijent();
    await this.getKorisnik();
    this.stavke.sort((a, b) => a.index - b.index);
    this.stavke.map((stavka) => {
      if (stavka.rabat2 == null) {
        stavka.rabat2 = 0;
      }
      if (stavka.rabat1 == null) {
        stavka.rabat1 = 0;
      }
      if (stavka.rabat2Iznos == null) {
        stavka.rabat2Iznos = 0;
      }
      if (stavka.rabat1Iznos == null) {
        stavka.rabat1Iznos = 0;
      }
    });
    console.log(this.klijent.image == '' ? 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=' : this._sanitizer.bypassSecurityTrustResourceUrl('data:image/webp;base64,' + atob(this.klijent.image!)));
    let docDefinition = {
      content: [
        {
          columns: [
            [
              {
                text: this.klijent.naziv,
                bold: true,
                style: 'fontSize'
              },
              {
                text: this.klijent.adresa,
                style: 'fontSize'
              },
              {
                text: 'Tel/Fax: ' + this.klijent.telefon,
                style: 'fontSize'
              },
              {
                text: 'ID Broj: ' + this.klijent.idbroj + ', PDV Broj: ' + this.klijent.pdvbroj,
                style: 'fontSize'
              },
              {
                text: 'Žiro Račun: ' + this.klijent.brojBankovnogRacuna,
                style: 'fontSize'
              },
            ],
            [
              {
                image: 'data:image/webp;base64,' + (this.klijent.image == '' ? 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=' : this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + this.klijent.image!)),
                width: 75,
                alignment: 'right',
                style: 'fontSize'
              }
            ]
          ]
        },
        {
          columns: [
            {
              table: {
                widths: [250],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.customer.naziv + '\n',
                      style: 'fontSize'
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.customer.adresa + '\n',
                      style: 'fontSize'
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.customer.gradNaziv + '\n',
                      style: 'fontSize'
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'PDV: ' + this.customer.pdvbroj + '\n',
                      style: 'fontSize'
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'JIB: ' + this.customer.idbroj + '\n',
                      style: 'fontSize'
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              }
            }, {
              text: `Račun: ${this.racun.brojRacuna}`,
              alignment: 'center',
              margin: [0, 20, 0, 0],
              style: 'fontSize'
            }],
        },
        {
          table: {
            widths: ['*'],
            body: [[""], [""]]
          },
          layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 0 : 1;
            },
            vLineWidth: function (i, node) {
              return 0;
            },
          }
        },
        {
          columns: [
            {
              columns: [
                {
                  stack: [
                    {
                      text: 'Datum Računa: ',
                      style: 'fontSize'
                    },
                    {
                      text: 'Datum Unosa: ',
                      style: 'fontSize'
                    },
                    {
                      text: 'Datum Plaćanja: ',
                      style: 'fontSize'
                    }
                  ]
                },
                {
                  stack: [
                    {
                      text: new Date(this.racun.datumRacuna).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace('/', '.').replace('/', '.'),
                      alignment: 'right',
                      style: 'fontSize'
                    },
                    {
                      text: new Date(this.racun.datum).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace('/', '.').replace('/', '.'),
                      alignment: 'right',
                      style: 'fontSize'
                    },
                    {
                      text: new Date(this.racun.datumDospjeca).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace('/', '.').replace('/', '.'),
                      alignment: 'right',
                      style: 'fontSize'
                    }
                  ],
                  margin: [0, 0, 20, 0]
                }
              ]
            },
            {
              columns: [
                {
                  stack: [
                    {
                      text: 'Skladište: ',
                      style: 'fontSize'
                    },
                    {
                      text: 'Vrsta Plaćanja: ',
                      style: 'fontSize'
                    },
                    {
                      text: 'Valuta: ',
                      style: 'fontSize'
                    }
                  ],
                  margin: [20, 0, 0, 0]
                },
                {
                  stack: [
                    {
                      text: this.skladista.find(f => f.skladisteId == this.racun.skladisteId)!.naziv,
                      alignment: 'right',
                      style: 'fontSize'
                    },
                    {
                      text: this.vrsteplacanja.find(f => f.vrstaPlacanjaId == this.racun.vrstaPlacanjaId)!.naziv,
                      alignment: 'right',
                      style: 'fontSize'
                    },
                    {
                      text: this.valute.find(f => f.valutaId == this.racun.valutaId)!.oznaka,
                      alignment: 'right',
                      style: 'fontSize'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          table: {
            widths: ['*'],
            body: [[""], [""]]
          },
          layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 0 : 1;
            },
            vLineWidth: function (i, node) {
              return 0;
            },
          }
        },
        {
          table: {
            headerRows: 2,
            widths: [25, 25, 50, '*', '*', '*', '*', '*', '*', '*', '*'],
            // widths: [25, 25, 77.5, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', '*'],
            body: [
              [
                {
                  text: 'R.Br.',
                  bold: true,
                  style: 'fontSizeS'
                },
                {
                  text: 'Šifra',
                  bold: true,
                  style: 'fontSizeS'
                },
                {
                  text: 'Naziv',
                  bold: true,
                  style: 'fontSizeS'
                },
                [
                  {
                    text: 'Kol.',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Jmj',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'VPC',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Iznos',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'Rabat1%',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Rabat1',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'Rabat2%',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Rabat2',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'Rabat%',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Rabat',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'FC',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Iznos',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'PDV%',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Iznos',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'MPC',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Iznos',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ]
              ],
              ...this.stavke.filter(f => f.racunId == this.racun.racunId)
                .map(p =>
                // [p.index, p.sifraArtikla, p.nazivArtikla, p.kolicina, 
                // p.vpc, p.rabat1, p.rabat2, p.cijenaBezPdv, p.mpc]
                {
                  return [
                    {
                      text: p.index.toString(),
                      alignment: 'center',
                      style: 'fontSizeS'
                    },
                    {
                      text: p.sifraArtikla,
                      alignment: 'center',
                      style: 'fontSizeS'
                    },
                    {
                      text: p.nazivArtikla,
                      alignment: 'left',
                      style: 'fontSizeS'
                    },
                    [
                      {
                        text: p.kolicina.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: this.jedinicemjere.find(f => f.jedinicaMjereId == p.jedMjere)!.naziv,
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                    ],
                    [
                      {
                        text: p.cijenaBezPdv.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: (Number(p.cijenaBezPdv) * Number(p.kolicina)).toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: p.rabat1.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: p.rabat1Iznos.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: p.rabat2.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: p.rabat2Iznos.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: p.rabatStopa.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: p.rabat.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: p.fc.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: (Number(p.fc) * Number(p.kolicina)).toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: p.stopaPoreza.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: p.porezIznos.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: p.mpc.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: p.mpv.toFixed(2),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                  ]
                }
                ),
            ],
            style: 'fontSize'
          },
          layout: 'lightHorizontalLines'
        },
        {
          table: {
            widths: ['*'],
            body: [[""], [""]]
          },
          layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 0 : 1;
            },
            vLineWidth: function (i, node) {
              return 0;
            },
          }
        },
        {
          margin: [0, 0, 0, 5],
          columns: [
            {
              table: {
                widths: [300, '*', '*'],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      text: ' ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      text: 'Ukupno:',
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    },
                    {
                      border: [false, false, false, false],
                      text: this.stavke.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + Number(Number(b.cijenaBezPdv) * Number(b.kolicina)), 0).toFixed(2).toString(),
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: 'Izradio: ' + this.currUser.ime + ' ' + this.currUser.prezime,
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      text: 'Rabat:',
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    },
                    {
                      border: [false, false, false, false],
                      text: this.stavke.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + Number(b.rabat), 0).toFixed(2).toString(),
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: ' ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      text: 'Osnovica:',
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    },
                    {
                      border: [false, false, false, false],
                      text: this.stavke.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + Number(Number(b.fc) * Number(b.kolicina)), 0).toFixed(2).toString(),
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: ' ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, true],
                      text: 'PDV:',
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    },
                    {
                      border: [false, false, false, true],
                      text: this.stavke.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + Number(b.porezIznos), 0).toFixed(2).toString(),
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      text: ' ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      text: 'Ukupno za platiti:',
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    },
                    {
                      border: [false, false, false, false],
                      text: (Number(this.stavke.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + Number(b.porezIznos), 0).toFixed(2)) +
                        Number(this.stavke.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + Number(Number(b.fc) * Number(b.kolicina)), 0).toFixed(2))).toFixed(2),
                      style: 'fontSize',
                      alignment: 'right',
                      bold: true
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              }
            }
          ]
        },
        {
          margin: [0, 20, 0, 0],
          columns: [
            {
              table: {
                widths: ['*', '*', '*', '*', '*'],
                body: [
                  [
                    {
                      text: ' ',
                      border: [false, false, false, false]
                    },
                    {
                      text: 'Izdao:',
                      border: [false, false, false, false],
                      alignment: 'center',
                      style: 'fontSize',
                    },
                    {
                      text: ' ',
                      border: [false, false, false, false]
                    },
                    {
                      text: 'Preuzeo:',
                      border: [false, false, false, false],
                      alignment: 'center',
                      style: 'fontSize',
                    },
                    {
                      text: ' ',
                      border: [false, false, false, false]
                    }
                  ],
                  [
                    {
                      text: ' ',
                      border: [false, false, false, false]
                    },
                    {
                      text: ' ',
                      border: [false, false, false, true],
                    },
                    {
                      text: ' ',
                      border: [false, false, false, false]
                    },
                    {
                      text: ' ',
                      border: [false, false, false, true]
                    },
                    {
                      text: ' ',
                      border: [false, false, false, false]
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false,
              }
            }
          ]
        },
      ],
      styles: {
        fontSize: {
          fontSize: 8
        },
        fontSizeS: {
          fontSize: 6
        }
      }
    };
    pdfMake.createPdf(docDefinition).open();
  }
}

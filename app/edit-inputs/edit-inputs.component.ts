import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { IArtikl } from '../models/artikl.model';
import { Customer } from '../models/customer.model';
import { IJedinicaMjere } from '../models/jedinicamjere.model';
import { IRacun } from '../models/racun.model';
import { Skladiste } from '../models/skladiste.model';
import { IStavka } from '../models/stavka.model';
import { User } from '../models/user.model';
import { Valuta } from '../models/valuta.model';
import { VrstaPlacanja } from '../models/vrstaplacanja.model';
import { ArtiklService } from '../services/artikl.service';
import { CustomerService } from '../services/customer.service';
import { GradService } from '../services/grad.service';
import { JedinicamjereService } from '../services/jedinicamjere.service';
import { RacunService } from '../services/racun.service';
import { SkladisteService } from '../services/skladiste.service';
import { StavkaService } from '../services/stavka.service';
import { UserService } from '../services/user.service';
import { ValutaService } from '../services/valuta.service';
import { VrstaplacanjaService } from '../services/vrstaplacanja.service';
import { GroupsService } from '../services/groups.service';
import { PorezService } from '../services/porez.service';
import { ToastService } from '../services/toast.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ClientService } from '../services/client.service';
import { Groups } from '../models/grupe.model';
import { Porez } from '../models/porez.model';
import { DateAdapter } from '@angular/material/core';
import { Grad } from '../models/grad.model';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-edit-inputs',
  templateUrl: './edit-inputs.component.html',
  styleUrls: ['./edit-inputs.component.css']
})
export class EditInputsComponent implements OnInit {
  closeResult: string = '';
  id: number = 0;
  racun!: IRacun;
  racunZaPoredit!: IRacun;
  artikl: any;
  stavka: IStavka = new IStavka();
  public artikli: IArtikl[] = [];
  private routeSub!: Subscription;

  skladista: Skladiste[] = [];

  stavkeLista: IStavka[] = [];
  public stavkePrikaz: IStavka[] = [];
  public jedinicemjere: IJedinicaMjere[] = [];
  public valute: Valuta[] = [];
  public vrstePlacanja: VrstaPlacanja[] = [];
  stavkaBrisanje: IStavka = new IStavka();
  stavkaBrisanjecijene: IStavka = new IStavka();
  currUser!: User;
  _routerSub = Subscription.EMPTY;
  ifsubmit: boolean = true;

  brojDobavljaca: any;
  customer: any;
  customers: Customer[] = [];
  customersDB: Customer[] = [];
  klijent: any;
  grupe: Groups[] = [];
  porezi: Porez[] = [];
  gradovi: Grad[] = [];
  promiseStavke: any;
  mpc: any = 0;
  vpc: any = 0;
  marza: any = 0;
  artiklNaziv: any;
  public artikliFilter: IArtikl[] = [];
  @ViewChild('updateForm') updateForm: NgForm;

  dateDatumDanas = new FormControl();
  dateDatumRacuna = new FormControl();
  dateDatumDospijeca = new FormControl();

  azurirajArtikal: boolean = false;
  klijentId: number = 0;
  korisnikId: number = 0;
  idDokumenta: number = 2;
  isAdmin: boolean = true;

  constructor(
    private _racunService: RacunService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private _artiklService: ArtiklService,
    private _stavkaService: StavkaService,
    private router: Router,
    private _skladisteService: SkladisteService,
    private _vrstaPlacanja: VrstaplacanjaService,
    private _valutaService: ValutaService,
    private _jediniceMjereService: JedinicamjereService,
    private _korisnikService: UserService,
    private datePipe: DatePipe,
    private _customerService: CustomerService,
    private _grupeService: GroupsService,
    private _gradService: GradService,
    private _porezService: PorezService,
    private _valuteService: ValutaService,
    private toastService: ToastService,
    private _clientService: ClientService,
    private dateAdapter: DateAdapter<Date>,
    private cdr: ChangeDetectorRef
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
    this.setDefaults();
    this.getData();
  }

  setDefaults() {
    this.stavka = new IStavka();
    this.customer = null;
    this.stavka.rabat1 = 0;
    this.stavka.rabat2 = 0;
    this.racun = new IRacun();
    this.racunZaPoredit = new IRacun();
    this.dateAdapter.setLocale('bs');
  }

  async getData() {
    this.getTokens();
    await this.getIsAdmin();
    await this.getGradovi();
    await this.getCustomers();
    await this.getSkladista();
    await this.getValute();
    await this.getRacun();
    await this.getGrupe();
    await this.getPorez();
    await this.getArtikli();
    await this.getJediniceMjere();
    await this.getVrstePlacanja();
    await this.getStavke();
    await this.getCurrentKlijent();
    await this.getCurrentUser();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getIsAdmin() {
    this.isAdmin = await this._korisnikService.getIsAdmin(this.korisnikId);
  }

  async getGradovi() {
    this.gradovi = await this._gradService.getGradoviPromise(this.klijentId);
  }

  async getCustomers() {
    this.customers = await this._customerService.getCustomersPromise(this.klijentId);
    this.customers.map(customer => {
      customer.gradNaziv = this.gradovi.find(grad => grad.gradId == customer.gradId)?.naziv;
    })
    this.customersDB = this.customers;
  }
  
  async getSkladista() {
    this.skladista = await this._skladisteService.getSkladistePromise(this.klijentId);
  }

  async getRacun() {
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id']
    });
    this.racun = await this._racunService.getRacunByIdPromise(this.id);
    this.racun.datumRacuna = this.racun.datumRacuna;
    this.dateDatumDanas.setValue(this.racun.datum);
    this.dateDatumRacuna.setValue(this.racun.datumRacuna);
    this.dateDatumDospijeca.setValue(this.racun.datumDospjeca);
    this.customer = this.customers.find(customer => customer.kupacId == this.racun.kupacId);
    this.racun.nazivSkladista = this.skladista.find(skladiste => skladiste.skladisteId == this.racun.skladisteId)!.naziv;
    this.racunZaPoredit.nazivSkladista = this.racun.nazivSkladista
    this.racun.nazivValute = this.valute.find(valuta => valuta.valutaId == this.racun.valutaId)!.oznaka;
    this.racunZaPoredit.nazivValute = this.racun.nazivValute
    this.racunZaPoredit = Object.assign({}, this.racun);
  }

  async getGrupe() {
    this.grupe = await this._grupeService.getGroupsPromise(this.klijentId);
  }

  async getPorez() {
    this.porezi = await this._porezService.getPorezPromise(this.klijentId);
  }
  async getArtikli() {
    this.artikli = await this._artiklService.getArtikliPromise(this.klijentId);
    this.artikliFilter = this.artikli;
  }

  async getJediniceMjere() {
    this.jedinicemjere = await this._jediniceMjereService.getJedinicaMjerePromise();
  }

  async getValute() {
    this.valute = await this._valuteService.getValutaPromise();
  }

  async getVrstePlacanja() {
    this.vrstePlacanja = await this._vrstaPlacanja.getVrstaPromise(this.klijentId);
  }

  async getStavke() {
    this.stavkeLista = await this._stavkaService.getStavkePromise(this.klijentId, this.idDokumenta, this.id);
    this.stavkeLista.forEach(async element => {
      var article = this.artikli.find(a => a.artiklId == element.artiklId);
      if (article != null) {
        element.nazivArtikla = article.naziv;
        element.sifraArtikla = article.sifra;
        element.jedMjere = article.jedinicaMjereId;
        var jedMjere = this.jedinicemjere.find(x => x.jedinicaMjereId == article!.jedinicaMjereId);
        element.jedMjereNaziv = jedMjere!.naziv;
        var grupa = this.grupe.find(gr => gr.grupaId == article!.grupaId);
        var stopa = this.porezi.find(st => st.porezId == grupa!.porezId);
        element.stopaPoreza = stopa!.stopa;
      }
    });
    this.stavkeLista = this.stavkeLista.filter(fil => fil.racunId == this.racun.racunId).map((item, index) => {
      item.redniBroj = index + 1;
      return item;
    })
  }

  async getCurrentKlijent() {
    this.klijent = await this._clientService.getClientByIdPromise(this.klijentId);
  }

  async getCurrentUser() {
    this.currUser = await this._korisnikService.getUserByIdPromise(this.korisnikId);
  }
  
  Search() {
    if (this.artiklNaziv == "") {
      this.artikliFilter = this.artikli;
    }
    else {
      this.artikliFilter = this.artikli.filter(artikal => {
        return artikal.naziv.toLocaleLowerCase().match(this.artiklNaziv.toLocaleLowerCase());
      });
    }
  }

  ngOnDestroy() {
    this._routerSub.unsubscribe();
  }

  canDeactivate(): boolean {
    if (JSON.stringify(this.racun) !== JSON.stringify(this.racunZaPoredit)) {
      if (confirm("Imate nespremljene promjene! Ako napustite prozor, vaše promjene će biti izgubljene.")) {
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
      return true; // ako ima promjena returning false otvara dialog
    } return true; // ako nema promjena refresha
  }

  getArtiklById(id: any) {
    this.artikl = this.artikli.find(artikl => artikl.artiklId == id);
    var jedMjere = this.jedinicemjere.find(x => x.jedinicaMjereId == this.artikl.jedinicaMjereId);
    this.artikl.jedinicaMjereNaziv = jedMjere!.naziv;
    var grupa = this.grupe.find(x => x.grupaId == this.artikl.grupaId);
    this.artikl.grupa = grupa!.naziv;
    var stopa = this.porezi.find(x => x.porezId == grupa!.porezId);
    this.artikl.porez = stopa!.stopa;
    this.stavka.porezId = stopa!.porezId;
    this.stavka.stopaPoreza = stopa!.stopa;
    this.stavka.rabatPerc = 0
    this.mpc = this.artikl.mpc
    this.vpc = this.artikl.vpc
    this.marza = this.artikl.marza
    this.stavka.porezIznos = this.vpc * stopa!.stopa / 100;
    this.modalService.dismissAll();
    var elem = document.getElementById('stavkaKolicina');
    elem!.focus();
  }

  async addStavka(id: any) {
    if(this.racun.zakljucan == true){
      this.toastService.showError('Račun je zaključan i ne možete ga mijenjati.', 'Račun je zaključan!');
      this.modalService.dismissAll();
      return;
    }
    this.stavka.artiklId = this.artikl.artiklId;
    this.stavka.klijentId = this.racun.klijentId;
    this.stavka.skladisteIzlazId = this.racun.skladisteIzlazId;
    this.stavka.jedMjere = this.artikl.jedinicaMjereId;
    this.stavka.redniBroj = this.stavkeLista.length + 1;
    this.stavka.racunId = id;
    this.stavka.marza = this.artikl.marza;
    this.stavka.dokumentId = this.racun.dokumentId;
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
    if (this.azurirajArtikal == true) {
      var artikal = this.artikli.find(x => x.artiklId == this.stavka.artiklId);
      artikal!.marza = this.stavka.marza;
      artikal!.marzaIznos = this.stavka.marzaIznos;
      artikal!.nc = this.stavka.nabavnaCijena;
      artikal!.mpc = this.stavka.mpc;
      artikal!.vpc = this.stavka.vpc;
      await this._artiklService.updateArtiklPromise(artikal!.artiklId, artikal!);
      this.toastService.showSuccess('Artikal uspješno ažuriran!', 'Uspješno ste ažurirali artikal.');
    }
    this.racun.iznosSaPdv += Number(this.stavka.mpv);
    this.racun.iznosRacuna += Number(this.stavka.vpv);
    this.racun.iznosPoreza += Number(this.stavka.mpv) - Number(this.stavka.vpv);
    this.racun.nabavniIznos += this.stavka.nabavnaCijenaVrijednost;
    this.racun.marzaIznos += this.stavka.marzaIznos;
    await this._racunService.updateRacunPromise(this.racun.racunId, this.racun).then(data => {
      this.racun = data
      this.racunZaPoredit = data;
      this.toastService.showSuccess('Račun uspješno ažuriran!', 'Uspješno ste ažurirali račun!');
      this.getRacun();
      console.log(this.racun);
    });
    await this._stavkaService.addStavkaPromise(this.stavka);
    this.toastService.showSuccess('Stavka uspješno dodana!', 'Uspješno ste dodali stavku na račun.');
    this.resetStavkaForma();
    this.getStavke();
  }

  resetStavkaForma() {
    this.stavka = new IStavka();
    this.stavka.rabat1 = 0;
    this.stavka.rabat2 = 0;
    this.artikliFilter = this.artikli;
    this.artikl = null;
    this.marza = 0;
    this.vpc = 0;
    this.mpc = 0;
    this.azurirajArtikal = false;
  }

  rabatCalc() {
    this.stavka.fc = this.stavka.ulaznaCijena - (this.stavka.ulaznaCijena * this.stavka.rabat1 / 100);
    let rabat1 = this.stavka.kolicina * this.stavka.ulaznaCijena * this.stavka.rabat1 / 100;
    this.stavka.rabat1Iznos = rabat1;
    this.stavka.rabat2Iznos = 0;
    let rabat2
    if (this.stavka.rabat2 != 0 && this.stavka.rabat2 != undefined) {
      this.stavka.rabatStopa = ((1 - (1 - this.stavka.rabat1 / 100) * (1 - this.stavka.rabat2 / 100)) * 100);
      rabat2 = (this.stavka.kolicina * this.stavka.ulaznaCijena - rabat1) * this.stavka.rabat2 / 100;
      this.stavka.fc = (this.stavka.ulaznaCijena - this.stavka.fc) * this.stavka.rabat2 / 100;
      this.stavka.rabat2Iznos = rabat2;
      let rabat = rabat1 + rabat2;
      this.stavka.rabat = this.math_round_2(Number.parseFloat(rabat));
    } else {
      this.stavka.rabat = this.math_round_2(rabat1);
      this.stavka.rabatStopa = (1 - (1 - this.stavka.rabat1 / 100)) * 100;
    }
    this.stavka.faktIznos = this.stavka.kolicina * this.stavka.fc;
    // this.stavka.rabatPerc = this.stavka.rabat1 + this.stavka.rabat2; // rabat stopa
    this.stavka.nabavnaCijena = this.math_round_2((this.stavka.cijenaBezPdv - this.stavka.rabat) / this.stavka.kolicina);
    this.stavka.nabavnaCijenaVrijednost = this.stavka.nabavnaCijena * this.stavka.kolicina;
    this.stavka.marzaIznos = this.marza * this.stavka.nabavnaCijenaVrijednost / 100;
    this.vpc = +(((this.stavka.cijenaBezPdv - this.stavka.rabat) / this.stavka.kolicina) * (1 + this.artikl.marza / 100)).toFixed(2);
    this.stavka.vpc = this.vpc;
    this.stavka.vpv = this.stavka.kolicina * this.vpc;
    this.mpc = this.formatNumber(+(this.vpc * (1 + this.artikl.porez / 100)))
    this.stavka.mpc = this.mpc;
    this.stavka.mpv = this.stavka.kolicina * this.mpc; //new
    this.stavka.porezIznos = this.vpc * this.stavka.kolicina * this.stavka.stopaPoreza / 100;
    this.stavka.porezJedIznos = this.stavka.porezIznos / this.stavka.kolicina;
    if (isNaN(this.stavka.rabat)) {
      this.stavka.rabat = 0;
    }
    else {
      this.artikl.nc = this.stavka.cijenaBezPdv;
    }

  }

  math_round_2(value: number) {
    return +Math.round((value + Number.EPSILON) * 100) / 100;
  }

  formatNumber(num: number) {
    return Number(new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num));
  }

  unosCijene() {
    //if (this.artikl.vpc > 0) {
    this.artikl.vpc = +(this.artikl.mpc / (1 + this.artikl.porez / 100)).toFixed(2);
    this.vpc = this.artikl.vpc;
    this.stavka.vpv = this.stavka.kolicina * this.artikl.vpc;
    this.stavka.porezIznos = this.vpc * this.stavka.kolicina * this.stavka.stopaPoreza / 100;
    this.stavka.porezJedIznos = this.stavka.porezIznos / this.stavka.kolicina;
    this.stavka.nabavnaCijena = this.artikl.vpc;
    this.stavka.nabavnaCijenaVrijednost = this.artikl.vpc * this.stavka.kolicina;
    this.artikl.vpv = +(this.artikl.vpc * this.stavka.kolicina).toFixed(2);
    this.stavka.vpc = this.artikl.vpc;
    if (this.artikl.nc > 0) {
      // this.artikl.marza = +((((this.artikl.mpc / (1 + this.artikl.porez / 100)) / this.artikl.nc) - 1) * 100).toFixed(2);
      this.artikl.marza = +(((this.artikl.vpc - this.stavka.nabavnaCijena) / this.stavka.nabavnaCijena) * 100).toFixed(2);
      this.marza = this.artikl.marza;
      this.stavka.marza = this.artikl.marza;
      this.stavka.marzaIznos = this.stavka.marza * this.stavka.nabavnaCijenaVrijednost / 100;
    }
    //}
  }

  odabranaGrupa() {
    if (this.artikl.grupaId) {
      let stopa: number;
      if (this.artikl.vpc !== undefined) {
        this.unosCijene();
        this.artikl.mpc = +(this.artikl.vpc * (1 + this.stavka.stopaPoreza / 100)).toFixed(2);
        this.mpc = this.artikl.mpc;
        this.stavka.mpc = this.mpc;
        this.stavka.mpv = this.stavka.kolicina * this.mpc;
      }
    }
  }

  marzaCalcVPC(event: any) {
    if (event.target !== undefined) {
      this.artikl.vpc = Number(event.target.value)
      if (this.stavka.ulaznaCijena > 0 && this.artikl.vpc > 0) {
        // this.artikl.marza = +(((this.artikl.vpc - this.stavka.nabavnaCijena) / this.stavka.nabavnaCijena) * 100).toFixed(2);
        this.artikl.marza = +(((this.artikl.vpc - this.stavka.nabavnaCijena) / this.stavka.nabavnaCijena) * 100).toFixed(2);
        this.marza = this.artikl.marza;
        this.stavka.marza = this.artikl.marza; //new
        this.stavka.marzaIznos = this.stavka.marza * this.stavka.nabavnaCijenaVrijednost / 100;
        let stopa: number;
        this.artikl.mpc = +(this.artikl.vpc * (1 + this.artikl.porez / 100)).toFixed(2);
        this.mpc = this.artikl.mpc;
        this.stavka.mpc = this.mpc; //new
        this.stavka.mpv = this.stavka.kolicina * this.mpc; //new
      }
    }
  }

  marzaCalcMPC(event: any) {
    this.artikl.mpc = Number(event.target.value);
    this.stavka.mpc = this.artikl.mpc; //new
    this.stavka.mpv = this.stavka.kolicina * this.artikl.mpc; //new
    let stopa: number;
    if (this.artikl.grupaId) {
      let grupa = this.grupe.find(x => x.grupaId === this.artikl.grupaId);
      let porez = this.porezi.find(x => x.porezId === grupa!.porezId);
      stopa = porez!.stopa;
      // console.log("mpc - " + this.artikl.mpc);
      // console.log("stopa - " + stopa);
      this.artikl.vpc = +(this.artikl.mpc / (1 + stopa / 100)).toFixed(2);
      this.vpc = this.artikl.vpc;
      this.stavka.vpv = this.stavka.kolicina * this.artikl.vpc;
      this.stavka.porezIznos = this.vpc * this.stavka.kolicina * this.stavka.stopaPoreza / 100;
      this.stavka.porezJedIznos = this.stavka.porezIznos / this.stavka.kolicina;
      this.stavka.vpc = this.artikl.vpc;  //new     
      if (this.stavka.ulaznaCijena > 0) {
        // console.log("nabavnaCijena - " + this.stavka.nabavnaCijena);
        // this.artikl.marza = +(((this.artikl.vpc / this.stavka.nabavnaCijena) - 1) * 100).toFixed(2);
        this.artikl.marza = +(((this.artikl.vpc - this.stavka.nabavnaCijena) / this.stavka.nabavnaCijena) * 100).toFixed(2);
        this.marza = this.artikl.marza;
        // console.log("marza - " + this.artikl.marza);
        this.stavka.marza = this.artikl.marza; //new
        this.stavka.marzaIznos = this.stavka.marza * this.stavka.nabavnaCijenaVrijednost / 100;
      }
    }
  }

  marzaCalcMarza(event: any) {
    if (event.target !== undefined) {
      this.artikl.marza = Number(event.target.value);
      //this.artikl.nc ? this.artikl.nc : this.artikl.nc = 0;
      let rabat1, rabat2, rabatUk = 0
      if (this.stavka.rabat1 != 0 && this.stavka.rabat1 != undefined) {
        rabat1 = this.stavka.ulaznaCijena * this.stavka.rabat1 / 100;
        rabatUk = Number.parseFloat((rabat1).toFixed(2));
        this.stavka.rabatStopa = (1 - (1 - this.stavka.rabat1 / 100)) * 100;
      }
      if (this.stavka.rabat2 != 0 && this.stavka.rabat2 != undefined) {
        this.stavka.rabatStopa = ((1 - (1 - this.stavka.rabat1 / 100) * (1 - this.stavka.rabat2 / 100)) * 100);
        rabat2 = (this.stavka.ulaznaCijena - rabat1) * this.stavka.rabat2 / 100;
        let rabat = rabat1 + rabat2;
        rabatUk = Number.parseFloat(rabat.toFixed(2));
      }
      this.artikl.vpc = +((this.stavka.ulaznaCijena - rabatUk) * (1 + this.artikl.marza / 100)).toFixed(2);
      this.vpc = this.artikl.vpc;
      this.stavka.vpv = this.stavka.kolicina * this.artikl.vpc;
      this.stavka.porezIznos = this.vpc * this.stavka.kolicina * this.stavka.stopaPoreza / 100;
      this.stavka.porezJedIznos = this.stavka.porezIznos / this.stavka.kolicina;
      this.stavka.nabavnaCijena = +(this.stavka.ulaznaCijena - rabatUk).toFixed(2);
      this.stavka.nabavnaCijenaVrijednost = this.stavka.nabavnaCijena * this.stavka.kolicina;
      this.stavka.vpc = this.artikl.vpc;
      this.artikl.mpc = +(this.artikl.vpc * (1 + this.artikl.porez / 100)).toFixed(2);
      this.mpc = this.artikl.mpc;
      this.stavka.mpc = this.mpc;
      this.stavka.mpv = this.stavka.kolicina * this.mpc;
      this.stavka.marzaIznos = Number(event.target.value) * this.stavka.nabavnaCijenaVrijednost / 100;
    }
  }

  marzaCalcNC() {
    //this.artikl.marza ? this.artikl.marza : this.artikl.marza = 0;
    this.artikl.vpc = +(this.stavka.ulaznaCijena * (1 + this.marza / 100)).toFixed(2);
    this.vpc = this.artikl.vpc;
    this.stavka.vpv = this.stavka.kolicina * this.artikl.vpc;
    this.stavka.porezIznos = this.vpc * this.stavka.kolicina * this.stavka.stopaPoreza / 100;
    this.stavka.porezJedIznos = this.stavka.porezIznos / this.stavka.kolicina;
    this.stavka.nabavnaCijena = this.artikl.vpc;
    this.stavka.nabavnaCijenaVrijednost = this.stavka.nabavnaCijena * this.stavka.kolicina;
    this.stavka.marzaIznos = this.marza * this.stavka.nabavnaCijenaVrijednost / 100;
    this.stavka.vpc = this.artikl.vpc; //new
    this.artikl.mpc = +(this.artikl.vpc * (1 + this.artikl.porez / 100)).toFixed(2);
    this.mpc = this.artikl.mpc;
    this.stavka.mpc = this.mpc; //new
    this.stavka.mpv = this.stavka.kolicina * this.mpc; //new
  }

  calc() {
    this.marzaCalcMarza(0);
  }

  pdvEditIzracun() {
    this.racun.iznosSaPdv = this.racun.iznosRacuna + this.racun.iznosPoreza;
  }

  cijenaCalc() {
    this.stavka.cijenaBezPdv = Number.parseFloat((this.stavka.kolicina * this.stavka.ulaznaCijena).toFixed(2));
    this.rabatCalc();
  }

  cijenaCalc1() {
    this.stavka.cijenaBezPdv = Number.parseFloat((this.stavka.kolicina * this.stavka.ulaznaCijena).toFixed(2));
    this.marzaCalcNC();
    this.rabatCalc();
  }

  async updateRacun() {
    if(this.racun.zakljucan == true){
      this.toastService.showError('Račun je zaključan i ne možete ga mijenjati.', 'Račun je zaključan!');
      return;
    }
    this.racun.datumRacuna = this.dateDatumRacuna.value;
    this.racun.datumDospjeca = this.dateDatumDospijeca.value;
    this.racun.datum = this.dateDatumDanas.value;
    this.racun.datumRacuna = new Date(formatDate(this.racun.datumRacuna, 'EEEE, MMMM d, y, h:mm:ss a zzzz', 'en-US', '+2400'));
    this.racun.datumDospjeca = new Date(formatDate(this.racun.datumDospjeca, 'EEEE, MMMM d, y, h:mm:ss a zzzz', 'en-US', '+2400'));
    this.racun.datum = new Date(formatDate(this.racun.datum, 'EEEE, MMMM d, y, h:mm:ss a zzzz', 'en-US', '+2400'));
    this.racun.kupacId = this.customer.kupacId;
    this.racun = await this._racunService.updateRacunPromise(this.racun.racunId, this.racun);
    this.racunZaPoredit = this.racun;
    this.toastService.showSuccess('Racun uspješno ažuriran!', 'Uspješno ste ažurirali račun!');
  }

  ToSection(id: string) {
    document.getElementById(id)?.scrollIntoView();
  }

  async DeleteStavkaConfirm(idStavke: any, cijena: any) {
    if(this.racun.zakljucan == true){
      this.toastService.showError('Račun je zaključan i ne možete ga mijenjati.', 'Račun je zaključan!');
      this.modalService.dismissAll();
      return;
    }
    var stavka = this.stavkeLista.find(st => st.stavkeId == idStavke);
    this.racun.iznosSaPdv -= Number(stavka!.mpv);
    this.racun.iznosRacuna -= Number(stavka!.vpv);
    this.racun.iznosPoreza -= Number(stavka!.mpv) - Number(stavka!.vpv);
    this.racun.nabavniIznos -= stavka!.nabavnaCijenaVrijednost
    this.racun.marzaIznos -= stavka!.marzaIznos;
    await this.updateRacun();
    this.modalService.dismissAll();
    this.stavkaBrisanje = await this._stavkaService.deleteStavka(idStavke).toPromise();
    this.toastService.showSuccess('Stavka uspješno obrisana!', 'Uspješno ste obrisali stavku!');
    this.getStavke();
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

  /**Modal Delete stavke */
  Delete(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  /**Modal GetStavke */
  Get(content: any) {
    this.cdr.detectChanges();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  filterPoNazivuKupac(pretraga: any) {
    this.customers = this.customersDB.filter(obj => obj.naziv?.toLowerCase()?.includes(pretraga.value.toLowerCase()));
  }

  getCustomerById(id: any) {
    this.cdr.detectChanges();
    this.customer = this.customersDB.find(obj => obj.kupacId === id);
    var today = new Date(new Date(this.dateDatumRacuna.value).getFullYear(),
      new Date(this.dateDatumRacuna.value).getMonth(),
      new Date(this.dateDatumRacuna.value).getDate());
    today.setDate(today.getDate() + this.customer.brojDana);
    this.dateDatumDospijeca.setValue(today);
    this.modalService.dismissAll();
  }

  changeDatum(date: any) {
    var day = new Date(new Date(this.dateDatumRacuna.value).getFullYear(),
      new Date(this.dateDatumRacuna.value).getMonth(),
      new Date(this.dateDatumRacuna.value).getDate());
    if (this.customer != null) {
      day.setDate(day.getDate() + this.customer.brojDana);
      this.dateDatumDospijeca.setValue(day);
    } else {
      this.dateDatumDospijeca.setValue(day);
    }
  }

  private getDismissReason(reason: any): string {
    this.artiklNaziv = "";
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  printPdf() {
    //map indexes in stavkaLista
    this.stavkeLista.filter(f => f.racunId == this.racun.racunId).map((stavka, index) => {
      stavka.index = index + 1;
    });
    let customer = this.customers.find(c => c.kupacId == this.racun.kupacId);
    // console.log(this.customers)
    // console.log(this.racun)
    // console.log(customer)
    // console.log(this.klijent)
    let docDefinition = {
      pageOrientation: 'landscape',
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
                text: this.klijent.mjesto,
                style: 'fontSize'
              }
            ],
            [
              {
                text: customer!.naziv,
                bold: true,
                style: 'fontSize',
                alignment: 'right'
              },
              {
                text: customer!.adresa,
                style: 'fontSize',
                alignment: 'right'
              },
              {
                text: customer!.gradNaziv,
                style: 'fontSize',
                alignment: 'right'
              },
              {
                text: 'PDV: ' + customer!.pdvbroj,
                style: 'fontSize',
                alignment: 'right'
              },
              {
                text: 'JIB: ' + customer!.idbroj,
                style: 'fontSize',
                alignment: 'right'
              }
            ]
          ]
        },
        {
          text: `Prijemni list - kalkulacija:  ${this.racun.brojRacuna}`,
          alignment: 'left',
          margin: [0, 0, 0, 10],
          style: 'fontSize'
        },
        {
          columns: [
            {
              margin: [0, 0, 0, 10],
              table: {
                widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
                body: [
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Datum: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.datePipe.transform(new Date(this.racun.datum), 'dd.MM.yyyy.'),
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Skladište: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.racun.nazivSkladista,
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Iznos Računa: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: Number(this.racun.iznosRacuna).toFixed(2),
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Valuta: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.racun.nazivValute,
                      style: 'fontSize'
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Datum Računa: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.datePipe.transform(new Date(this.racun.datumRacuna), 'dd.MM.yyyy.'),
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Evidencijski Broj: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.racun.evidencijskiBroj,
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Ukupan PDV: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: (this.racun.iznosPoreza).toFixed(2),
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Operater: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.currUser.ime + ' ' + this.currUser.prezime,
                      style: 'fontSize'
                    }
                  ],
                  [
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Datum Dospijeća: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: this.datePipe.transform(new Date(this.racun.datumDospjeca), 'dd.MM.yyyy.'),
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: ' ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: ' ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: 'Ukupan Iznos: ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: Number(this.racun.iznosSaPdv).toFixed(2),
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: ' ',
                      style: 'fontSize'
                    },
                    {
                      border: [false, false, false, false],
                      fillColor: '#cccccc',
                      text: ' ',
                      style: 'fontSize'
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
            widths: [30, 25, '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', -5],
            body: [
              [
                {
                  text: 'R.Br.',
                  bold: true,
                  style: 'fontSizeS',
                  margin: [5, 0, 0, 0]
                },
                {
                  text: 'Šifra',
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
                    text: 'Naziv',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Kup Cij.',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'Kup',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right'
                  },
                  {
                    text: 'Iznos',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right'
                  }
                ],
                [
                  {
                    text: 'Rbt1%',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right'
                  },
                  {
                    text: 'Rbt1 Iznos',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right'
                  }
                ],
                [
                  {
                    text: 'Rbt2%',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right'
                  },
                  {
                    text: 'Rbt2 Iznos',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right'
                  }
                ],
                [
                  {
                    text: 'Uk.Rbt',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Uk.Rbt Iznos',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'NBC',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'NBV',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  }
                ],
                [
                  {
                    text: 'Mar%',
                    bold: true,
                    style: 'fontSizeS',
                    alignment: 'right',
                  },
                  {
                    text: 'Marža',
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
                    text: 'VP. izn',
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
              ...this.stavkeLista.filter(f => f.racunId == this.racun.racunId)
                .map(p =>
                // [p.index, p.sifraArtikla, p.nazivArtikla, p.kolicina, 
                // p.vpc, p.rabat1, p.rabat2, p.cijenaBezPdv, p.mpc]
                {
                  return [
                    {
                      text: p.redniBroj.toString(),
                      alignment: 'left',
                      style: 'fontSizeS',
                      margin: [10, 0, 0, 0]
                    },
                    {
                      text: p.sifraArtikla,
                      alignment: 'left',
                      style: 'fontSizeS'
                    },
                    [
                      {
                        text: Number(p.kolicina).toFixed(2).toString(),
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
                        text: p.nazivArtikla,
                        alignment: 'left',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.ulaznaCijena).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                    ],
                    [
                      {
                        text: ' ',
                        alignment: 'left',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.cijenaBezPdv).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                    ],
                    [
                      {
                        text: Number(p.rabat1).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.rabat1Iznos).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                    ],
                    [
                      {
                        text: Number(p.rabat2).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.rabat2Iznos).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                    ],
                    [
                      {
                        text: Number(p.rabatStopa).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.rabat).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: Number(p.nabavnaCijena).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.nabavnaCijenaVrijednost).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: Number(p.marza).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.marzaIznos).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: Number(p.vpc).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.vpv).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: Number(p.stopaPoreza).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.porezIznos).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                    [
                      {
                        text: Number(p.mpc).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      },
                      {
                        text: Number(p.mpv).toFixed(2).toString(),
                        alignment: 'right',
                        style: 'fontSizeS'
                      }
                    ],
                  ]
                }
                ),
              [
                {
                  text: 'Ukupno: ',
                  bold: true,
                  style: 'fontSizeS',
                },
                {
                  text: ' ',
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.kolicina, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: ' ',
                  bold: true,
                  style: 'fontSizeS',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.cijenaBezPdv, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.rabat1Iznos, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.rabat2Iznos, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.rabat, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.nabavnaCijenaVrijednost, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.marzaIznos, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.vpv, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.porezIznos, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
                {
                  text: this.stavkeLista.filter(f => f.racunId == this.racun.racunId).reduce((a, b) => a + b.mpv, 0).toFixed(2).toString(),
                  bold: true,
                  style: 'fontSizeS',
                  alignment: 'right',
                },
              ]
            ],
            style: 'fontSize'
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        fontSize: {
          fontSize: 9
        },
        fontSizeS: {
          fontSize: 7
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }
}

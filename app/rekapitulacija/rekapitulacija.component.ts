import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import { RacunService } from '../services/racun.service';
import { SkladisteService } from '../services/skladiste.service';
import { CustomerService } from '../services/customer.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-rekapitulacija',
  templateUrl: './rekapitulacija.component.html',
  styleUrls: ['./rekapitulacija.component.css']
})
export class RekapitulacijaComponent implements OnInit {

  vrsteRekapitulacija = [
    {value: 1, viewValue: 'Izlazni računi'},
    {value: 2, viewValue: 'Ulazni računi'},
    {value: 3, viewValue: 'Otpremnice'},
    {value: 4, viewValue: 'Međuskladišnica'}
  ];
  vrstaRekapitulacijeId: any = 0;

  public skladista: any[] = [];
  public skladiste: any = new Object();
  currUser: User;
  klijentId: any;

  artikli: any;
  grupe: any;
  racuni: any;
  stavke: any;

  docDefinition: any;

  dateDatumOd = new FormControl();
  dateDatumDo = new FormControl();

  jediniceMjere: any[] = []
  kupci: any[] = []

  racuniObj: any = new Rekapitulacija();

  ukupnoStanje: number = 0;
  ukupnoMpc: number = 0;
  ukupnoVpc: number = 0;
  ukupnoNc: number = 0;

  prikazIzlazneRekapitulacije: boolean = false;
  prikazUlazneRekapitulacije: boolean = false;
  prikazOtpremnicaRekapitulacije: boolean = false;
  prikazMedjuskladistaRekapitulacija: boolean = false;

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private datePipe: DatePipe,
    private _racuniService: RacunService,
    private _skladisteService: SkladisteService,
    private _kupciService: CustomerService
  ) { 
    
  }

  ngOnInit(): void {
    this.dateAdapter.setLocale('bs');
    this.setDefaults()
    var elem = document.getElementById('printRekapitulaciju') as HTMLButtonElement;
    elem.disabled = false;
    var elem = document.getElementById('prikaziRekapitulaciju') as HTMLButtonElement;
    elem.disabled = false;
    this.klijentId = window.atob(sessionStorage.getItem('tokenKlijentId')!);
    this.getData();
  }

  async getData() {
    await this.getSkladista();
    await this.getKupci();
  }
  
  async getSkladista() {
    this.skladista = await this._skladisteService.getSkladistePromise(this.klijentId);
  }
  
  async getKupci() {
    this.kupci = await this._kupciService.getCustomersPromise(this.klijentId);
  }

  async setDefaults() {
    //set first day of month 
    this.dateDatumOd.setValue(new Date(new Date().getFullYear(), 0, 1));
    //set today date
    var dateDo = new Date();
    // set hours to 23:59:59
    dateDo.setHours(23, 59, 59);
    this.dateDatumDo.setValue(dateDo);
  }


  async printRekapitulaciju(isPrint: any) {
    if(this.vrstaRekapitulacijeId == 0) {
      alert("Odaberite vrstu rekapitulacije!");
      return;
    }
    var dateOd = this.dateDatumOd.value;
    var dateDo = this.dateDatumDo.value;
    dateOd.setHours(23, 59, 59);
    dateDo.setHours(23, 59, 59);
    var dateOdString = this.datePipe.transform(dateOd, 'yyyy-MM-dd');
    var dateDoString = this.datePipe.transform(dateDo, 'yyyy-MM-dd');
    var racuni = await this._racuniService.getRacuniPromise(this.klijentId, this.vrstaRekapitulacijeId, dateOdString, dateDoString)

    var racuniObj: Rekapitulacija = new Rekapitulacija();
    racuniObj.racuni = racuni;

    racuni.map((racun: any) => {
      racuniObj.iznosRacunaUkupno += racun.iznosRacuna;
      racuniObj.iznosSaPdvUkupno += racun.iznosRacuna;
      racuniObj.iznosPorezaUkupno += racun.iznosRacuna;
    })
    if(this.vrstaRekapitulacijeId == 1 || this.vrstaRekapitulacijeId == 2 || this.vrstaRekapitulacijeId == 3){
      racuniObj.racuni.map((racun: any) => {
        racun.nazivSkladista = this.skladista.find((skladiste: any) => skladiste.skladisteId == racun.skladisteId)?.naziv;
        racun.nazivKupca = this.kupci.find((kupac: any) => kupac.kupacId == racun.kupacId)?.naziv;
      });
      if(this.vrstaRekapitulacijeId == 2){
        racuniObj.racuni.map((racun: any) => {
          racuniObj.nabavniIznosUkupno += racun.nabavniIznos;
          racuniObj.marzaIznosUkupno += racun.marzaIznos;
        });
      }
    } else if(this.vrstaRekapitulacijeId == 4){
      racuniObj.racuni.map((racun: any) => {
        racun.nazivSkladistaIzlaz = this.skladista.find((skladiste: any) => skladiste.skladisteId == racun.skladisteIzlazId)?.naziv;
        racun.nazivSkladistaUlaz = this.skladista.find((skladiste: any) => skladiste.skladisteId == racun.skladisteUlazId)?.naziv;
      });
    }

    this.racuniObj = racuniObj;
    switch(parseInt(this.vrstaRekapitulacijeId)) {
      case 1:
        this.prikazIzlazneRekapitulacije = true;
        this.prikazUlazneRekapitulacije = false;
        this.prikazOtpremnicaRekapitulacije = false;
        this.prikazMedjuskladistaRekapitulacija = false;
        break;
      case 2:
        this.prikazUlazneRekapitulacije = true;
        this.prikazIzlazneRekapitulacije = false;
        this.prikazOtpremnicaRekapitulacije = false;
        this.prikazMedjuskladistaRekapitulacija = false;
        break;
      case 3:
        this.prikazOtpremnicaRekapitulacije = true;
        this.prikazIzlazneRekapitulacije = false;
        this.prikazUlazneRekapitulacije = false;
        this.prikazMedjuskladistaRekapitulacija = false;
        break;
      case 4:
        this.prikazMedjuskladistaRekapitulacija = true;
        this.prikazIzlazneRekapitulacije = false;
        this.prikazUlazneRekapitulacije = false;
        this.prikazOtpremnicaRekapitulacije = false;
        break;
    }

    if(isPrint == 1){
      setTimeout(() => {
        const printContent = document.getElementById("docDefinitionID") as HTMLDivElement;
        const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0')!;
        WindowPrt.document.write(printContent.innerHTML);
        // WindowPrt.document.write('<link rel="stylesheet" type="text/css" href="stanje-skladista.component.css">');
        // WindowPrt.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">');
        
        WindowPrt.focus();
        setTimeout(() => {
          WindowPrt.print();
          WindowPrt.document.close();
          WindowPrt.close();
          // window.location.reload()
        }, 1000);
      
      }, 2000);
    }
  }
}
enum Dokument{
  izlaz = 1,
  ulaz = 2,
  otpremnica = 3,
  medjuSkladiste = 4
}
class Rekapitulacija {
  racuni: any[] = [];
  iznosSaPdvUkupno: number = 0;
  iznosPorezaUkupno: number = 0;
  iznosRacunaUkupno: number = 0;
  nabavniIznosUkupno: number = 0;
  marzaIznosUkupno: number = 0;
}
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Skladiste } from '../models/skladiste.model';
import { User } from '../models/user.model';
import { ArtiklService } from '../services/artikl.service';
import { GroupsService } from '../services/groups.service';
import { RacunService } from '../services/racun.service';
import { SkladisteService } from '../services/skladiste.service';
import { StavkaService } from '../services/stavka.service';
import { UserService } from '../services/user.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { DatePipe } from '@angular/common';
import { JedinicamjereService } from '../services/jedinicamjere.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-stanje-skladista',
  templateUrl: './stanje-skladista.component.html',
  styleUrls: ['./stanje-skladista.component.css']
})
export class StanjeSkladistaComponent implements OnInit {
  public skladista: Skladiste[] = [];
  public skladiste: any = new Object();
  currUser: User;

  artikli: any;
  grupe: any;
  racuni: any;
  stavke: any;

  docDefinition: any;

  dateDatumOd = new FormControl();
  dateDatumDo = new FormControl();

  jediniceMjere: any[] = []

  ukupnoStanje: number = 0;
  ukupnoMpc: number = 0;
  ukupnoVpc: number = 0;
  ukupnoNc: number = 0;
  klijentId: number = 0;
  korisnikId: number = 0;

  constructor(
    private _skladisteService: SkladisteService,
    private _korisnikService: UserService,
    private dateAdapter: DateAdapter<Date>,
    private _artikliService: ArtiklService,
    private _grupeService: GroupsService,
    private _racuniService: RacunService,
    private _stavkeService: StavkaService,
    private datePipe: DatePipe,
    private _jedinicaMjereService: JedinicamjereService
  ) {

  }

  ngOnInit(): void {
    this.dateAdapter.setLocale('bs');
    this.setDefaults()
    this.getData();
  }

  async setDefaults() {
    this.skladiste.skladisteId = 0;
    this.skladiste.naziv = '---'
    //set first day of month 
    this.dateDatumOd.setValue(new Date(new Date().getFullYear(), 0, 1));
    //set today date
    var dateDo = new Date();
    // set hours to 23:59:59
    dateDo.setHours(23, 59, 59);
    this.dateDatumDo.setValue(dateDo);
    setTimeout(() => {
      var elem = document.getElementById('printStanje') as HTMLButtonElement;
      elem.disabled = false;
      var elem = document.getElementById('prikaziStanje') as HTMLButtonElement;
      elem.disabled = false;
    }, 1000);
  }

  async getData() {
    await this.getTokens();
    await this.getSkladista();
    await this.getCurrentUser();
    await this.getRacuni();
    await this.getJediniceMjere();
    await this.getArtikli();
    await this.getGrupe();
    await this.getStavke();
  }

  getTokens() {
    this.korisnikId = parseInt(window.atob(sessionStorage.getItem('tokenKorisnikId')!));
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  async getCurrentUser() {
    this.currUser = await this._korisnikService.getUserByIdPromise(this.korisnikId);
  }

  async getSkladista() {
    this.skladista = await this._skladisteService.getSkladistePromise(this.klijentId);
  }

  async getRacuni() {
    this.racuni = await this._racuniService.getRacuniPromise(this.klijentId);
    this.racuni = this.racuni.filter(racun => racun.dokumentId == Dokument.ulaz || racun.dokumentId == Dokument.izlaz || racun.dokumentId == Dokument.medjuSkladiste);
  }

  async getJediniceMjere() {
    this.jediniceMjere = await this._jedinicaMjereService.getJedinicaMjerePromise();
  }

  async getArtikli() {
    this.artikli = await this._artikliService.getArtikliPromise(this.klijentId);
    this.artikli.map(artikal => {
      artikal.jedinicaMjereNaziv = this.jediniceMjere.find(jedMjere => jedMjere.jedinicaMjereId == artikal.jedinicaMjereId).naziv;
    })
  }

  async getGrupe() {
    this.grupe = await this._grupeService.getGroupsPromise(this.klijentId);
  }

  async getStavke() {
    this.stavke = await this._stavkeService.getStavkePromise(this.klijentId);
  }

  changeSkladiste(event: any) {
    if (event.target.value == 0) {
      this.skladiste.naziv = '---';
    } else {
      this.skladiste.naziv = this.skladista.filter(obj => obj.skladisteId == event.target.value)[0].naziv;
    }
  }


  printStanje(isPrint: any) {
    var dateOd = this.dateDatumOd.value;
    var dateDo = this.dateDatumDo.value;
    dateOd.setHours(23, 59, 59);
    dateDo.setHours(23, 59, 59);
    // console.log(this.skladiste.skladisteId);
    // console.log(this.dateDatumOd.value);
    // console.log(this.dateDatumDo.value);
    var filteredRacuni = this.racuni.filter(obj => new Date(obj.datumRacuna) >= this.dateDatumOd.value &&
      new Date(obj.datumRacuna) <= this.dateDatumDo.value);

    // console.log(filteredRacuni);
    if (this.skladiste.skladisteId != 0) {
      var filteredRacuniUlaz = filteredRacuni.filter(obj => obj.dokumentId == Dokument.ulaz && obj.skladisteId == this.skladiste.skladisteId);
      var filteredRacuniIzlaz = filteredRacuni.filter(obj => obj.dokumentId == Dokument.izlaz && obj.skladisteId == this.skladiste.skladisteId);
      var filteredMedjuskladisteUlaz = filteredRacuni.filter(obj => obj.dokumentId == Dokument.medjuSkladiste && obj.skladisteUlazId == this.skladiste.skladisteId);
      var filteredMedjuskladisteIzlaz = filteredRacuni.filter(obj => obj.dokumentId == Dokument.medjuSkladiste && obj.skladisteIzlazId == this.skladiste.skladisteId);
      // console.log(filteredRacuniUlaz);
      // console.log(filteredRacuniIzlaz);
      // console.log(filteredMedjuskladisteUlaz);
      // console.log(filteredMedjuskladisteIzlaz);

      //filter all stavke for this filteredRacuni
      var filteredStavkeUlaz = this.stavke.filter(obj => filteredRacuniUlaz.some(fil => fil.racunId == obj.racunId));
      //map groupId with artiklId
      filteredStavkeUlaz.map(obj => {
        obj.grupaId = this.artikli.find(fil => fil.artiklId == obj.artiklId).grupaId;
        obj.ulaz = true;
      })
      // console.log(filteredStavkeUlaz);
      var filteredStavkeIzlaz = this.stavke.filter(obj => filteredRacuniIzlaz.some(fil => fil.racunId == obj.racunId));
      filteredStavkeIzlaz.map(obj => {
        obj.grupaId = this.artikli.find(fil => fil.artiklId == obj.artiklId).grupaId;
        obj.ulaz = false;
      })
      // console.log(filteredStavkeIzlaz);
      var filteredStavkeMedjuskladisteUlaz = this.stavke.filter(obj => filteredMedjuskladisteUlaz.some(fil => fil.racunId == obj.racunId));
      filteredStavkeMedjuskladisteUlaz.map(obj => {
        obj.grupaId = this.artikli.find(fil => fil.artiklId == obj.artiklId).grupaId;
        obj.ulaz = true;
      })
      // console.log(filteredStavkeMedjuskladisteUlaz);

      var filteredStavkeMedjuskladisteIzlaz = this.stavke.filter(obj => filteredMedjuskladisteIzlaz.some(fil => fil.racunId == obj.racunId));
      filteredStavkeMedjuskladisteIzlaz.map(obj => {
        obj.grupaId = this.artikli.find(fil => fil.artiklId == obj.artiklId).grupaId;
        obj.ulaz = false;
      })
      // console.log(filteredStavkeMedjuskladisteIzlaz);

      var stavke = filteredStavkeUlaz.concat(filteredStavkeIzlaz);
      stavke = stavke.concat(filteredStavkeMedjuskladisteUlaz);
      stavke = stavke.concat(filteredStavkeMedjuskladisteIzlaz);
      // console.log(stavke);
      // console.log(this.jediniceMjere)
      // group stavke by group and sum kolicina for ulaz true and false
      var stavkeGroup = stavke.reduce((acc, curr) => {
        // console.log(acc.length);
        // console.log(curr);
        // console.log(acc);
        if (acc.length == 0) {
          var group = {
            grupaId: curr.grupaId,
            nazivGrupa: this.grupe.find(fil => fil.grupaId == curr.grupaId).naziv,
            ulaz: curr.ulaz,
            artikli: [] as any[]
          }
          var artikal = this.artikli.find(fil => fil.artiklId == curr.artiklId)
          group.artikli.push(artikal);
          if (curr.ulaz) {
            group.artikli.map(obj => obj.kolicinaUlaz = curr.kolicina);
            group.artikli.map(obj => obj.kolicinaIzlaz = 0);
          } else {
            group.artikli.map(obj => obj.kolicinaIzlaz = curr.kolicina);
            group.artikli.map(obj => obj.kolicinaUlaz = 0);
          }
          acc.push(group);
        } else {
          // console.log(acc.find(obj => obj.grupaId == curr.grupaId));
          if (acc.find(obj => obj.grupaId == curr.grupaId) == undefined) {
            // console.log("nema");
            var group1 = {
              grupaId: curr.grupaId,
              nazivGrupa: this.grupe.find(fil => fil.grupaId == curr.grupaId).naziv,
              ulaz: curr.ulaz,
              artikli: [] as any[]
            }
            var artikal = this.artikli.find(fil => fil.artiklId == curr.artiklId)
            group1.artikli.push(artikal);
            if (curr.ulaz) {
              group1.artikli.find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz = curr.kolicina;
              group1.artikli.find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz = 0;
            } else {
              group1.artikli.find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz = curr.kolicina;
              group1.artikli.find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz = 0;
            }
            acc.push(group1);
          } else {
            // console.log("ima");
            if (acc.find(obj => obj.grupaId == curr.grupaId).artikli
              .filter(obj => obj.artiklId == curr.artiklId).length == 0) {
              // console.log("nema artikla");
              var artikal = this.artikli.find(fil => fil.artiklId == curr.artiklId)
              acc.find(obj => obj.grupaId == curr.grupaId).artikli.push(artikal);
              if (curr.ulaz) {
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz = curr.kolicina;
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz = 0;
              } else {
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz = curr.kolicina;
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz = 0;
              }
            } else {
              // console.log("ima artikla");
              if (curr.ulaz) {
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz += curr.kolicina;
              } else {
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz += curr.kolicina;
              }
            }
          }
        }
        return acc;
      }, []);

      stavkeGroup.filter(obj => obj != null)

      this.ukupnoStanje = 0; this.ukupnoMpc = 0; this.ukupnoVpc = 0; this.ukupnoNc = 0;
      //sum all articles atributes in stavkeGroup
      stavkeGroup.map(obj => {
        obj.kolicinaIzlaz = obj.artikli.reduce((acc, curr) => acc + curr.kolicinaIzlaz, 0);
        obj.kolicinaUlaz = obj.artikli.reduce((acc, curr) => acc + curr.kolicinaUlaz, 0);
        obj.stanje = obj.kolicinaUlaz - obj.kolicinaIzlaz;
        obj.mpc = obj.artikli.reduce((acc, curr) => acc + curr.mpc * (curr.kolicinaUlaz - curr.kolicinaIzlaz), 0);
        obj.vpc = obj.artikli.reduce((acc, curr) => acc + curr.vpc * (curr.kolicinaUlaz - curr.kolicinaIzlaz), 0);
        obj.nc = obj.artikli.reduce((acc, curr) => acc + curr.nc * (curr.kolicinaUlaz - curr.kolicinaIzlaz), 0);
        this.ukupnoStanje += obj.stanje;
        this.ukupnoMpc += obj.mpc;
        this.ukupnoVpc += obj.vpc;
        this.ukupnoNc += obj.nc;
      })

      // console.log(stavkeGroup);
      //sort by nazivGrupa
      stavkeGroup.sort((a, b) => {
        if (a.nazivGrupa < b.nazivGrupa)
          return -1;
        if (a.nazivGrupa > b.nazivGrupa)
          return 1;
        return 0;
      });
      this.docDefinition = stavkeGroup;
      // console.log(this.docDefinition);
      //window.print()
      if (isPrint == 1) {
        setTimeout(() => {
          // window.location.reload()
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
        //pdfMake.createPdf(docDefinition).open();
      }
    } else {

      // console.log(this.skladista);
      // console.log(filteredRacuni);
      // console.log(Dokument.izlaz)
      //get filteredRacuni where skladisteUlazID has some in this.skladista
      // let filteredRacuniUlaz = filteredRacuni.filter(f => this.skladista.find(f2 => f2.skladisteId == f.skladisteUlazId) != undefined);
      let filteredRacuniUlaz = filteredRacuni.filter(f => f.dokumentId == Dokument.ulaz);
      //get filteredRacuni where skladisteIzlazID has some in this.skladista
      // let filteredRacuniIzlaz = filteredRacuni.filter(f => this.skladista.find(f2 => f2.skladisteId == f.skladisteIzlazId) != undefined);
      let filteredRacuniIzlaz = filteredRacuni.filter(f => f.dokumentId == Dokument.izlaz);
      //var filteredRacuniUlaz = filteredRacuni.filter(obj => obj.skladisteUlazId == this.skladiste.skladisteId);
      //var filteredRacuniIzlaz = filteredRacuni.filter(obj => obj.skladisteIzlazId == this.skladiste.skladisteId);
      // console.log(filteredRacuniUlaz);
      // console.log(filteredRacuniIzlaz);


      //filter all stavke for this filteredRacuni
      var filteredStavkeUlaz = this.stavke.filter(obj => filteredRacuniUlaz.some(fil => fil.racunId == obj.racunId));
      //map groupId with artiklId
      filteredStavkeUlaz.map(obj => {
        obj.grupaId = this.artikli.find(fil => fil.artiklId == obj.artiklId).grupaId;
        obj.ulaz = true;
      })
      // console.log(filteredStavkeUlaz);
      var filteredStavkeIzlaz = this.stavke.filter(obj => filteredRacuniIzlaz.some(fil => fil.racunId == obj.racunId));
      filteredStavkeIzlaz.map(obj => {
        obj.grupaId = this.artikli.find(fil => fil.artiklId == obj.artiklId).grupaId;
        obj.ulaz = false;
      })
      // console.log(filteredStavkeIzlaz);

      var stavke = filteredStavkeUlaz.concat(filteredStavkeIzlaz);
      // console.log(stavke);
      // console.log(this.jediniceMjere)
      // group stavke by group and sum kolicina for ulaz true and false
      var stavkeGroup = stavke.reduce((acc, curr) => {
        // console.log(acc.length);
        // console.log(curr);
        // console.log(acc);
        if (acc.length == 0) {
          var group = {
            grupaId: curr.grupaId,
            nazivGrupa: this.grupe.find(fil => fil.grupaId == curr.grupaId).naziv,
            ulaz: curr.ulaz,
            artikli: [] as any[]
          }
          var artikal = this.artikli.find(fil => fil.artiklId == curr.artiklId)
          group.artikli.push(artikal);
          if (curr.ulaz) {
            group.artikli.map(obj => obj.kolicinaUlaz = curr.kolicina);
            group.artikli.map(obj => obj.kolicinaIzlaz = 0);
          } else {
            group.artikli.map(obj => obj.kolicinaIzlaz = curr.kolicina);
            group.artikli.map(obj => obj.kolicinaUlaz = 0);
          }
          acc.push(group);
        } else {
          // console.log(acc.find(obj => obj.grupaId == curr.grupaId));
          if (acc.find(obj => obj.grupaId == curr.grupaId) == undefined) {
            // console.log("nema");
            var group1 = {
              grupaId: curr.grupaId,
              nazivGrupa: this.grupe.find(fil => fil.grupaId == curr.grupaId).naziv,
              ulaz: curr.ulaz,
              artikli: [] as any[]
            }
            var artikal = this.artikli.find(fil => fil.artiklId == curr.artiklId)
            group1.artikli.push(artikal);
            if (curr.ulaz) {
              group1.artikli.find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz = curr.kolicina;
              group1.artikli.find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz = 0;
            } else {
              group1.artikli.find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz = curr.kolicina;
              group1.artikli.find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz = 0;
            }
            acc.push(group1);
          } else {
            // console.log("ima");
            if (acc.find(obj => obj.grupaId == curr.grupaId).artikli
              .filter(obj => obj.artiklId == curr.artiklId).length == 0) {
              // console.log("nema artikla");
              var artikal = this.artikli.find(fil => fil.artiklId == curr.artiklId)
              acc.find(obj => obj.grupaId == curr.grupaId).artikli.push(artikal);
              if (curr.ulaz) {
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz = curr.kolicina;
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz = 0;
              } else {
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz = curr.kolicina;
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz = 0;
              }
            } else {
              // console.log("ima artikla");
              if (curr.ulaz) {
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaUlaz += curr.kolicina;
              } else {
                acc.find(obj => obj.grupaId == curr.grupaId).artikli
                  .find(obj => obj.artiklId == curr.artiklId).kolicinaIzlaz += curr.kolicina;
              }
            }
          }
        }
        return acc;
      }, []);

      stavkeGroup.filter(obj => obj != null)

      this.ukupnoStanje = 0; this.ukupnoMpc = 0; this.ukupnoVpc = 0; this.ukupnoNc = 0;
      //sum all articles atributes in stavkeGroup
      stavkeGroup.map(obj => {
        obj.kolicinaIzlaz = obj.artikli.reduce((acc, curr) => acc + curr.kolicinaIzlaz, 0);
        obj.kolicinaUlaz = obj.artikli.reduce((acc, curr) => acc + curr.kolicinaUlaz, 0);
        obj.stanje = obj.kolicinaUlaz - obj.kolicinaIzlaz;
        obj.mpc = obj.artikli.reduce((acc, curr) => acc + curr.mpc * (curr.kolicinaUlaz - curr.kolicinaIzlaz), 0);
        obj.vpc = obj.artikli.reduce((acc, curr) => acc + curr.vpc * (curr.kolicinaUlaz - curr.kolicinaIzlaz), 0);
        obj.nc = obj.artikli.reduce((acc, curr) => acc + curr.nc * (curr.kolicinaUlaz - curr.kolicinaIzlaz), 0);
        this.ukupnoStanje += obj.stanje;
        this.ukupnoMpc += obj.mpc;
        this.ukupnoVpc += obj.vpc;
        this.ukupnoNc += obj.nc;
      })

      // console.log(stavkeGroup);
      //sort by nazivGrupa
      stavkeGroup.sort((a, b) => {
        if (a.nazivGrupa < b.nazivGrupa)
          return -1;
        if (a.nazivGrupa > b.nazivGrupa)
          return 1;
        return 0;
      });
      this.docDefinition = stavkeGroup;
      // console.log(this.docDefinition);

      //console.log(this.docDefinition);
      if (isPrint == 1) {
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
}
enum Dokument {
  izlaz = 1,
  ulaz = 2,
  otpremnica = 3,
  medjuSkladiste = 4
}

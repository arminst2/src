import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRacun } from '../models/racun.model';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class RacunService {
  readonly _url:string = MyConfig.adresaServera + '/racun';
  private klijentId: number;
  constructor(private http: HttpClient) { 
    this.klijentId = sessionStorage.getItem('tokenKlijentId') != null ? parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!)) : 0;
  }

  getRacuni(): Observable<IRacun[]>{
    return this.http.get<IRacun[]>(this._url);
  }

  getRacuniPromise(klijentId?: number, dokumentId?: number, datumOd?: any, datumDo?:any): Promise<IRacun[]>{
    let url = this._url;
    //put ? if there is any parametar and between them &
    if(klijentId != undefined || dokumentId != undefined || datumOd != undefined || datumDo != undefined){
      url += '?';
      if(klijentId != undefined){
        url += 'klijentId=' + klijentId;
      }
      if(dokumentId != undefined){
        if(klijentId != undefined){
          url += '&';
        }
        url += 'dokumentId=' + dokumentId;
      }
      if(datumOd != undefined){
        if(klijentId != undefined || dokumentId != undefined){
          url += '&';
        }
        url += 'datumOd=' + datumOd;
      }
      if(datumDo != undefined){
        if(klijentId != undefined || dokumentId != undefined || datumOd != undefined){
          url += '&';
        }
        url += 'datumDo=' + datumDo;
      }
    }
    return this.http.get<IRacun[]>(url).toPromise();
  }
  getSviRacuni(): Observable<IRacun[]>{
    return this.http.get<IRacun[]>(this._url);
  }
  addRacun(racun: IRacun) {
    racun.klijentId = this.klijentId;
    racun.zakljucan = false;
    return this.http.post<any>(this._url, racun);
  }
  addRacunPromise(racun: IRacun) : Promise<any>{
    racun.klijentId = this.klijentId;
    racun.zakljucan = false;
    return this.http.post<any>(this._url, racun).toPromise();
  }
  updateRacun(id: number, item: IRacun){
    const url = `${this._url}/${id}`;
    return this.http.put<IRacun>(url,item);
  }
  updateRacunPromise(id: number, item: IRacun) : Promise<any>{
    const url = `${this._url}/${id}`;
    return this.http.put<IRacun>(url,item).toPromise();
  }
  setZakljucajRacun(id: number, zakljucan: boolean){
    const url = `${this._url}/SetZakljucano?racunId=${id}&zakljucavanje=${zakljucan}`;
    return this.http.post<IRacun>(url, null).toPromise();
  }
  getRacunById(id: number): Observable<IRacun>{
    const url = `${this._url}/${id}`;
    return this.http.get<IRacun>(url);
  }
  getRacunByIdPromise(id: number): Promise<IRacun>{
    const url = `${this._url}/${id}`;
    return this.http.get<IRacun>(url).toPromise();
  }
  deleteRacun(id:number):Observable<IRacun>{
    const url = `${this._url}/${id}`;
    return this.http.delete<IRacun>(url);
  }
  deleteRacunPromise(id:number):Promise<any>{
    const url = `${this._url}/${id}`;
    return this.http.delete<IRacun>(url).toPromise();
  }
  getZadnjiBrojURacunu(klijentId: number, dokumentId: number){
    const url = `${this._url}/GetZadnjiBrojURacunu?klijentId=${klijentId}&dokumentId=${dokumentId}`;
    return this.http.get<any>(url).toPromise();
  }
}

import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { IStavka } from '../models/stavka.model';
import { catchError } from 'rxjs/operators';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class StavkaService {
  readonly _url:string = MyConfig.adresaServera + '/stavke';
  klijentId: number = 0;
  constructor(private http: HttpClient) { 
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }
  getStavke(): Observable<IStavka[]>{
    return this.http.get<IStavka[]>(this._url);
  }
  async getStavkePromise(klijentId?: any, dokumentId?: any, racunId?: any): Promise<IStavka[]>{
    let url = this._url;
    if(klijentId != undefined || racunId != undefined){
      url += '?';
      if(klijentId != undefined){
        url += `klijentId=${klijentId}`;
      }
      if(racunId != undefined){
        url += `&racunId=${racunId}`;
      }
      return await this.http.get<IStavka[]>(url).toPromise();
    } else if(klijentId != undefined || dokumentId != undefined){
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
      return await this.http.get<IStavka[]>(url).toPromise();
    }
    return await this.http.get<IStavka[]>(this._url).toPromise();
  }
  addStavka(stavka: IStavka) {
    stavka.klijentId = this.klijentId;
    return this.http.post<any>(this._url, stavka);
  }
  addStavkaPromise(stavka: IStavka) : Promise<any>{
    stavka.klijentId = this.klijentId;
    return this.http.post<any>(this._url, stavka).toPromise();
  }
  updateStavka(id: number, item: IStavka){
    const url = `${this._url}/${id}`;
    return this.http.put<IStavka>(url,item);
  }
  updateStavkaPromise(id: number, item: IStavka): Promise<IStavka>{
    const url = `${this._url}/${id}`;
    return this.http.put<IStavka>(url,item).toPromise();
  }
  getStavkaById(id: number): Observable<IStavka>{
    const url = `${this._url}/${id}`;
    return this.http.get<IStavka>(url);
  }
  getStavkaByIdPromise(id: number): Promise<IStavka>{
    const url = `${this._url}/${id}`;
    return this.http.get<IStavka>(url).toPromise();
  }
  deleteStavka(id:number):Observable<IStavka>{
    const url = `${this._url}/${id}`;
    return this.http.delete<IStavka>(url);
  }
  deleteStavkaPromise(id:number):Promise<IStavka>{
    const url = `${this._url}/${id}`;
    return this.http.delete<IStavka>(url).toPromise();
  }
}

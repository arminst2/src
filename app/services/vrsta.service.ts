import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { IStavka } from '../models/stavka.model';
import { catchError } from 'rxjs/operators';
import { Vrsta } from '../models/vrsta.model';
import { NgForm } from '@angular/forms';
import { ItemsComponent } from '../items/items.component';
import { MyConfig } from '../my-config';
import { UserService } from './user.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class VrstaService {
  readonly _url:string = MyConfig.adresaServera + '/vrsta';
  constructor(private http: HttpClient) {  }
  formData:Vrsta = new Vrsta();
  
  getVrsta(): Observable<Vrsta[]>{
    return this.http.get<Vrsta[]>(this._url);
  }
  async getVrstePromise(klijentId?: number): Promise<Vrsta[]>{
    if(klijentId == undefined) {
      return await this.http.get<Vrsta[]>(this._url).toPromise();
    } else {
      return await this.http.get<Vrsta[]>(this._url + '?klijentId=' + klijentId).toPromise();
    }
  }
  addVrsta(Vrsta: Vrsta) {
    return this.http.post<any>(this._url, Vrsta);
  }
  addVrstaPromise(vrsta: Vrsta) {
    return this.http.post<any>(this._url, vrsta).toPromise();
  }
  updateVrsta(id: number, item: Vrsta){
    const url = `${this._url}/${id}`;
    return this.http.put<Vrsta>(url, item);
  }
  updateVrstaPromise(id: number, item: Vrsta){
    const url = `${this._url}/${id}`;
    return this.http.put<Vrsta>(url, item).toPromise();
  }
  getVrstaById(id: number): Observable<Vrsta>{
    const url = `${this._url}/${id}`;
    return this.http.get<Vrsta>(url);
  }
  async getVrstaByIdPromise(id: number): Promise<Vrsta>{
    const url = `${this._url}/${id}`;
    return await this.http.get<Vrsta>(url).toPromise();
  }
  deleteVrsta(id:number):Observable<Vrsta>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Vrsta>(url);
  }
  deleteVrstaPromise(id:number):Promise<Vrsta>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Vrsta>(url).toPromise();
  }
}

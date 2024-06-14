import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VrstaPlacanja } from '../models/vrstaplacanja.model';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class VrstaplacanjaService {
  readonly _url:string = MyConfig.adresaServera + '/VrstaPlacanja';
  Vrsta: VrstaPlacanja[] = [];
  constructor(private http: HttpClient) { this.Vrsta = []; }
  getVrsta(): Observable<VrstaPlacanja[]>{
    return this.http.get<VrstaPlacanja[]>(this._url);
  }
  async getVrstaPromise(klijentId?: any): Promise<VrstaPlacanja[]>{
    if(klijentId != undefined){
      return this.http.get<VrstaPlacanja[]>(this._url + '?klijentId=' + klijentId).toPromise();
    } else {
      return await this.http.get<VrstaPlacanja[]>(this._url).toPromise();
    }
  }
  addVrsta(Vrsta: VrstaPlacanja) {
    return this.http.post<any>(this._url, Vrsta);
  }
  updateVrsta(id: number, item: VrstaPlacanja){
    const url = `${this._url}/${id}`;
    return this.http.put<VrstaPlacanja>(url,item);
  }
  getVrstaById(id: number): Observable<VrstaPlacanja>{
    const url = `${this._url}/${id}`;
    return this.http.get<VrstaPlacanja>(url);
  }
  deleteVrsta(id:number):Observable<VrstaPlacanja>{
    const url = `${this._url}/${id}`;
    return this.http.delete<VrstaPlacanja>(url);
  }
}

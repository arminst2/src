import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Valuta } from '../models/valuta.model';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})
export class ValutaService {
  readonly _url:string = MyConfig.adresaServera + '/valuta';
  Valuta: Valuta[] = [];
  constructor(private http: HttpClient) { this.Valuta = []; }
  getValuta(): Observable<Valuta[]>{
    return this.http.get<Valuta[]>(this._url);
  }
  async getValutaPromise(): Promise<Valuta[]>{
    return await this.http.get<Valuta[]>(this._url).toPromise();
  }
  addValuta(Valuta: Valuta) {
    return this.http.post<any>(this._url, Valuta);
  }
  updateValuta(id: number, item: Valuta){
    const url = `${this._url}/${id}`;
    return this.http.put<Valuta>(url,item);
  }
  getValutaById(id: number): Observable<Valuta>{
    const url = `${this._url}/${id}`;
    return this.http.get<Valuta>(url);
  }
  deleteValuta(id:number):Observable<Valuta>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Valuta>(url);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Porez } from '../models/porez.model';
import { MyConfig } from '../my-config';
import { UserService } from './user.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PorezService {
  readonly _url:string = MyConfig.adresaServera + '/porez';
  formData:Porez=new Porez();
  constructor(private http:HttpClient) {}
  
  getPorez():Observable<Porez[]>{
    return this.http.get<Porez[]>(this._url);
  }

  getPorezPromise(klijentId?: number):Promise<Porez[]>{
    if (klijentId == undefined) {
      return this.http.get<Porez[]>(this._url).toPromise();
    } else {
      return this.http.get<Porez[]>(this._url + '?klijentId=' + klijentId).toPromise();
    }
  }

  addPorez(porez: Porez) {
    return this.http.post<any>(this._url, porez);
  }

  addPorezPromise(porez: Porez): Promise<any> {
    return this.http.post<any>(this._url, porez).toPromise();
  }

  updatePorez(id: number, item: Porez){
    const url = `${this._url}/${id}`;
    return this.http.put<Porez>(url,item);
  }

  updatePorezPromise(id: number, item: Porez): Promise<Porez>{
    const url = `${this._url}/${id}`;
    return this.http.put<Porez>(url,item).toPromise();
  }

  getPorezById(id: number): Observable<Porez>{
    const url = `${this._url}/${id}`;
    return this.http.get<Porez>(url);
  }

  getPorezByIdPromise(id: number): Promise<Porez>{
    const url = `${this._url}/${id}`;
    return this.http.get<Porez>(url).toPromise();
  }

  deletePorez(id:number):Observable<Porez>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Porez>(url);
  }

  deletePorezPromise(id:number):Promise<Porez>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Porez>(url).toPromise();
  }
}
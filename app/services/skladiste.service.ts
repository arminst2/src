import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grad } from '../models/grad.model';
import { Skladiste } from '../models/skladiste.model';
import { MyConfig } from '../my-config';
import { UserService } from './user.service';
import { User } from '../models/user.model';
@Injectable({
  providedIn: 'root'
})
export class SkladisteService {

  readonly _url:string = MyConfig.adresaServera + '/skladiste';
  skladiste: Skladiste[] = [];
  formData:Skladiste = new Skladiste();
  // currUser!: User;
  constructor(private http:HttpClient, private _korisnikService: UserService) { 
    // this._korisnikService.ucitajKorisnika().subscribe(res=> { 
    //   this._korisnikService.promise.then(result => {
    //     this.currUser = result;
    //   })
    // });
    this.skladiste = []; 
  }
  getSkladiste():Observable<Skladiste[]>{
    return this.http.get<Skladiste[]>(this._url);
  }
  async getSkladistePromise(klijentId?: number):Promise<Skladiste[]>{
    if(klijentId != undefined){
      return this.http.get<Skladiste[]>(this._url + '?klijentId=' + klijentId).toPromise();
    } else {
      return await this.http.get<Skladiste[]>(this._url).toPromise();
    }
  }
  addSkladiste(Skladiste: Skladiste) {
    return this.http.post<any>(this._url, Skladiste);
  }
  addSkladistePromise(skladiste: Skladiste):Promise<any>{
    return this.http.post<any>(this._url, skladiste).toPromise();
  }
  updateSkladiste(id: number, item: Skladiste){
    const url = `${this._url}/${id}`;
    return this.http.put<Skladiste>(url,item);
  }
  updateSkladistePromise(id: number, item: Skladiste):Promise<Skladiste>{
    const url = `${this._url}/${id}`;
    return this.http.put<Skladiste>(url,item).toPromise();
  }
  getSkladisteById(id: number): Observable<Skladiste>{
    const url = `${this._url}/${id}`;
    return this.http.get<Skladiste>(url);
  }
  getSkladisteByIdPromise(id: number):Promise<Skladiste>{
    const url = `${this._url}/${id}`;
    return this.http.get<Skladiste>(url).toPromise();
  }
  deleteSkladiste(id:number):Observable<Skladiste>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Skladiste>(url);
  }
  deleteSkladistePromise(id:number):Promise<Skladiste>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Skladiste>(url).toPromise();
  }
}
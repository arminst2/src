import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MyConfig } from '../my-config';
import { Manufacturer } from '../models/manufacturer.model';
import { ClientService } from './client.service';
import { Client } from '../models/client.model';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { User } from '../models/user.model';
import { UserService } from './user.service';
@Injectable({
  providedIn: 'root'
})
export class ManufacturerService {
  // manufacturers: Manufacturer[]=[];
  // client!:Client;
  readonly url:string = MyConfig.adresaServera + '/proizvodjac';
  formData:Manufacturer = new Manufacturer();
  // currUser!: User;
  constructor(private http: HttpClient, public clientService: ClientService,
    private _korisnikService: UserService) 
    {
      // this._korisnikService.ucitajKorisnika().subscribe(res => {
      //   this._korisnikService.promise.then(result => {
      //     this.currUser = result;
      //   })
      // });
  }
  // get(){
  //   return this.http.get(this.url).toPromise().then(res => { 
  //     const manufactureri = res as Manufacturer[];
  //     this.manufacturers = manufactureri.filter(obj =>
  //       obj.klijentId == this._korisnikService.currUser.klijentId)
  //   });
  // }
  getManufacturers():Observable<Manufacturer[]>{
    return this.http.get<Manufacturer[]>(this.url)
    //.pipe(map(res=> this.manufacturers = res.filter(obj=> obj.klijentId == this._korisnikService.currUser.klijentId)));
  }
  getManufacturersPromise(klijentId?:number):Promise<Manufacturer[]>{
    if(klijentId == undefined){
      return this.http.get<Manufacturer[]>(this.url).toPromise()
    } else {
      return this.http.get<Manufacturer[]>(this.url + '?klijentId=' + klijentId).toPromise();
    }
  }
  postManufacturer(item: Manufacturer):Observable<Manufacturer>{
    // item.klijentId = this.currUser?.klijentId;
    return this.http.post<Manufacturer>(this.url,item);
  }
  postManufacturerPromise(item: Manufacturer):Promise<Manufacturer>{
    // item.klijentId = this.currUser?.klijentId;
    return this.http.post<Manufacturer>(this.url,item).toPromise();
  }
  putManufacturer(id: number, item: Manufacturer):Observable<Manufacturer>{
    return this.http.put<Manufacturer>(`${this.url}/${id}`,item);
  }
  putManufacturerPromise(id: number, item: Manufacturer):Promise<Manufacturer>{
    return this.http.put<Manufacturer>(`${this.url}/${id}`,item).toPromise();
  }
  deleteManufacturer(id:number):Observable<Manufacturer>{
    return this.http.delete<Manufacturer>(`${this.url}/${id}`);
  }
  deleteManufacturerPromise(id:number):Promise<Manufacturer>{
    return this.http.delete<Manufacturer>(`${this.url}/${id}`).toPromise();
  }
}

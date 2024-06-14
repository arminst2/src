import { Injectable } from '@angular/core';
import {User} from '../models/user.model';
import {MyConfig} from '../my-config';
import {IRacun} from '../models/racun.model';
import {HttpClient} from '@angular/common/http';
import {UserService} from './user.service';
import { IOtpremnica } from '../models/otpremnica.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtpremnicaService {
  readonly _url:string = MyConfig.adresaServera + '/otpremnica';
  constructor(private http: HttpClient) {  }

  getOtpremnica(): Observable<IOtpremnica[]>{
    return this.http.get<IOtpremnica[]>(this._url);
  }

  addOtpremnica(otpremnica: IOtpremnica){
    return this.http.post<any>(this._url, otpremnica);
  }

  updateOtpremnica(id: number, item: IOtpremnica){
    const url = `${this._url}/${id}`;
    return this.http.put<IOtpremnica>(url,item);
  }

  getOtpremnicaById(id: number): Observable<IOtpremnica>{
    const url = `${this._url}/${id}`;
    return  this.http.get<IOtpremnica>(url);
  }

  deleteOtpremnica(id: number): Observable<IOtpremnica>{
    const url = `${this._url}/${id}`;
    return this.http.delete<IOtpremnica>(url);
  }

}

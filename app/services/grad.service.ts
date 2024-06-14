import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grad } from '../models/grad.model';
import { MyConfig } from '../my-config';
import { UserService } from './user.service';
import { User } from '../models/user.model';
@Injectable({
  providedIn: 'root'
})
export class GradService {
  readonly _url:string = MyConfig.adresaServera + '/grad';
  formData:Grad=new Grad();

  constructor(private http:HttpClient) { }

  getGradovi():Observable<Grad[]>{
    return this.http.get<Grad[]>(this._url);
  }

  async getGradoviPromise(klijentId?: number):Promise<Grad[]>{
    if(klijentId == undefined){
      return await this.http.get<Grad[]>(this._url).toPromise();
    } else {
      return await this.http.get<Grad[]>(this._url + '?klijentId=' + klijentId).toPromise();
    }
  }

  addGrad(Grad: Grad) {
    return this.http.post<any>(this._url, Grad);
  }

  addGradPromise(grad: Grad): Promise<Grad> {
    return this.http.post<Grad>(this._url, grad).toPromise();
  }

  updateGrad(id: number, item: Grad){
    const url = `${this._url}/${id}`;
    return this.http.put<Grad>(url,item);
  }

  updateGradPromise(id: number, item: Grad): Promise<Grad> {
    const url = `${this._url}/${id}`;
    return this.http.put<Grad>(url,item).toPromise();
  }

  getGradById(id: number): Observable<Grad>{
    const url = `${this._url}/${id}`;
    return this.http.get<Grad>(url);
  }

  getGradByIdPromise(id: number): Promise<Grad> {
    const url = `${this._url}/${id}`;
    return this.http.get<Grad>(url).toPromise();
  }

  deleteGrad(id:number):Observable<Grad>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Grad>(url);
  }
  
  deleteGradPromise(id: number): Promise<Grad> {
    const url = `${this._url}/${id}`;
    return this.http.delete<Grad>(url).toPromise();
  }
}
import { Injectable } from '@angular/core';
import { Client } from '../models/client.model';
import { HttpClient } from '@angular/common/http';
import { MyConfig } from '../my-config';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})

export class ClientService {
  formData:Client = new Client();
  constructor(private http:HttpClient) { 
  }
  
  readonly url:string = MyConfig.adresaServera + '/klijent';
  // get(){
  //   return this.http.get(this.url).toPromise().then(res => { this.clients = res as Client[]; });
  // }
  getClients(): Observable<Client[]>{
    return this.http.get<Client[]>(this.url);
  }
  getClientPromise(): Promise<Client[]>{
    return this.http.get<Client[]>(this.url).toPromise();
  }
  getClientById(id: number | undefined): Observable<Client>{
    const _url = `${this.url}/${id}`;
    return this.http.get<Client>(_url);
  }
  getClientByIdPromise(id: number | undefined): Promise<Client>{
    const _url = `${this.url}/${id}`;
    return this.http.get<Client>(_url).toPromise();
  }
  postClient(): Observable<Client>{
    return this.http.post<Client>(this.url,this.formData);
  }
  postClientPromise(): Promise<Client>{
    return this.http.post<Client>(this.url,this.formData).toPromise();
  }
  putClient(): Observable<Client>{
    return this.http.put<Client>(`${this.url}/${this.formData.klijentId}`,this.formData);
  }
  putClientPromise(): Promise<Client>{
    this.formData.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
    return this.http.put<Client>(`${this.url}/${this.formData.klijentId}`,this.formData).toPromise();
  }
  deleteClient(id:number): Observable<Client>{
    return this.http.delete<Client>(`${this.url}/${id}`);
  }
  deleteClientPromise(id:number): Promise<Client>{
    return this.http.delete<Client>(`${this.url}/${id}`).toPromise();
  }
  updateClient(id: number, item: Client){
    const url = `${this.url}/${id}`;
    return this.http.put<Client>(url,item);
  }
  updateClientPromise(id: number, item: Client){
    const url = `${this.url}/${id}`;
    return this.http.put<Client>(url,item).toPromise();
  }
  setPotvrdenMailPromise(id: number){
    const url = `${this.url}/setPotvrdjenMail`;
    return this.http.post(url,id).toPromise();
  }
}

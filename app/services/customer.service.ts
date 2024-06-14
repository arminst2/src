import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MyConfig } from '../my-config';
import { Customer } from '../models/customer.model';
import { from, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { GradService } from './grad.service';
import { UserService } from './user.service';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  readonly url:string = MyConfig.adresaServera + '/kupac';
  formData:Customer = new Customer();
  // currUser!: User;
  
  constructor(private http:HttpClient, private _korisnikService: UserService) {
    // this._korisnikService.ucitajKorisnika().subscribe(res => {
    //   this._korisnikService.promise.then(res => {
    //     this.currUser = res;
    //   })
    // });
   }
  getCustomerById(id: number): Observable<Customer>{
    const url = `${this.url}/${id}`;
    return this.http.get<Customer>(url);
  }
  getCustomers(): Observable<Customer[]>{
    return this.http.get<Customer[]>(this.url)
  }
  getCustomersPromise(klijentId?: any): Promise<Customer[]>{
    if(klijentId != undefined){
      return this.http.get<Customer[]>(this.url + '?klijentId=' + klijentId).toPromise();
    } else {
      return this.http.get<Customer[]>(this.url).toPromise();
    }
  }
  postCustomer(klijentId: number): Observable<Customer>{
    this.formData.klijentId = klijentId;
    return this.http.post<Customer>(this.url,this.formData);
  }
  postCustomerPromise(klijentId): Promise<Customer>{
    this.formData.klijentId = klijentId;
    return this.http.post<Customer>(this.url,this.formData).toPromise();
  }
  putCustomer(): Observable<Customer>{
    return this.http.put<Customer>(`${this.url}/${this.formData.kupacId}`,this.formData);
  }
  putCustomerPromise(): Promise<Customer>{
    return this.http.put<Customer>(`${this.url}/${this.formData.kupacId}`,this.formData).toPromise();
  }
  deleteCustomer(id:number): Observable<Customer>{
    return this.http.delete<Customer>(`${this.url}/${id}`);
  }
  deleteCustomerPromise(id:number): Promise<Customer>{
    return this.http.delete<Customer>(`${this.url}/${id}`).toPromise();
  }
}
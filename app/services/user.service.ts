import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MyConfig } from '../my-config';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  users: User[] = [];
  readonly url = MyConfig.adresaServera + '/korisnik';
  formData: User = new User();
  promise!:any;
  constructor(private http: HttpClient) {
  }

  // ucitajKorisnikaPromise() : Promise<User> {
  //   let rep: string = sessionStorage.getItem('token')!;
  //   let korisnickoIme: string = window.atob(rep).split(':', 1) as unknown as string;
  //   var params = new HttpParams();
  //   params = params.append('KorisnickoIme', korisnickoIme);
  //   return this.http.get(this.url, {params: params}).toPromise() as Promise<User>;
  // }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  getUsersPromise(klijentId?: number): Promise<User[]> {
    if (klijentId != undefined) {
      return this.http.get<User[]>(this.url + '?klijentId=' + klijentId).toPromise();
    } else {
      return this.http.get<User[]>(this.url).toPromise();
    }
  }

  getUserById(id: number): Observable<User> {
    const _url = `${this.url}/${id}`;
    return this.http.get<User>(_url);
  }

  getUserByIdPromise(id: number): Promise<User> {
    const _url = `${this.url}/${id}`;
    return this.http.get<User>(_url).toPromise();
  }

  getIsAdmin(id: any): Promise<boolean> {
    return this.http.get<boolean>(this.url + '/GetIsAdmin' + '?id=' + id).toPromise();
  }

  getIsZauzetoKorisnickoImePromise(korisnickoIme: string) {
    return this.http.get<boolean>(this.url + '/GetIsZauzetoKorisnickoIme' + '?korisnickoIme=' + korisnickoIme).toPromise();
  }

  postUsers(): Observable<User> {
    // this.formData.klijentId = this.currUser?.klijentId;
    this.formData.isAdmin = false;
    return this.http.post<User>(this.url, this.formData);
  }

  postUserPromise(): Promise<User> {
    return this.http.post<User>(this.url, this.formData).toPromise();
  }

  putUsers(): Observable<User> {
    return this.http.put<User>(`${this.url}/${this.formData.korisnikId}`, this.formData);
  }

  putUserPromise(): Promise<User> {
    return this.http.put<User>(`${this.url}/${this.formData.korisnikId}`, this.formData).toPromise();
  }

  deleteUsers(id: number): Observable<User> {
    return this.http.delete<User>(`${this.url}/${id}`);
  }

  deleteUsersPromise(id: number): Promise<User> {
    return this.http.delete<User>(`${this.url}/${id}`).toPromise();
  }

  addKorisnik(korisnik: User) {
    korisnik.isAdmin = true;
    return this.http.post<any>(this.url, korisnik);
  }

  addKorisnikPromise(korisnik: User) {
    korisnik.isAdmin = true;
    return this.http.post<any>(this.url, korisnik).toPromise();
  }
}

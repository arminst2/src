import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/user.model'
import { MyConfig } from '../my-config';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private userSubject!: BehaviorSubject<User>;
    public user!: Observable<User>;
    public useri: User[] = [];
    public currentUser!: User;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        let token: string = sessionStorage.getItem('token')!;
        let korisnickoIme: string = window.atob(token).split(':', 1) as unknown as string;
        this.http.get<User[]>(`${MyConfig.adresaServera}/korisnik/`).pipe(map( res => {
            const useri: User[] = res as User[];
            this.useri = useri.filter(obj => obj.korisnickoIme == korisnickoIme);
            this.currentUser = this.useri[0];
            this.userSubject = new BehaviorSubject<User>(this.currentUser);
            this.user = this.userSubject.asObservable();
        }));
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(korisnickoIme: any): Observable<User[]> {
        var korisnickoImeParam: HttpParams = new HttpParams().set('korisnickoIme', korisnickoIme);
        return this.http.get<User[]>(`${MyConfig.adresaServera}/korisnik/`, { params: korisnickoImeParam })
            .pipe(map(user => {
                return user;
            }));
    }
    async loginPromise(korisnickoIme: any): Promise<User[]> {
        var korisnickoImeParam: HttpParams = new HttpParams().set('korisnickoIme', korisnickoIme);
        return await this.http.get<User[]>(`${MyConfig.adresaServera}/korisnik/`, { params: korisnickoImeParam }).toPromise();
    }

    logout() {
        sessionStorage.removeItem('token');
        this.currentUser = new User();
        //this.userSubject.next(this.currentUser);
        this.router.navigate(["/prijava/0"]);
    }
}
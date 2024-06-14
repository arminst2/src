import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IArtikl } from '../models/artikl.model';
import { MyConfig } from '../my-config';

@Injectable({
  providedIn: 'root'
})

export class ArtiklService {
  getTableData() {
    throw new Error('Method not implemented.');
  }
  readonly _url:string = MyConfig.adresaServera + '/artikl';
  formData:IArtikl = new IArtikl();
  klijentId: number = 0;
  constructor(private http: HttpClient) {
    this.klijentId = parseInt(window.atob(sessionStorage.getItem('tokenKlijentId')!));
  }

  getArtikli(): Observable<IArtikl[]>{
    return this.http.get<IArtikl[]>(this._url);
  }

  async getArtikliPromise(klijentId?: number): Promise<IArtikl[]>{
    if (klijentId == undefined) {
      return this.http.get<IArtikl[]>(this._url).toPromise();
    } else {
      return this.http.get<IArtikl[]>(this._url + '?klijentId=' + klijentId).toPromise();
    }
  }

  addArtikl(artikl: IArtikl) {
    artikl.klijentId = this.klijentId;
    return this.http.post<any>(this._url, artikl);
  }

  addArtiklPromise(artikl: IArtikl): Promise<any>{
    artikl.klijentId = this.klijentId;
    return this.http.post<any>(this._url, artikl).toPromise();
  }

  updateArtikl(id: number, item: IArtikl){
    const url = `${this._url}/${id}`;
    return this.http.put<IArtikl>(url,item);
  }

  updateArtiklPromise(id: number, item: IArtikl): Promise<IArtikl>{
    const url = `${this._url}/${id}`;
    return this.http.put<IArtikl>(url,item).toPromise();
  }

  getArtiklById(id: number): Observable<IArtikl>{
    const url = `${this._url}/${id}`;
    return this.http.get<IArtikl>(url);
  }

  getArtiklByIdPromise(id: number): Promise<IArtikl>{
    const url = `${this._url}/${id}`;
    return this.http.get<IArtikl>(url).toPromise();
  }

  deleteArtikl(id:number):Observable<IArtikl>{
    const url = `${this._url}/${id}`;
    return this.http.delete<IArtikl>(url);
  }

  deleteArtiklPromise(id:number):Promise<IArtikl>{
    const url = `${this._url}/${id}`;
    return this.http.delete<IArtikl>(url).toPromise();
  }
}

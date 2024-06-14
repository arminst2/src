import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Groups } from '../models/grupe.model';
import { MyConfig } from '../my-config';
import { UserService } from './user.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  readonly _url:string = MyConfig.adresaServera + '/grupa';
  formData:Groups = new Groups();

  constructor(private http:HttpClient) { }

  getGroups():Observable<Groups[]>{
    return this.http.get<Groups[]>(this._url);
  }

  getGroupsPromise(klijentId?: number):Promise<Groups[]>{
    if (klijentId == undefined) {
      return this.http.get<Groups[]>(this._url).toPromise();
    } else {
      return this.http.get<Groups[]>(this._url + '?klijentId=' + klijentId).toPromise();
    }
  }

  addGroups(Grupa: Groups) {
    return this.http.post<any>(this._url, Grupa);
  }

  addGroupPromise(grupa: Groups): Promise<Groups> {
    return this.http.post<Groups>(this._url, grupa).toPromise();
  }

  updateGroups(id: number, item: Groups){
    const url = `${this._url}/${id}`;
    return this.http.put<Groups>(url,item);
  }

  updateGroupPromise(id: number, item: Groups): Promise<Groups> {
    const url = `${this._url}/${id}`;
    return this.http.put<Groups>(url,item).toPromise();
  }

  getGroupsById(id: number): Observable<Groups>{
    const url = `${this._url}/${id}`;
    return this.http.get<Groups>(url);
  }

  getGroupsByIdPromise(id: number): Promise<Groups>{
    const url = `${this._url}/${id}`;
    return this.http.get<Groups>(url).toPromise();
  }

  deleteGroups(id:number):Observable<Groups>{
    const url = `${this._url}/${id}`;
    return this.http.delete<Groups>(url);
  }
  
  deleteGroupPromise(id: number): Promise<Groups> {
    const url = `${this._url}/${id}`;
    return this.http.delete<Groups>(url).toPromise();
  }
}

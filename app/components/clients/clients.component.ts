import { Component, OnInit } from '@angular/core';
import { Client } from '../../models/client.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';


@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[]=[];
  constructor(
    private router: Router, 
    public _clientService: ClientService
    ) { }

  ngOnInit(): void {
    this.getData();
  }
 async getData() {
  await this.getClients();
  }
  async getClients() {
    this.clients = await this._clientService.getClientPromise();
  }

  uredi(x: Client) {
    this._clientService.formData = x;
    this.router.navigate(['/adminpanel/addclient']);
  }
  async obrisi(x: number | undefined) {
    if (confirm('Jeste li sigurni?')) {
      await this._clientService.deleteClientPromise(x as number);
      await this.getClients();
    }
  }

}

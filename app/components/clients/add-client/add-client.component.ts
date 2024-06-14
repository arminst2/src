import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../../services/client.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css']
})
export class AddClientComponent implements OnInit {
  constructor(
    public _clientService: ClientService,
    private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit(form: NgForm) {
    if (this._clientService.formData.klijentId == 0) {
      this.insertRecord(form);
    }
    else {
      this.updateRecord(form);
    }
    this.router.navigate(['/adminpanel/clients']);
  }

  async insertRecord(form: NgForm) {
    await this._clientService.postClientPromise();
  }

  async updateRecord(form: NgForm) {
    await this._clientService.putClientPromise();
  }
}

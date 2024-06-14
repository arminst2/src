import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddInputsComponent } from './add-inputs/add-inputs.component';
import { AddOutputsComponent } from './add-outputs/add-outputs.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { CustomersComponent } from './components/customers/customers.component';
import { EditInputsComponent } from './edit-inputs/edit-inputs.component';
import { EditOutputsComponent } from './edit-outputs/edit-outputs.component';
import { GroupsComponent } from './groups/groups.component';
import { InputsComponent } from './inputs/inputs.component';
import { ItemsComponent } from './items/items.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { OutputsComponent } from './outputs/outputs.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { AddCustomerComponent } from './components/customers/add-customer/add-customer.component';
import { ClientsComponent } from './components/clients/clients.component';
import { AddClientComponent } from './components/clients/add-client/add-client.component';
import { ManufacturersComponent } from './components/manufacturers/manufacturers.component';
import { UsersComponent } from './components/users/users.component';
import { AddUserComponent } from './components/users/add-user/add-user.component';

import { VrsteComponent } from './vrste/vrste.component';
import { GradComponent } from './grad/grad.component';
import { SkladisteComponent } from './skladiste/skladiste/skladiste.component';
import { PorezComponent } from './porez/porez/porez.component';
import { ArtiklComponent } from './artikl/artikl.component';
import { EditStavkaComponent } from './edit-stavka/edit-stavka.component';

import { StanjeSkladistaComponent } from './stanje-skladista/stanje-skladista.component';

import { AddOtpremnicaComponent } from './add-otpremnica/add-otpremnica.component';
import { OtpremnicaComponent } from './otpremnica/otpremnica.component';
import { EditOtpremnicaComponent } from './edit-otpremnica/edit-otpremnica.component';
import { MedjuskladisteComponent } from './medjuskladiste/medjuskladiste.component';
import { EditMedjuskladisteComponent } from './edit-medjuskladiste/edit-medjuskladiste.component';
import { AddMedjuskladisteComponent } from './add-medjuskladiste/add-medjuskladiste.component';
import { RekapitulacijaComponent } from './rekapitulacija/rekapitulacija.component';


const routes: Routes = [
    { path: 'prijava/:id', component: PrijavaComponent },

  { path: 'registracija', component: RegistracijaComponent },
  {
    path: 'adminpanel', component: AdminPanelComponent, children: [
      { path: 'companyProfile', component: CompanyProfileComponent },
      { path: 'companyProfile', component: CompanyProfileComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'items', component: ItemsComponent },
      { path: 'inputs', component: InputsComponent },
      { path: 'outputs', component: OutputsComponent },
      { path: 'stanjeskladista', component: StanjeSkladistaComponent },
      { path: 'registracija', component: RegistracijaComponent },
      { path: 'otpremnice', component: OtpremnicaComponent },

      { path: 'addcustomer', component: AddCustomerComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'addclient', component: AddClientComponent },
      { path: 'manufacturers', component: ManufacturersComponent },
      { path: 'users', component: UsersComponent },
      { path: 'adduser', component: AddUserComponent },

      { path: 'addInputs', component: AddInputsComponent },
      { path: 'addOtpremnica', component: AddOtpremnicaComponent },

      { path: 'editInputs', component: EditInputsComponent },
      { path: 'editInputs/:id', component: EditInputsComponent },
      { path: 'grad', component: GradComponent },
      { path: 'vrste', component: VrsteComponent },
      { path: 'skladiste', component: SkladisteComponent },
      { path: 'porez', component: PorezComponent },
      { path: 'artikl', component: ArtiklComponent },
      { path: 'addOutputs', component: AddOutputsComponent },
      { path: 'editOutputs', component: EditOutputsComponent },
      { path: 'editOutputs/:id', component: EditOutputsComponent },
      { path: 'editStavka/:id', component: EditStavkaComponent },
      { path: 'editOtpremnica/:id', component: EditOtpremnicaComponent },

      { path: 'medjuskladisnice', component: MedjuskladisteComponent },
      { path: 'editmedjuskladisnica/:id', component: EditMedjuskladisteComponent },
      { path: 'addmedjuskladisnicu', component: AddMedjuskladisteComponent },
      { path: 'rekapitulacija', component: RekapitulacijaComponent }



    ]
  },
  { path: '', component: LandingPageComponent },
  { path: '**', component: LandingPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const RoutingComponents = [PrijavaComponent, RegistracijaComponent, AdminPanelComponent, LandingPageComponent, CompanyProfileComponent,
  VrsteComponent, GradComponent, PorezComponent, SkladisteComponent, ArtiklComponent,
  AddCustomerComponent, ClientsComponent, AddClientComponent,
  ManufacturersComponent, UsersComponent, AddUserComponent, CustomersComponent, GroupsComponent, ItemsComponent, InputsComponent, OutputsComponent,
  AddInputsComponent, EditInputsComponent, AddOtpremnicaComponent, OtpremnicaComponent, EditOtpremnicaComponent]


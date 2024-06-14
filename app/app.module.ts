import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
/*import { RouterModule, Routes } from '@angular/router';*/
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';

import { AppRoutingModule, RoutingComponents} from './app-routing.module';
import { AppComponent } from './app.component';
import { ArtiklComponent } from './artikl/artikl.component';
import { AddOutputsComponent } from './add-outputs/add-outputs.component';
import { EditOutputsComponent } from './edit-outputs/edit-outputs.component';
import { EditStavkaComponent } from './edit-stavka/edit-stavka.component';
import { BasicAuthInterceptor } from './interceptors/basic-auth-interceptor';
import { ErrorInterceptor } from './interceptors/error-interceptor';
import { DatePipe } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { AddOtpremnicaComponent } from './add-otpremnica/add-otpremnica.component';
import { OtpremnicaComponent } from './otpremnica/otpremnica.component';
import { EditOtpremnicaComponent } from './edit-otpremnica/edit-otpremnica.component';

import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {CheckboxModule} from 'primeng/checkbox';
import {TooltipModule} from 'primeng/tooltip';
import { StanjeSkladistaComponent } from './stanje-skladista/stanje-skladista.component';
import { MedjuskladisteComponent } from './medjuskladiste/medjuskladiste.component';
import { EditMedjuskladisteComponent } from './edit-medjuskladiste/edit-medjuskladiste.component';
import { AddMedjuskladisteComponent } from './add-medjuskladiste/add-medjuskladiste.component';
import { RekapitulacijaComponent } from './rekapitulacija/rekapitulacija.component';

import { OrderModule } from 'ngx-order-pipe';


const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'DD/MM/YYYY', // this is how your date will get displayed on the Input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};


@NgModule({
  declarations: [
    AppComponent,
    RoutingComponents,
    ArtiklComponent,
    AddOutputsComponent,
    EditOutputsComponent,
    EditStavkaComponent,
    StanjeSkladistaComponent,
    AddOtpremnicaComponent,
    OtpremnicaComponent,
    EditOtpremnicaComponent,
    MedjuskladisteComponent,
    EditMedjuskladisteComponent,
    AddMedjuskladisteComponent,
    RekapitulacijaComponent,
 
  ],
  imports: [
   
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NoopAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ToastModule, 
    TooltipModule,
    CheckboxModule,
    MatSortModule,
    MatTableModule,
    OrderModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi:true},
              { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
              MatNativeDateModule,
              DatePipe, 
              MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

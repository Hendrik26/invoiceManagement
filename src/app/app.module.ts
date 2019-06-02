import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {InvoiceListComponent} from './invoice-list/invoice-list.component';
import {InvoiceDetailComponent} from './invoice-detail/invoice-detail.component';
// import {ItemDetailComponent} from './item-detail/item-detail.component';
import {InvoiceRouterModule} from './/invoice-router.module';
import {FormsModule} from '@angular/forms';
import {CustomerListComponent} from './customer-list/customer-list.component';
import {CustomerDetailComponent} from './customer-detail/customer-detail.component';
import {AngularFireModule} from '@angular/fire'; // line must be addesd
import {AngularFirestoreModule} from '@angular/fire/firestore'; // line must be addesd
import {environment} from '../environments/environment'; // line must be addesd
import {FbInvoiceService} from './fb-invoice.service';
import {SettingsService} from './settings.service';
import {LoginComponent} from './login/login.component';
import {UserListComponent} from './user-list/user-list.component';
import {SettingsDetailComponent} from './settings-detail/settings-detail.component'; // line must be addesd
import {AngularFireAuthModule} from '@angular/fire/auth';  // line must be addesd
import {AngularFireStorageModule } from '@angular/fire/storage';

@NgModule({
    declarations: [
        AppComponent,
        InvoiceListComponent,
        InvoiceDetailComponent,
        // ItemDetailComponent,
        CustomerListComponent,
        CustomerDetailComponent,
        LoginComponent,
        UserListComponent,
        SettingsDetailComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        InvoiceRouterModule,
        AngularFireModule.initializeApp(environment.firebase), // line must be addesd
        AngularFireAuthModule,  // line must be addesd
        AngularFirestoreModule, // line must be addesd
        AngularFireStorageModule // line must be addesd
    ],
    providers: [
        FbInvoiceService,
        SettingsService
    ],  // lines must be changed
    bootstrap: [AppComponent]
})
export class AppModule {
}

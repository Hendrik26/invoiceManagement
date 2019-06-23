import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvoiceListComponent} from './invoice-list/invoice-list.component';
import {CustomerListComponent} from './customer-list/customer-list.component';
import {CustomerDetailComponent} from './customer-detail/customer-detail.component';
import {InvoiceDetailComponent} from './invoice-detail/invoice-detail.component';
import {LoginComponent} from './login/login.component';
import {UserListComponent} from './user-list/user-list.component';
import {SettingsDetailComponent} from './settings-detail/settings-detail.component';

const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'invoice-list', component: InvoiceListComponent},
    {path: 'customer-list', component: CustomerListComponent},
    {path: 'invoice-detail/:invoiceId/:newInvoice/:invoiceReadonly', component: InvoiceDetailComponent},
    {path: 'invoice-create', component: InvoiceDetailComponent},
    {path: 'customer-detail/:customerId/:newCustomer', component: CustomerDetailComponent},
    {path: 'customer-detail/:customerId/:newCustomer/customer-history', component: CustomerListComponent},
    {path: 'login', component: LoginComponent},
    {path: 'user-list', component: UserListComponent},
    {path: 'settings-detail', component: SettingsDetailComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class InvoiceRouterModule {
}

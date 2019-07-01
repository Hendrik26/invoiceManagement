import {Component, OnInit, OnDestroy} from '@angular/core';
import {Invoice} from '../invoice';
// import {isNullOrUndefined} from 'util';
import {ThreeStateButton} from '../three-state-button';
import {Router} from '@angular/router';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {Customer} from '../customer';
import {Subscription} from 'rxjs';


@Component({
    selector: 'app-invoice-list',
    templateUrl: './invoice-list.component.html',
    styleUrls: ['./invoice-list.component.css']
})


export class InvoiceListComponent implements OnInit, OnDestroy {

    customers: Customer[];
    filterEndDate: Date;
    filterStartDate: Date;
    invoiceFilterArchive = 'notArchive';
    invoiceFilterArchiveOption = 16;
    invoiceFilterCompany = undefined;
    invoiceFilterCompanyOption = 0;
    invoiceFilterDateOption = 0;
    invoiceFilterState = 'Kein';
    invoiceFilterStateOption = 0;
    invoices: Invoice[];
    maxDate = new Date(2100, 1, 1);
    minDate = new Date(1900, 1, 1);
    sortCompanyName: ThreeStateButton;
    sortStartDate: ThreeStateButton;
    sortStartDueDate: ThreeStateButton;
    private timeoutSubscription: Subscription;
    private customerSubscription: Subscription;

    constructor(
        private router: Router,
        // private route: ActivatedRoute,
        // private location: Location,
        private fbInvoiceService: FbInvoiceService,
        public settingsService: SettingsService) {
    }

    ngOnDestroy(): void {
        if (this.customerSubscription) {
            this.customerSubscription.unsubscribe();
        }
        if (this.timeoutSubscription) {
            this.timeoutSubscription.unsubscribe();
        }
    }


    ngOnInit() {
        if (!this.settingsService.loginUser.id) {
            this.router.navigateByUrl('/login');
        }
        this.sortStartDueDate = new ThreeStateButton('DueDate');
        this.sortStartDate = new ThreeStateButton('Date');
        this.sortCompanyName = new ThreeStateButton('CompanyName');
        this.receiveInvoices();
        this.receiveCustomers();
    }

    sortStartDueDateClick(): void {
        this.sortStartDate.reset();
        this.sortCompanyName.reset();
        this.sortStartDueDate.switch();
        this.sortInvoice();
    }

    sortStartDateClick(): void {
        this.sortStartDueDate.reset();
        this.sortCompanyName.reset();
        this.sortStartDate.switch();
        this.sortInvoice();
    }

    sortCompanyNameClick(): void {
        this.sortStartDueDate.reset();
        this.sortStartDate.reset();
        this.sortCompanyName.switch();
        this.sortInvoice();
    }

    changeFilterStartDate(e: string) {
        this.filterStartDate = e ? new Date(e) : null;
        this.receiveInvoices();
    }

    changeFilterEndDate(e: string) {
        this.filterEndDate = e ? new Date(e) : null;
        this.receiveInvoices();
    }

    changeFilterDateOption() {
        this.receiveInvoices();
    }

    changeFilterState(e: string) {
        this.invoiceFilterStateOption = e === 'Kein' ? 0 : 4;
        this.receiveInvoices();
    }

    changeFilterCompany(e: string) {
        this.invoiceFilterCompanyOption = e ? 8 : 0;
        this.receiveInvoices();
    }

    changeFilterArchive(e: string) {
        this.invoiceFilterArchiveOption = e === 'all' ? 0 : 16;
        this.receiveInvoices();
    }

    sortInvoicesByButtons(sortButtons: ThreeStateButton[], invoices: Invoice[]): Invoice[] {
        // sortInvoicesByButtons(sortButtons: ThreeStateButton[], invoices: Invoice[]): Invoice[] {
        let retInvoices: Invoice[] = invoices;
        if (!sortButtons) {
            return invoices;
        }
        for (const sortButton of sortButtons) {
            if (sortButton.getSortingOrderId() !== 0) {
                retInvoices = Invoice.sortInvoices(sortButton.getSortBy(), (sortButton.getSortingOrderId() === 1), invoices);
            }
        }
        return retInvoices;
    }

    sortInvoice(): void {
        // DONE filter
        const retInvoices = this.invoices;

        this.invoices = this.sortInvoicesByButtons([this.sortStartDueDate, this.sortStartDate, this.sortCompanyName],
            retInvoices);

    }

    private receiveInvoices(): void {
        if (this.timeoutSubscription) {
            this.timeoutSubscription.unsubscribe();
        }
        const refIndex: number = Number(this.invoiceFilterDateOption) + Number(this.invoiceFilterStateOption)
            + Number(this.invoiceFilterCompanyOption) + Number(this.invoiceFilterArchiveOption);
        const filterStartDate = this.filterStartDate ? this.filterStartDate : this.minDate;
        const filterEndDate = this.filterEndDate ? this.filterEndDate : this.maxDate;
        const invoiceFilterCompany = this.invoiceFilterCompany ? this.invoiceFilterCompany : '';
        const invoiceFilterArchive: boolean = (this.invoiceFilterArchive === 'showArchive');
        this.timeoutSubscription = this.fbInvoiceService.getInvoiceList(refIndex, filterStartDate, filterEndDate, this.invoiceFilterState,
            invoiceFilterCompany, invoiceFilterArchive, this.settingsService.loginUser.email, this.settingsService.setting.timeoutForEdit)
            .subscribe(invoices => {
                // console.log('INVOICES: ', invoices);
                this.invoices = invoices.map(invoice => Invoice.normalizeInvoice(invoice));
                this.sortInvoice();
            }, () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during read the invoice list');
            });
    }

    private receiveCustomers(): void {
        this.customerSubscription = this.fbInvoiceService.getCustomersList('notArchive')
            .subscribe(data => {
                this.customers = Customer.sortCustomers(data.map(x => Customer.normalizeCustomer(x)));
            }, () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during read the customer list');
            });
    }


}

import {Component, OnInit} from '@angular/core';
import {Invoice} from '../invoice';
// import {isNullOrUndefined} from 'util';
import {ThreeStateButton} from '../three-state-button';
import {Router} from '@angular/router';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {Customer} from '../customer';


@Component({
    selector: 'app-invoice-list',
    templateUrl: './invoice-list.component.html',
    styleUrls: ['./invoice-list.component.css']
})


export class InvoiceListComponent implements OnInit {

    // invoicesNew: Invoice[] = [{...this.invoiceService.standardInvoice}]; // clones this.standardInvoice

    // region other properties
    invoices: Invoice[];
    // invoicesShort: InvoiceShort[];
    maxDate = new Date(2100, 1, 1);
    minDate = new Date(1900, 1, 1);
    invoiceFilterDateOption = 0;

    filterStartDate: Date;
    filterEndDate: Date;
    invoiceFilterStateOption = 0;
    invoiceFilterState = 'Kein';
    // customers: object[];
    // companySelectOptions2: Customer[];
    invoiceFilterCompany = undefined;
    customers: Customer[];
    invoiceFilterCompanyOption = 0;
    invoiceFilterArchive = 'notArchive';
    invoiceFilterArchiveOption = 16;
    // endregion

    // region ThreeStateButtons
    sortStartDueDate: ThreeStateButton;
    // sortEndDueDate: ThreeStateButton;
    sortStartDate: ThreeStateButton;
    // sortEndDate: ThreeStateButton;
    sortCompanyName: ThreeStateButton;

    // endregion

    constructor(private fbInvoiceService: FbInvoiceService,
                public settingsService: SettingsService,
                private router: Router) {
    }

    ngOnInit() {
        this.sortStartDueDate = new ThreeStateButton('DueDate');
        this.sortStartDate = new ThreeStateButton('Date');
        this.sortCompanyName = new ThreeStateButton('CompanyName');
        this.receiveInvoices();
        this.receiveCustomers();
    }


    receiveInvoices(): void {
        const refIndex: number = Number(this.invoiceFilterDateOption) + Number(this.invoiceFilterStateOption)
            + Number(this.invoiceFilterCompanyOption) + Number(this.invoiceFilterArchiveOption);
        const filterStartDate = this.filterStartDate ? this.filterStartDate : this.minDate;
        const filterEndDate = this.filterEndDate ? this.filterEndDate : this.maxDate;
        const invoiceFilterCompany = this.invoiceFilterCompany ? this.invoiceFilterCompany : '';
        const invoiceFilterArchive: boolean = (this.invoiceFilterArchive == 'showArchive');
        this.fbInvoiceService.getInvoiceList(refIndex, filterStartDate, filterEndDate, this.invoiceFilterState,
            invoiceFilterCompany, invoiceFilterArchive)
            .subscribe(invoices => {
                console.log('INVOICES: ', invoices)
                this.invoices = invoices.map(invoice => Invoice.normalizeInvoice(invoice));
                this.sortInvoice();
            });

    }


    receiveCustomers(): void {
        this.fbInvoiceService.getCustomersList('notArchive')
            .subscribe(data => {this.customers = Customer.sortCustomers(data.map(x => Customer.normalizeCustomer(x))) ; });
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


    // region other methods

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
        this.invoiceFilterStateOption = e == 'Kein' ? 0 : 4;
        this.receiveInvoices();
    }

    changeFilterCompany(e: string) {
        this.invoiceFilterCompanyOption = e ? 8 : 0;
        this.receiveInvoices();
    }

    changeFilterArchive(e: string) {
        this.invoiceFilterArchiveOption = e == 'all' ? 0 : 16;
        this.receiveInvoices();
    }


    // endregion

    sortInvoicesByButtons(sortButtons: ThreeStateButton[], invoices: Invoice[]): Invoice[] {
        // sortInvoicesByButtons(sortButtons: ThreeStateButton[], invoices: Invoice[]): Invoice[] {
        let retInvoices: Invoice[] = invoices;
        if (!sortButtons) {
            return invoices;
        }
        ;


        for (const sortButton of sortButtons) {
            if (sortButton.getSortingOrderId() != 0) {
                retInvoices = Invoice.sortInvoices(sortButton.getSortBy(), (sortButton.getSortingOrderId() == 1), invoices);
            }
        }
        ;
        return retInvoices;
    }


    sortInvoice(): void {
        // DONE filter
        const retInvoices = this.invoices;

        this.invoices = this.sortInvoicesByButtons([this.sortStartDueDate, this.sortStartDate, this.sortCompanyName],
            retInvoices);

    }


}

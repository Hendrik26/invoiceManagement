import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {Invoice} from '../invoice';
import {Item} from '../item';
import {InvoiceKind} from '../invoice-kind';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {Customer} from '../customer';
import {Setting} from '../setting';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-invoice-detail',
    templateUrl: './invoice-detail.component.html',
    styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {

    invoiceId: string;

    bruttoSum: number;
    changedItem: Item;
    changedItemNumber = -1;
    creatingInvoice: boolean;
    creatingInvoiceBtn: boolean;
    customerAdress: string;
    customers: Customer[];
    historyDateList: [{ historyKey: string, historyLabel: string }];
    historyId: string;
    historyTest: boolean;
    invoice: Invoice = Invoice.getEmptyInvoice();
    invoiceDate: Date;
    invoiceDueDate: Date;
    invoiceKind: InvoiceKind;
    invoiceSelectCustomer = '----------';
    invoiceSelectCustomerDef1 = '----------';
    logoUrl: string;
    salesTax: number;
    setting: Setting;
    timeoutCounter: string;
    private editNewItem: boolean;
    private items: Item[];
    private oldItem: Item;
    private receivedInvoiceIdError: boolean;
    private subscription: Subscription;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private fbInvoiceService: FbInvoiceService,
        public settingsService: SettingsService
    ) {
        this.invoiceDate = new Date();
        this.invoiceKind = InvoiceKind.create(false, false, false);
        this.setting = this.settingsService.setting;
        this.invoice.settingId = this.settingsService.settingId;
    }

    ngOnInit() {
        this.creatingInvoice = false;
        this.receivedInvoiceIdError = !this.hasReceivedInvoiceId();
        console.log(`\r\n\r\nInvoiceDetailComponent.ngOnInit() step 002,\r\n creatingInvoice ===${this.creatingInvoice}! \r\n\r\n`);
        if (!this.receivedInvoiceIdError && this.invoiceId) {
            this.receiveInvoiceById(this.invoiceId, null);
            this.lockInvoice();
        } else {
            this.getDownloadUrl(this.setting.logoId);
        }
        this.calculateSums();
        this.receiveCustomers();
        this.getTimeout(this.settingsService.setting.timeoutForEdit);
        this.settingsService.timeoutAlert = null;
    }

    public getTimeout(sec: number): void {
        this.subscription = this.fbInvoiceService.getTimeout(sec).subscribe(
            count => {
                const countSec = 100 + count % 60;
                const countMin = Math.floor(count / 60);
                this.timeoutCounter = countMin.toString() + ':' + countSec.toString().slice(1, 3);
                if (count <= 0) {
                    this.backToInvoiceList();
                    this.settingsService.timeoutAlert = 'Rechnungseditor wurde wegen Zeitüberschreitung geschlossen';
                }
            });
    }

    public receiveCustomers(): void {
        this.fbInvoiceService.getCustomersList('notArchive')
            .subscribe(data => {
                this.customers = Customer.sortCustomers(data.map(x => Customer.normalizeCustomer(x)));
            });
    }

    public changeFilterCompany(e: string): void {
        if (e !== this.invoiceSelectCustomerDef1) {
            this.invoice.customer = this.customers.filter(c => c.getCustomerId() === e)[0];
            this.calculateAddress();
        }
        console.log('PPP', this.invoiceSelectCustomer);
        this.invoiceSelectCustomer = this.invoiceSelectCustomerDef1;
        console.log('III', this.invoiceSelectCustomer);
    }

    public changeTimeSpanBased(): void {
        console.log('invoice-detail.component.ts.changeTimeSpanBased(), T1');
        this.invoice.invoiceKind.timeSpanBased = !this.invoice.invoiceKind.timeSpanBased;
        console.log('invoice-detail.component.ts.changeTimeSpanBased(), T2');
    }

    public changeIsSEPA(): void {
        this.invoice.invoiceKind.isSEPA = !this.invoice.invoiceKind.isSEPA;
        console.log('invoice-detail.component.ts.changeISSEPAs()');
    }

    public receiveInvoiceHistoryById(id: string): void {
        this.fbInvoiceService.getInvoiceHistoryById(id)
            .subscribe(data => {
                this.historyDateList = data;
            });
    }

    public refreshSettings(): void {
        this.setting = this.settingsService.setting;
        this.invoice.settingId = this.settingsService.settingId;
        if (this.setting.logoId && this.setting.logoId.length > 0) {
            this.getDownloadUrl(this.setting.logoId);
        }
    }

    public changeInternational(): void {
        this.invoice.invoiceKind.international = !this.invoice.invoiceKind.international;
        console.log('invoice-detail.component.ts.changeInternational()');
        this.calculateSums();
    }

    public invoiceDateChange(methEvent: string) {
        this.invoice.invoiceDate = new Date(methEvent);
        this.invoice.invoiceDueDate = new Date(this.invoice.invoiceDate.getFullYear(), this.invoice.invoiceDate.getMonth(),
            this.invoice.invoiceDate.getDate() + 14, 12);
    }

    public invoiceNumberChange(e: string) {
        this.invoice.invoiceNumber = e;
        this.invoice.invoiceIntendedUse = 'die Rechnungsnummer ' + this.invoice.invoiceNumber;
    }

    public backToInvoiceList(): void {
        if (this.creatingInvoice || this.creatingInvoiceBtn) {
            this.creatingInvoice = false;
            this.creatingInvoiceBtn = false;
        }
        this.subscription.unsubscribe();
        this.unlockInvoice();
        this.router.navigateByUrl('/invoice-list');
    }

    private editItemNumber(row: number): void {
        this.changedItemNumber = row;
        this.oldItem = new Item(this.invoice, this.invoice.items[row]);
        this.changedItem = this.invoice.items[row];
        this.editNewItem = false;
        this.lockInvoice();
    }

    private deleteItemNumber(row: number): void {
        if (confirm(`Posten "${this.invoice.items[row].itemName}" löschen?`)) {
            this.invoice.items = this.invoice.items.filter((item, index) => index !== row);
            this.calculateSums();
        }
    }

    private saveItem(): void {
        this.invoice.items[this.changedItemNumber] = Item.normalizeItem(this.invoice, this.invoice.items[this.changedItemNumber]);
        this.changedItemNumber = -1;
        this.calculateSums();
    }

    private notSaveItem(): void {
        this.invoice.items[this.changedItemNumber] = this.oldItem;
        if (this.editNewItem) {
            this.invoice.items = this.invoice.items.filter((item, index) => index !== this.changedItemNumber);
        }
        this.changedItemNumber = -1;
        this.editNewItem = false;
        this.calculateSums();
        this.lockInvoice();
    }

    private addNewItem(): void {
        // this.invoice.items.push(Item.normalizeItem(this.invoice, {}));
        this.invoice.items.push(Item.normalizeItem(this.invoice, {}));
        this.changedItemNumber = this.invoice.items.length - 1;
        this.editNewItem = true;
        this.oldItem = new Item(this.invoice, this.invoice.items[this.changedItemNumber]);
        this.changedItem = this.invoice.items[this.changedItemNumber];
        this.lockInvoice();
    }

    private receiveInvoiceById(id: string, historyId: string): void {
        this.fbInvoiceService.getInvoiceById(id, historyId, this.settingsService.settingId).subscribe(c => {
            this.invoice = Invoice.normalizeInvoice(c[0]);
            if (c[1]) {
                this.setting = Setting.normalizeSetting(c[1]);
            } else {
                this.setting = this.settingsService.setting;
            }
            if (!this.invoice.settingId) {
                this.invoice.settingId = this.settingsService.settingId;
            }
            this.getDownloadUrl(this.setting.logoId);
            this.calculateSums();
            this.calculateAddress();
            this.fbInvoiceService.testInvoiceHistoryById(id).subscribe(invoiceTest => {
                this.historyTest = invoiceTest[1];
            });
        });
    }

    private lockInvoice(): void {
        if (!this.invoiceId) {
            return;
        }
        this.fbInvoiceService.lockInvoice(this.invoiceId, this.settingsService.loginUser.email, new Date()).subscribe(
            () => {
            }
            , () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during locking a invoice');
            }
        );
    }

    private unlockInvoice(): void {
        if (!this.invoiceId) {
            return;
        }
        this.fbInvoiceService.lockInvoice(this.invoiceId, null, null).subscribe(
            () => {
            }
            , () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during unlocking a invoice');
            }
        );
    }

    private getDownloadUrl(id: string): void {
        if (!id) {
            return;
        }
        if (id.length === 0) {
            return;
        }
        this.fbInvoiceService.getDownloadUrl(id).subscribe(
            r => {
                this.logoUrl = r;
            }
            , () => {
                this.settingsService.handleDbError('Speicherfehler', 'Error during downloading a file');
            }
        );
    }

    private saveInvoice(archive: boolean = false): void {
        console.log('invoice-detail.component.ts: method saveInvoice');
        this.calculateSums();
        this.fbInvoiceService.updateInvoice(this.invoiceId, this.invoice.exportInvoiceToAny(archive)).subscribe(
            () => {
            }
            , () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during saving a invoice');
            }
        );
        this.router.navigateByUrl('/invoice-list');
        this.lockInvoice();
    }

    private calculateAddress(): void {
        this.customerAdress = this.invoice.customer.addressLine1 + '\r\n'
            + this.invoice.customer.addressLine2 + '\r\n' + this.invoice.customer.addressLine3 + '\r\n'
            + this.invoice.customer.postalCode + '\r\n' + this.invoice.customer.city + '\r\n'
            + this.invoice.customer.country;
    }

    private calculateSums(): void {
        this.invoice.wholeCost = this.invoice.items
            ? this.invoice.items.reduce((sum, current) => sum + current.count * current.partialCost, 0) : 0;
        this.salesTax = !this.invoice.invoiceKind.international ? this.invoice.wholeCost * this.invoice.salesTaxPercentage / 100 : 0;
        this.bruttoSum = this.salesTax + this.invoice.wholeCost;
    }

    private hasReceivedInvoiceId(): // can NOT be deleted
        boolean {
        if (this.route.snapshot.paramMap.has('invoiceId')) {
            this.invoiceId = this.route.snapshot.paramMap.get('invoiceId');  // get itemID???? invoiceId from URL
            // this.creatingInvoice = (this.route.snapshot.paramMap.get('newInvoice') === 'true');
            if (this.route.snapshot.paramMap.get('newInvoice') === 'true') {
                this.invoiceId = null;
            }
            return true;
        } else {
            this.invoiceId = null; // stands for the creation of a new item???? invoice
            return false;
        }
    }

    private invoiceDueDateChange(methEvent: string) {
        this.invoice.invoiceDate = new Date(methEvent);
    }

    private invoiceTimespanBeginChange(methEvent: string) {
        this.invoice.timespanBegin = new Date(methEvent);
    }

    private invoiceTimespanEndChange(methEvent: string) {
        this.invoice.timespanEnd = new Date(methEvent);
    }

    private timespan(): string {
        if (!this.invoice.timespanEnd || !this.invoice.timespanBegin) {
            return 'Ungueltiges Datum';
        }
        const diffMonth: number
            = Math.round((this.invoice.timespanEnd.getTime() - this.invoice.timespanBegin.getTime()) / 1000 / 3600 / 24 / 30);
        return '(' + diffMonth + ' Monate)';
    }

}

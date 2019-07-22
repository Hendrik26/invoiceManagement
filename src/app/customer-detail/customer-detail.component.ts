import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Customer} from '../customer';
import {CustomerType} from '../customer-type';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {Subscription} from 'rxjs';


@Component({
    selector: 'app-customer-detail',
    templateUrl: './customer-detail.component.html',
    styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit, OnDestroy {


    customerId: string;

    archived = false;
    customer: CustomerType = Customer.getEmptyCustomer();
    historyDateList: [{ historyKey: string, historyLabel: string }];
    historyId: string;
    historyTest: boolean;
    newCustomer: boolean;
    receivedCustomerIdError: boolean;
    private createSubscription: Subscription;
    private dataSubscription: Subscription;
    private historySubscription1: Subscription;
    private historySubscription2: Subscription;
    private updateSubscription: Subscription;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        // private location: Location,
        private fbInvoiceService: FbInvoiceService,
        private settingsService: SettingsService) {
    }

    ngOnDestroy(): void {
        if (this.historySubscription1) {
            this.historySubscription1.unsubscribe();
        }
        if (this.historySubscription2) {
            this.historySubscription2.unsubscribe();
        }
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
        if (this.createSubscription) {
            this.createSubscription.unsubscribe();
        }
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        if (!this.settingsService.loginUser.id) {
            this.router.navigateByUrl('/login');
        }
        this.newCustomer = false;
        this.receivedCustomerIdError = !this.hasReceivedCustomerId();
        if (!this.receivedCustomerIdError) {
            this.receiveFbCustomerById(this.customerId, null);
        }
    }

    saveCustomer(archived: boolean): void {
        const customerType: CustomerType = {
            addressLine1: this.customer.addressLine1 ? this.customer.addressLine1 : '',
            addressLine2: this.customer.addressLine2 ? this.customer.addressLine2 : '',
            addressLine3: this.customer.addressLine3 ? this.customer.addressLine3 : '',
            archived: archived,
            city: this.customer.city ? this.customer.city : '',
            country: this.customer.country ? this.customer.country : '',
            creationTime: this.customer.creationTime ? this.customer.creationTime : new Date(),
            customerBIC: this.customer.customerBIC ? this.customer.customerBIC : '',
            customerIBAN: this.customer.customerIBAN ? this.customer.customerIBAN : '',
            customerName: this.customer.customerName ? this.customer.customerName : '',  // Kundenname
            customerNumber: this.customer.customerNumber ? this.customer.customerNumber : '', // Kundennummer
            customerSalesTaxNumber: this.customer.customerSalesTaxNumber ? this.customer.customerSalesTaxNumber : '',
            lastUpdateTime: new Date(),
            mandateIdentification: this.customer.mandateIdentification ? this.customer.mandateIdentification : '',
            postalCode: this.customer.postalCode ? this.customer.postalCode : ''
        };
        if (this.newCustomer) {
            this.newCustomer = false;
            this.createCustomer(customerType);
        } else {
            this.updateCustomer(this.customerId, customerType);
        }
        this.router.navigateByUrl('/customer-list');
    }

    backToCustomerList(): void {
        this.newCustomer = false;
        this.router.navigateByUrl('/customer-list');
    }

    receiveCustomerHistoryById(id: string): void {
        this.historySubscription1 = this.fbInvoiceService.getCustomerHistoryById(id)
            .subscribe(data => {
                this.historyDateList = data;
            }, () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during read a customer history');
            });
    }

    private hasReceivedCustomerId(): // can NOT be deleted
        boolean {
        if (this.route.snapshot.paramMap.has('customerId') && this.route.snapshot.paramMap.has('newCustomer')) {
            this.customerId = this.route.snapshot.paramMap.get('customerId');  // get customerID???? customerId from URL
            this.newCustomer = (this.route.snapshot.paramMap.get('newCustomer') === 'true');
            return true;
        } else {
            this.customerId = null; // stands for the creation of a new customer
            return false;
        }
    }

    private receiveFbCustomerById(id: string, historyId: string): void {
        if (!this.newCustomer) {
            if (this.dataSubscription) {
                this.dataSubscription.unsubscribe();
            }
            this.dataSubscription = this.fbInvoiceService.getCustomerById(id, historyId).subscribe(customerType => {
                this.customer = new Customer(id, customerType);
            }, () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during read a customer');
            });
            if (this.historySubscription2) {
                this.historySubscription2.unsubscribe();
            }
            this.historySubscription2 = this.fbInvoiceService.testCustomerHistoryById(id).subscribe(customerTest => {
                this.historyTest = customerTest[1];
            }, () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during read a customer history');
            });
        } else {
            this.customer = Customer.createNewCustomer();
        }
    }

    private createCustomer(customerType: CustomerType): void {
        this.createSubscription = this.fbInvoiceService.createCustomer(customerType).subscribe(
            () => {
            }
            , () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during creation of a new customer');
            }
        );
    }

    private updateCustomer(id: string, customerType: CustomerType): void {
        this.updateSubscription = this.fbInvoiceService.updateCustomer(id, customerType).subscribe(
            () => {
            }
            , () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during updating of a customer');
            }
        );
    }

}

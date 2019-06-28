import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Customer} from '../customer';
import {CustomerType} from '../customer-type';
import {FbInvoiceService} from '../fb-invoice.service';
import {Location} from '@angular/common';
import {SettingsService} from '../settings.service';


@Component({
    selector: 'app-customer-detail',
    templateUrl: './customer-detail.component.html',
    styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {


    customerId: string;

    archived = false;
    customer: CustomerType = Customer.getEmptyCustomer();
    historyDateList: [{ historyKey: string, historyLabel: string }];
    historyId: string;
    historyTest: boolean;
    newCustomer: boolean;
    receivedCustomerIdError: boolean;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        // private location: Location,
        private fbInvoiceService: FbInvoiceService,
        private settingsService: SettingsService) {
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
        this.fbInvoiceService.getCustomerHistoryById(id)
            .subscribe(data => {
                this.historyDateList = data;
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
            this.fbInvoiceService.getCustomerById(id, historyId).subscribe(customerType => {
                this.customer = new Customer(id, customerType);
            });
            this.fbInvoiceService.testCustomerHistoryById(id).subscribe(customerTest => {
                this.historyTest = customerTest[1];
            });
        } else {
            this.customer = Customer.createNewCustomer();
        }
    }

    private createCustomer(customerType: CustomerType): void {
        this.fbInvoiceService.createCustomer(customerType).subscribe(
            () => {
            }
            , () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during creation of a new customer');
            }
        );
    }

    private updateCustomer(id: string, customerType: CustomerType): void {
        this.fbInvoiceService.updateCustomer(id, customerType).subscribe(
            () => {
            }
            , () => {
                this.settingsService.handleDbError('Datenbankfehler', 'Error during updating of a customer');
            }
        );
    }

}

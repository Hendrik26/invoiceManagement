import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Customer} from '../customer';
import {FbInvoiceService} from '../fb-invoice.service';
import {SettingsService} from '../settings.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-customer-list',
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit, OnDestroy  {

    customerParentId: string;
    customers: Customer[];
    private dataSubscription: Subscription;
    hasReceivedCustomerParentIdError = false;
    history = false;
    newParentCustomer = false;
    showArchive = 'notArchive';

    constructor(private fbInvoiceService: FbInvoiceService,
                private router: Router,
                private route: ActivatedRoute,
                public settingsService: SettingsService) {   }

    ngOnDestroy(): void {
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        if (!this.settingsService.loginUser.id) {
            this.router.navigateByUrl('/login');
        }
        this.hasReceivedCustomerParentIdError = !this.hasReceivedCustomerParentId();
        this.receiveCustomers();
    }

    private hasReceivedCustomerParentId(): // can NOT be deleted
        boolean {
        // let tempStr: string = 'tempStr';
        console.log('<<< Start method hasReceivedCustomerParentId()! >>>');
        if (this.route.snapshot.paramMap.has('customerId') && this.route.snapshot.paramMap.has('newCustomer')) {
            this.customerParentId = this.route.snapshot.paramMap.get('customerId');  // get customerID???? customerId from URL
            this.newParentCustomer = (this.route.snapshot.paramMap.get('newCustomer') === 'true');
            const has: boolean = this.route.snapshot.paramMap.has('customer-history');
            const get: string = this.route.snapshot.paramMap.get('customer-history');
            const urlToString: string = this.route.snapshot.toString();
            this.history = (urlToString.indexOf('customer-history') !== -1);
            return true;
        } else {
            this.customerParentId = null; // stands for the creation of a new customer
            return false;
        }
    }

    receiveCustomers(): void {
        this.dataSubscription = this.fbInvoiceService.getCustomersList(this.showArchive)
            .subscribe(data => {
                this.customers = Customer.sortCustomers(data.map(x => Customer.normalizeCustomer(x)));
            }, () => {
                this.settingsService.handleDbError('Speicherfehler', 'Error during read the customer list');
            });
    }

    public newCustomereBtn(): void {
        const customerId = 'nK';
        this.router.navigateByUrl('customer-detail/' + customerId + '/true');
    }
}

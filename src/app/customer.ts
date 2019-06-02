import {CustomerType} from './customer-type';
import {CustomerTypePlus} from './customer-type-plus';

export class Customer implements CustomerType {

    private static emptyCustomer: CustomerType = {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        archived: false,
        city: '',
        country: 'Deutschland',
        creationTime: new Date(),
        customerBIC: 'Customer-Bsp-BIC',
        customerIBAN: '',
        customerName: 'neuer Kunde',  // Kundenname
        customerNumber: '2018', // Kundennummer
        customerSalesTaxNumber: '000000',
        lastUpdateTime: new Date(),
        mandateIdentification: '', // Mandatsreferenz fuer SEPA-Lastschriftverfahren
        postalCode: ''
    };

    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    archived = false;
    city: string;
    country: string;
    creationTime: Date;
    customerBIC: string;
    customerIBAN: string;
    customerName: string;  // Kundenname
    customerNumber: string; // Kundennummer
    customerSalesTaxNumber: string;
    key: string;
    lastUpdateTime: Date;
    mandateIdentification: string; // Mandatsreferenz fuer SEPA-Lastschriftverfahren
    postalCode: string;

    private customerId: string; // === key

    constructor(customerId: string, data: CustomerType) {
        // IDs
        this.customerId = customerId; // New Commit after problems with merging
        // other properties
        this.addressLine1 = data.addressLine1;
        this.addressLine2 = data.addressLine2;
        this.addressLine3 = data.addressLine3;
        this.archived = data.archived;
        this.city = data.city;
        this.country = data.country;
        this.creationTime = data.creationTime ? data.creationTime : new Date();
        this.customerBIC = data.customerBIC;
        this.customerIBAN = data.customerIBAN;
        this.customerName = data.customerName;
        this.customerNumber = data.customerNumber;
        this.customerSalesTaxNumber = data.customerSalesTaxNumber;
        this.lastUpdateTime = data.lastUpdateTime ? data.lastUpdateTime : new Date();
        this.mandateIdentification = data.mandateIdentification;
        this.postalCode = data.postalCode;
    }


    public static sortCustomers(customers: Customer[]): Customer[] {
        customers.sort(function (a, b) {
            return Customer.compareCustomersByName(a, b);
        });
        return customers;
    }

    // endregion

    // region static methods
    public static getEmptyCustomer(): CustomerType {
        return new Customer('emptyCustomer', Customer.emptyCustomer);
    }

    public static createNewCustomerId() {
        const methDate: Date = new Date();
        return 'Cus' + methDate.getTime();
    }

    public static createNewCustomer(): Customer { // factory pattern, prime example
        let methCustomer: Customer;
        methCustomer = new Customer(this.createNewCustomerId(), this.emptyCustomer);
        return methCustomer;
    }

    public static normalizeCustomer(inCustomer: any): Customer {
        const cData: CustomerType = {
            addressLine1: inCustomer.addressLine1 ? inCustomer.addressLine1 : '',
            addressLine2: inCustomer.addressLine2 ? inCustomer.addressLine2 : '',
            addressLine3: inCustomer.addressLine3 ? inCustomer.addressLine3 : '',
            archived: !!inCustomer.archived,
            city: inCustomer.city ? inCustomer.city : '',
            country: inCustomer.country ? inCustomer.country : '',
            creationTime: inCustomer.creationTime ? inCustomer.creationTime.toDate() : new Date(),
            customerBIC: inCustomer.customerBIC ? inCustomer.customerBIC : '',
            customerIBAN: inCustomer.customerIBAN ? inCustomer.customerIBAN : '',
            customerName: inCustomer.customerName ? inCustomer.customerName : '',  // Kundenname
            customerNumber: inCustomer.customerNumber ? inCustomer.customerNumber : '', // Kundennummer
            customerSalesTaxNumber: inCustomer.customerSalesTaxNumber ? inCustomer.customerSalesTaxNumber : '',
            lastUpdateTime: new Date(),
            mandateIdentification: inCustomer.mandateIdentification ? inCustomer.mandateIdentification : '',
            postalCode: inCustomer.postalCode ? inCustomer.postalCode : ''
        };
        return new Customer(inCustomer.key, cData);
    }

    private static compareCustomersByName(customer1: Customer, customer2: Customer): number {
        if (customer1.customerName.trim().toLowerCase() < customer2.customerName.trim().toLowerCase()) {
            return -1;
        }
        return 1;
    }

    public getCustomerId(): string {
        return this.customerId;
    }

    public exportCustomerDataPlus(): CustomerTypePlus {
        return {
            addressLine1: this.addressLine1,
            addressLine2: this.addressLine2,
            addressLine3: this.addressLine3,
            archived: this.archived,
            city: this.city,
            country: this.country,
            creationTime: this.creationTime ? this.creationTime : new Date(),
            customerBIC: this.customerBIC,
            customerIBAN: this.customerIBAN,
            customerId: this.customerId,
            customerName: this.customerName,  // Kundenname
            customerNumber: this.customerNumber, // Kundennummer
            customerSalesTaxNumber: this.customerSalesTaxNumber,
            lastUpdateTime: this.lastUpdateTime ? this.lastUpdateTime : new Date(),
            mandateIdentification: this.mandateIdentification,
            postalCode: this.postalCode
        };
    }

}

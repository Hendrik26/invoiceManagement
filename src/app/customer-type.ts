export interface CustomerType {
    addressLine1:  string;
    addressLine2:  string;
    addressLine3:  string;
    archived: boolean;
    city:  string;
    country:  string;
    creationTime: Date;
    customerBIC: string;
    customerIBAN: string;
    customerName: string;  // Kundenname
    customerNumber: string; // Kundennummer
    customerSalesTaxNumber:  string;
    lastUpdateTime: Date;
    mandateIdentification: string; // Mandatsreferenz fuer SEPA-Lastschriftverfahren
    postalCode:  string;
}

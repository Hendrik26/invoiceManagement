import {InvoiceKindType} from './invoice-kind-type';
import {CustomerType} from './customer-type';
import {ItemType} from './item-type';

export interface InvoiceType {
    archived: boolean;
    countReminders: number; // <th>Anzahl der Mahnungen</th>
    currency: string;
    customerData: CustomerType;
    customerId: string;
    invoiceDate: Date; // <th>Rechnungsdatum</th>
    invoiceDueDate: Date; // Faelligkeitsdatum
    invoiceIntendedUse: string; // Verwendungszweck
    invoiceKind: InvoiceKindType;
    invoiceNumber: string; // <th>RechnungsNr</th>
    invoiceState: string; // <th>Status (Entwurf, bezahlt, ...)</th>
    itemTypes: ItemType[];
    lockedBy: string;
    lockedSince:  Date;
    newCreatedInvoice: boolean;
    salesTaxPercentage: number;
    settingId: string;
    timeSpan: string; // <th>Rechnungzeitraum</th>
    timespanBegin: Date;
    timespanEnd: Date;
    wholeCost: number; // <th>Gesamtpreis</th>
}

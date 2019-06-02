import {Invoice} from './invoice';
import {ItemType} from './item-type';

export class Item implements ItemType {

    count: number; // <th>Anzahl</th>
    currency = '€';
    hourPayment = false;
    itemDate: string; /// <th>Leistungsdatum</th>
    itemName: string;  // <th>Leistungsbeschreibung</th>
    partialCost: number; // <th>Stückpreis</th>
    private itemId: number; // <th>Ändern</th>
    private invoiceId: string;

    public constructor(invoice: Invoice, data: ItemType) {
        this.itemId = invoice.computeNextItemId(); // item needs itemId and invoiceId to be unique.
        this.invoiceId = invoice.getID(); // item needs itemId and invoiceId to be unique.
        this.itemDate = data.itemDate;
        this.itemName = data.itemName;
        this.partialCost = data.partialCost;
        this.count = data.count;
        this.hourPayment = data.hourPayment;
        this.currency = data.currency || '€';
    }

    public static normalizeItem(motherInvoice: Invoice, inputItem: any): Item {
        const itemData: ItemType = {
            itemDate: inputItem.itemDate ? inputItem.itemDate : new Date().toISOString().slice(0, 10), /// <th>Leistungsdatum</th>
            itemName: inputItem.itemName ? inputItem.itemName : '',  // <th>Leistungsbeschreibung</th>
            partialCost: isNaN(inputItem.partialCost) || !inputItem.partialCost ? 0 : Number(inputItem.partialCost), // <th>Stückpreis</th>
            count: isNaN(inputItem.count) || !inputItem.count ? 0 : Number(inputItem.count), // <th>Anzahl</th>
            hourPayment: !!inputItem.hourPayment,
            currency: inputItem.currency ? inputItem.currency : '€'
        };
        return new Item(motherInvoice, itemData);
    }

    public getItemId(): number {
        return this.itemId;
    }

       public partialCostString(currency: string): string {
        return this.hourPayment ? (this.partialCost.toString() + currency + '/h') : (this.partialCost.toString() + currency);
    }

    public exportItemData(): ItemType {
        return {
            itemDate: this.itemDate, /// <th>Leistungsdatum</th>
            itemName: this.itemName,  // <th>Leistungsbeschreibung</th>
            partialCost: this.partialCost, // <th>Stückpreis</th>
            count: this.count, // <th>Anzahl</th>
            hourPayment: this.hourPayment,
            currency: this.currency
        };
    }

}


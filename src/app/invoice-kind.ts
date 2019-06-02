import {InvoiceType} from './invoice-type';
import {InvoiceKindType} from './invoice-kind-type';

export class InvoiceKind implements InvoiceKindType {

    public international: boolean; // Inlandsrechnung, Bit0
    public timeSpanBased: boolean; // UZeitraumbasierter Rechnung, Bit1
    public isSEPA: boolean; // ist SEPA-Lastschrift, Bit2

    private constructor() {
        this.international = false;
        this.timeSpanBased = false;
        this.isSEPA = false;
    }

    public static create(international: boolean, timeSpanBased: boolean, isSEPA: boolean): InvoiceKind {
      const invoiceKind = new InvoiceKind();
      invoiceKind.international = !!international;
      invoiceKind.timeSpanBased = !!timeSpanBased;
      invoiceKind.isSEPA = !!isSEPA;
      return invoiceKind;
    }

    public static create01(data: InvoiceKindType): InvoiceKind {
        const invoiceKind = new InvoiceKind();
        invoiceKind.international = !!data.international;
        invoiceKind.timeSpanBased = !!data.timeSpanBased;
        invoiceKind.isSEPA = !!data.isSEPA;
        return invoiceKind;
    }

    // getter
    public getHomeCountryInvoice(): boolean {
        return this.international;
    }

    public getAbroadInvoice(): boolean {
        return !this.international;
    }

    // settet

    public changeInternational(): void {
        this.international = !this.international;
    }

  public changeTimeSpanBased(): void {
    this.timeSpanBased = !this.timeSpanBased;
  }

  public changeIsSEPA(): void {
    this.isSEPA = !this.isSEPA;
  }

  public printToString(): string {
      return `this.invoiceKind  ==={ international ===${this.international}, timeSpanBased ===${this.timeSpanBased},
      isSEPA ===${this.isSEPA}, !!!}`;
  }

    public exportInvoiceKindData(): InvoiceKindType {
      return {
        international: this.international, // Inlandsrechnung, Bit0
        timeSpanBased: this.timeSpanBased, // UZeitraumbasierter Rechnung, Bit1
        isSEPA: this.isSEPA // ist SEPA-Lastschrift, Bit2
      };
    }




}

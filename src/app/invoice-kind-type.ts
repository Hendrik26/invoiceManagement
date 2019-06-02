export interface InvoiceKindType {
   international: boolean; // Inlandsrechnung, Bit0
    timeSpanBased: boolean; // UZeitraumbasierter Rechnung, Bit1
    isSEPA: boolean; // ist SEPA-Lastschrift, Bit2
}

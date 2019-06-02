import { TestBed, inject } from '@angular/core/testing';

import { FbInvoiceService } from './fb-invoice.service';

describe('FbInvoiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FbInvoiceService]
    });
  });

  it('should be created', inject([FbInvoiceService], (service: FbInvoiceService) => {
    expect(service).toBeTruthy();
  }));
});

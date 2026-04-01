package com.sfourtraders.service;

import com.sfourtraders.api.dto.invoice.InvoiceItemRequest;
import com.sfourtraders.api.dto.invoice.InvoiceRequest;
import com.sfourtraders.domain.invoice.service.InvoiceCalculationService;
import com.sfourtraders.domain.invoice.service.InvoiceNumberService;
import com.sfourtraders.model.Invoice;
import com.sfourtraders.repository.InvoiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceCreateInvoiceRetryTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceNumberService invoiceNumberService;

    private InvoiceService invoiceService;

    @BeforeEach
    void setUp() {
        invoiceService = new InvoiceService(
                invoiceRepository,
                new InvoiceCalculationService(),
                invoiceNumberService
        );
    }

    @Test
    void shouldRetryWhenInvoiceNumberCollides() {
        InvoiceRequest request = new InvoiceRequest();
        request.setInvoiceDate("2026-04-01");
        request.setBilledName("Test Party");
        request.setItems(List.of(new InvoiceItemRequest("Item A", 2.0, 100.0)));

        when(invoiceNumberService.generateNextInvoiceNumber())
                .thenReturn("INV-2026-001")
                .thenReturn("INV-2026-002");

        when(invoiceRepository.saveAndFlush(any(Invoice.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate invoice number"))
                .thenAnswer(invocation -> {
                    Invoice saved = invocation.getArgument(0);
                    saved.setId(10L);
                    return saved;
                });

        var response = invoiceService.createInvoice(request);

        assertThat(response.getInvoiceNo()).isEqualTo("INV-2026-002");
        verify(invoiceNumberService, times(2)).generateNextInvoiceNumber();
        verify(invoiceRepository, times(2)).saveAndFlush(any(Invoice.class));
    }
}

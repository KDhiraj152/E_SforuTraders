package com.sfourtraders.domain.invoice.service;

import com.sfourtraders.repository.InvoiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Year;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvoiceNumberServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private InvoiceNumberService invoiceNumberService;

    @Test
    void shouldGenerateFirstSequenceWhenNoInvoicesExistForYear() {
        String year = String.valueOf(Year.now().getValue());
        when(invoiceRepository.findMaxSequenceForYear(year)).thenReturn(0);

        String invoiceNo = invoiceNumberService.generateNextInvoiceNumber();

        assertThat(invoiceNo).isEqualTo("INV-" + year + "-001");
    }

    @Test
    void shouldIncrementSequenceFromDatabaseMax() {
        String year = String.valueOf(Year.now().getValue());
        when(invoiceRepository.findMaxSequenceForYear(year)).thenReturn(41);

        String invoiceNo = invoiceNumberService.generateNextInvoiceNumber();

        assertThat(invoiceNo).isEqualTo("INV-" + year + "-042");
    }
}

package com.sfourtraders.domain.invoice.service;

import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.model.Invoice;
import com.sfourtraders.repository.InvoiceRepository;
import org.slf4j.Logger;
import org.springframework.stereotype.Service;
import java.time.Year;
import java.util.Optional;

/**
 * Domain service for invoice number generation with concurrency safety
 */
@Service
public class InvoiceNumberService {
    private static final Logger logger = ApplicationLogger.getLogger(InvoiceNumberService.class);
    private static final String INVOICE_PREFIX = "INV";
    private static final String INITIAL_SEQUENCE_PATTERN = "%s-%d-001";

    private final InvoiceRepository invoiceRepository;

    public InvoiceNumberService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Generate next invoice number in sequence: INV-YYYY-###
     */
    public synchronized String generateNextInvoiceNumber() {
        int year = Year.now().getValue();
        Optional<Invoice> lastInvoice = invoiceRepository.findLastInvoice();

        String nextNumber;
        if (lastInvoice.isEmpty()) {
            nextNumber = String.format(INITIAL_SEQUENCE_PATTERN, INVOICE_PREFIX, year);
        } else {
            String lastNo = lastInvoice.get().getInvoiceNo();
            nextNumber = incrementInvoiceNumber(lastNo, year);
        }

        logger.debug("Generated next invoice number: {}", nextNumber);
        return nextNumber;
    }

    /**
     * Increment invoice number, resetting sequence for new year
     */
    private String incrementInvoiceNumber(String lastNo, int currentYear) {
        String[] parts = lastNo.split("-");
        if (parts.length < 3) {
            return String.format(INITIAL_SEQUENCE_PATTERN, INVOICE_PREFIX, currentYear);
        }

        Integer lastYear = safeParseInteger(parts[1]);
        Integer sequence = safeParseInteger(parts[2]);
        if (lastYear == null || sequence == null) {
            logger.warn("Error parsing invoice number '{}', generating default", lastNo);
            return String.format(INITIAL_SEQUENCE_PATTERN, INVOICE_PREFIX, currentYear);
        }

        if (lastYear < currentYear) {
            sequence = 1;
        } else if (lastYear == currentYear) {
            sequence++;
        }

        return String.format("%s-%d-%03d", INVOICE_PREFIX, currentYear, sequence);
    }

    private Integer safeParseInteger(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}

package com.sfourtraders.service;

import com.sfourtraders.api.dto.invoice.InvoiceRequest;
import com.sfourtraders.api.dto.invoice.InvoiceItemRequest;
import com.sfourtraders.api.dto.invoice.InvoiceResponse;
import com.sfourtraders.api.dto.invoice.InvoiceItemResponse;
import com.sfourtraders.domain.invoice.service.InvoiceCalculationService;
import com.sfourtraders.domain.invoice.service.InvoiceNumberService;
import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.model.Invoice;
import com.sfourtraders.model.InvoiceItem;
import com.sfourtraders.repository.InvoiceRepository;
import com.sfourtraders.shared.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Refactored Invoice Service with proper architecture and error handling
 */
@Service
@Transactional
public class InvoiceService {
    private static final Logger logger = ApplicationLogger.getLogger(InvoiceService.class);
    private static final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_DATE;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceCalculationService calculationService;

    @Autowired
    private InvoiceNumberService invoiceNumberService;

    /**
     * Get all invoices with pagination
     */
    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getAllInvoices(int page, int size) {
        logger.debug("Fetching invoices - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return invoiceRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapInvoiceToResponse);
    }

    /**
     * Get invoice by ID
     */
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        logger.debug("Fetching invoice with ID: {}", id);
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
        return mapInvoiceToResponse(invoice);
    }

    /**
     * Get invoice entity by ID (for PDF generation and internal processing)
     */
    @Transactional(readOnly = true)
    public Invoice getInvoiceEntityById(Long id) {
        logger.debug("Fetching invoice entity with ID: {}", id);
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }

    /**
     * Generate next invoice number
     */
    @Transactional(readOnly = true)
    public String getNextInvoiceNumber() {
        logger.debug("Generating next invoice number");
        return invoiceNumberService.generateNextInvoiceNumber();
    }

    /**
     * Create new invoice
     */
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        logger.info("Creating new invoice");

        Invoice invoice = mapRequestToInvoice(request);
        invoice.setInvoiceNo(invoiceNumberService.generateNextInvoiceNumber());

        // Validate invoice data
        calculationService.validateInvoiceData(invoice);

        // Calculate totals
        updateInvoiceTotals(invoice);

        Invoice saved = invoiceRepository.save(invoice);
        ApplicationLogger.logBusinessEvent(InvoiceService.class, "INVOICE_CREATED", "Invoice #" + saved.getInvoiceNo());

        return mapInvoiceToResponse(saved);
    }

    /**
     * Update existing invoice
     */
    public InvoiceResponse updateInvoice(Long id, InvoiceRequest request) {
        logger.info("Updating invoice with ID: {}", id);

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));

        // Update fields
        updateInvoiceFields(invoice, request);

        // Validate and calculate
        calculationService.validateInvoiceData(invoice);
        updateInvoiceTotals(invoice);

        Invoice updated = invoiceRepository.save(invoice);
        ApplicationLogger.logBusinessEvent(InvoiceService.class, "INVOICE_UPDATED", "Invoice #" + updated.getInvoiceNo());

        return mapInvoiceToResponse(updated);
    }

    /**
     * Delete invoice
     */
    public void deleteInvoice(Long id) {
        logger.info("Deleting invoice with ID: {}", id);

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));

        invoiceRepository.delete(invoice);
        ApplicationLogger.logBusinessEvent(InvoiceService.class, "INVOICE_DELETED", "Invoice #" + invoice.getInvoiceNo());
    }

    /**
     * Search invoices by party name
     */
    @Transactional(readOnly = true)
    public List<InvoiceResponse> searchByParty(String partyName) {
        logger.debug("Searching invoices by party: {}", partyName);
        String searchTerm = "%" + partyName.toLowerCase() + "%";
        return invoiceRepository.findByBilledNameIgnoreCaseOrShippedNameIgnoreCase(partyName, partyName).stream()
                .map(this::mapInvoiceToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get invoices by date range
     */
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByDateRange(String fromDate, String toDate) {
        logger.debug("Fetching invoices between {} and {}", fromDate, toDate);

        try {
            LocalDate from = LocalDate.parse(fromDate, dateFormatter);
            LocalDate to = LocalDate.parse(toDate, dateFormatter);

            List<Invoice> invoices = invoiceRepository.findByInvoiceDateBetween(fromDate, toDate);
            return invoices.stream()
                    .map(this::mapInvoiceToResponse)
                    .collect(Collectors.toList());

        } catch (Exception ex) {
            logger.error("Error parsing date range: {}", ex.getMessage());
            throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
        }
    }

    /**
     * Get invoices for export (all or date-filtered)
     */
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesForExport(String fromDate, String toDate) {
        if (fromDate != null && !fromDate.isBlank() && toDate != null && !toDate.isBlank()) {
            logger.debug("Fetching export invoices between {} and {}", fromDate, toDate);
            return invoiceRepository.findByInvoiceDateBetween(fromDate, toDate);
        }

        logger.debug("Fetching all invoices for export");
        return invoiceRepository.findAllByOrderByCreatedAtDesc();
    }

    // Helper Methods

    private Invoice mapRequestToInvoice(InvoiceRequest request) {
        Invoice invoice = new Invoice();

        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setReverseCharge(request.getReverseCharge() != null ? request.getReverseCharge() : false);
        invoice.setVehicleNo(request.getVehicleNo());
        invoice.setSupplyDate(request.getSupplyDate());
        invoice.setPlaceOfSupply(request.getPlaceOfSupply());

        invoice.setBilledName(request.getBilledName());
        invoice.setBilledAddr(request.getBilledAddr());
        invoice.setBilledPin(request.getBilledPin());
        invoice.setBilledCity(request.getBilledCity());
        invoice.setBilledState(request.getBilledState());
        invoice.setBilledStateCode(request.getBilledStateCode());
        invoice.setBilledGstin(request.getBilledGstin());

        invoice.setShippedName(request.getShippedName());
        invoice.setShippedAddr(request.getShippedAddr());
        invoice.setShippedPin(request.getShippedPin());
        invoice.setShippedCity(request.getShippedCity());
        invoice.setShippedState(request.getShippedState());
        invoice.setShippedStateCode(request.getShippedStateCode());
        invoice.setShippedGstin(request.getShippedGstin());

        invoice.setSgstRate(request.getSgstRate());
        invoice.setCgstRate(request.getCgstRate());
        invoice.setIgstRate(request.getIgstRate());
        invoice.setFreight(request.getFreight());
        invoice.setEwbNo(request.getEwbNo());

        // Map items
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<InvoiceItem> items = request.getItems().stream()
                    .map(itemReq -> {
                        InvoiceItem item = new InvoiceItem();
                        item.setDescription(itemReq.getDescription());
                        item.setQuantity(itemReq.getQuantity());
                        item.setRate(itemReq.getRate());
                        item.setHsn(itemReq.getHsn());
                        item.setSac(itemReq.getSac());
                        item.setTaxRate(itemReq.getTaxRate());
                        item.setInvoice(invoice);
                        item.setValue(itemReq.getQuantity() * itemReq.getRate());
                        return item;
                    })
                    .collect(Collectors.toList());
            invoice.setItems(items);
        }

        return invoice;
    }

    private void updateInvoiceFields(Invoice invoice, InvoiceRequest request) {
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setReverseCharge(request.getReverseCharge());
        invoice.setVehicleNo(request.getVehicleNo());
        invoice.setSupplyDate(request.getSupplyDate());
        invoice.setPlaceOfSupply(request.getPlaceOfSupply());

        invoice.setBilledName(request.getBilledName());
        invoice.setBilledAddr(request.getBilledAddr());
        invoice.setBilledPin(request.getBilledPin());
        invoice.setBilledCity(request.getBilledCity());
        invoice.setBilledState(request.getBilledState());
        invoice.setBilledStateCode(request.getBilledStateCode());
        invoice.setBilledGstin(request.getBilledGstin());

        invoice.setShippedName(request.getShippedName());
        invoice.setShippedAddr(request.getShippedAddr());
        invoice.setShippedPin(request.getShippedPin());
        invoice.setShippedCity(request.getShippedCity());
        invoice.setShippedState(request.getShippedState());
        invoice.setShippedStateCode(request.getShippedStateCode());
        invoice.setShippedGstin(request.getShippedGstin());

        invoice.setSgstRate(request.getSgstRate());
        invoice.setCgstRate(request.getCgstRate());
        invoice.setIgstRate(request.getIgstRate());
        invoice.setFreight(request.getFreight());
        invoice.setEwbNo(request.getEwbNo());

        invoice.setUpdatedAt(LocalDateTime.now());

        // Update items
        invoice.getItems().clear();
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<InvoiceItem> items = request.getItems().stream()
                    .map(itemReq -> {
                        InvoiceItem item = new InvoiceItem();
                        item.setDescription(itemReq.getDescription());
                        item.setQuantity(itemReq.getQuantity());
                        item.setRate(itemReq.getRate());
                        item.setHsn(itemReq.getHsn());
                        item.setSac(itemReq.getSac());
                        item.setTaxRate(itemReq.getTaxRate());
                        item.setInvoice(invoice);
                        item.setValue(itemReq.getQuantity() * itemReq.getRate());
                        return item;
                    })
                    .collect(Collectors.toList());
            invoice.setItems(items);
        }
    }

    private void updateInvoiceTotals(Invoice invoice) {
        Double subtotal = calculationService.calculateSubtotal(invoice.getItems());
        Double sgst = calculationService.calculateGstAmount(subtotal, invoice.getSgstRate());
        Double cgst = calculationService.calculateGstAmount(subtotal, invoice.getCgstRate());
        Double igst = calculationService.calculateGstAmount(subtotal, invoice.getIgstRate());
        Double freight = invoice.getFreight() != null ? invoice.getFreight() : 0.0;

        invoice.setSubtotal(subtotal);
        invoice.setSgstAmount(sgst);
        invoice.setCgstAmount(cgst);
        invoice.setIgstAmount(igst);
        invoice.setGrandTotal(calculationService.calculateGrandTotal(subtotal, sgst, cgst, igst, freight));
    }

    private InvoiceResponse mapInvoiceToResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNo(invoice.getInvoiceNo());
        response.setInvoiceDate(invoice.getInvoiceDate());
        response.setReverseCharge(invoice.getReverseCharge());
        response.setVehicleNo(invoice.getVehicleNo());
        response.setSupplyDate(invoice.getSupplyDate());
        response.setPlaceOfSupply(invoice.getPlaceOfSupply());

        response.setBilledName(invoice.getBilledName());
        response.setBilledAddr(invoice.getBilledAddr());
        response.setBilledPin(invoice.getBilledPin());
        response.setBilledCity(invoice.getBilledCity());
        response.setBilledState(invoice.getBilledState());
        response.setBilledStateCode(invoice.getBilledStateCode());
        response.setBilledGstin(invoice.getBilledGstin());

        response.setShippedName(invoice.getShippedName());
        response.setShippedAddr(invoice.getShippedAddr());
        response.setShippedPin(invoice.getShippedPin());
        response.setShippedCity(invoice.getShippedCity());
        response.setShippedState(invoice.getShippedState());
        response.setShippedStateCode(invoice.getShippedStateCode());
        response.setShippedGstin(invoice.getShippedGstin());

        response.setSgstRate(invoice.getSgstRate());
        response.setCgstRate(invoice.getCgstRate());
        response.setIgstRate(invoice.getIgstRate());
        response.setFreight(invoice.getFreight());

        response.setSubtotal(invoice.getSubtotal());
        response.setSgstAmount(invoice.getSgstAmount());
        response.setCgstAmount(invoice.getCgstAmount());
        response.setIgstAmount(invoice.getIgstAmount());
        response.setGrandTotal(invoice.getGrandTotal());

        response.setEwbNo(invoice.getEwbNo());
        response.setEwbStatus(invoice.getEwbStatus());

        if (invoice.getItems() != null) {
            response.setItems(invoice.getItems().stream()
                    .map(item -> {
                        InvoiceItemResponse itemResp = new InvoiceItemResponse();
                        itemResp.setId(item.getId());
                        itemResp.setDescription(item.getDescription());
                        itemResp.setQuantity(item.getQuantity());
                        itemResp.setRate(item.getRate());
                        itemResp.setValue(item.getValue());
                        itemResp.setHsn(item.getHsn());
                        itemResp.setSac(item.getSac());
                        itemResp.setTaxRate(item.getTaxRate());
                        return itemResp;
                    })
                    .collect(Collectors.toList()));
        }

        response.setCreatedAt(invoice.getCreatedAt());
        response.setUpdatedAt(invoice.getUpdatedAt());

        return response;
    }
}

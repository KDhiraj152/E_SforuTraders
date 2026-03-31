package com.sfourtraders.api.controller;

import com.sfourtraders.api.dto.invoice.InvoiceRequest;
import com.sfourtraders.api.dto.invoice.InvoiceResponse;
import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.service.ExcelService;
import com.sfourtraders.service.InvoiceService;
import com.sfourtraders.service.PdfService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sfourtraders.model.Invoice;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Refactored Invoice REST API with DTOs and proper error handling
 */
@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "${allowed.origins}")
public class InvoiceController {
    private static final Logger logger = ApplicationLogger.getLogger(InvoiceController.class);

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private ExcelService excelService;

    /**
     * GET /api/invoices - List all invoices with pagination
     * Query parameters:
     *   - page: Page number (default 0)
     *   - size: Page size (default 20)
     *   - search: Search by party name (optional)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {

        ApplicationLogger.logRequest(InvoiceController.class, "getAllInvoices", "page=" + page + ", size=" + size);

        try {
            Page<InvoiceResponse> pageResp;

            if (search != null && !search.trim().isEmpty()) {
                logger.debug("Searching invoices by party: {}", search);
                java.util.List<InvoiceResponse> searchResults = invoiceService.searchByParty(search);
                int start = Math.min(page * size, searchResults.size());
                int end = Math.min(start + size, searchResults.size());
                pageResp = new PageImpl<>(
                        searchResults.subList(start, end),
                        org.springframework.data.domain.PageRequest.of(page, size),
                        searchResults.size()
                );
            } else {
                pageResp = invoiceService.getAllInvoices(page, size);
            }

            return buildPagedResponse(pageResp, page, size);

        } catch (Exception ex) {
            logger.error("Error fetching invoices: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    /**
     * GET /api/invoices/{id} - Get invoice by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long id) {
        ApplicationLogger.logRequest(InvoiceController.class, "getInvoice", "id=" + id);
        InvoiceResponse invoice = invoiceService.getInvoiceById(id);
        ApplicationLogger.logResponse(InvoiceController.class, "getInvoice", invoice.getInvoiceNo());
        return ResponseEntity.ok(invoice);
    }

    /**
     * GET /api/invoices/next-number - Get next invoice number
     */
    @GetMapping("/meta/next-number")
    public ResponseEntity<Map<String, String>> getNextNumber() {
        ApplicationLogger.logRequest(InvoiceController.class, "getNextNumber", "");
        String nextNo = invoiceService.getNextInvoiceNumber();
        return ResponseEntity.ok(Map.of("invoiceNo", nextNo));
    }

    /**
     * POST /api/invoices - Create new invoice
     */
    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        ApplicationLogger.logRequest(InvoiceController.class, "createInvoice", request.getBilledName());

        InvoiceResponse created = invoiceService.createInvoice(request);

        ApplicationLogger.logResponse(InvoiceController.class, "createInvoice", created.getInvoiceNo());
        return ResponseEntity.status(201).body(created);
    }

    /**
     * PUT /api/invoices/{id} - Update invoice
     */
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceRequest request) {

        ApplicationLogger.logRequest(InvoiceController.class, "updateInvoice", "id=" + id);

        InvoiceResponse updated = invoiceService.updateInvoice(id, request);

        ApplicationLogger.logResponse(InvoiceController.class, "updateInvoice", updated.getInvoiceNo());
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/invoices/{id} - Delete invoice
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteInvoice(@PathVariable Long id) {
        ApplicationLogger.logRequest(InvoiceController.class, "deleteInvoice", "id=" + id);

        invoiceService.deleteInvoice(id);

        ApplicationLogger.logResponse(InvoiceController.class, "deleteInvoice", "");
        return ResponseEntity.ok(Map.of("message", "Invoice deleted successfully", "id", id.toString()));
    }

    /**
     * GET /api/invoices/{id}/pdf - Download invoice as PDF
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        ApplicationLogger.logRequest(InvoiceController.class, "downloadPdf", "id=" + id);

        Invoice invoice = invoiceService.getInvoiceEntityById(id);
        byte[] pdf = pdfService.generateInvoicePdf(invoice);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + invoice.getInvoiceNo() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /**
     * GET /api/invoices/export/excel - Download invoices as Excel
     * Query parameters:
     *   - from: Start date (YYYY-MM-DD)
     *   - to: End date (YYYY-MM-DD)
     */
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> downloadExcel(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        ApplicationLogger.logRequest(InvoiceController.class, "downloadExcel", "from=" + from + ", to=" + to);

        List<Invoice> invoices = invoiceService.getInvoicesForExport(from, to);
        byte[] excel = excelService.generateExcel(invoices);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"invoices_export.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    // Helper Methods

    private ResponseEntity<Map<String, Object>> buildPagedResponse(Page<?> page, int pageNum, int size) {
        Map<String, Object> response = new HashMap<>();
        response.put("content", page.getContent());
        response.put("currentPage", pageNum);
        response.put("pageSize", size);
        response.put("totalElements", page.getTotalElements());
        response.put("totalPages", page.getTotalPages());
        response.put("hasNext", page.hasNext());
        response.put("hasPrevious", page.hasPrevious());

        return ResponseEntity.ok(response);
    }
}

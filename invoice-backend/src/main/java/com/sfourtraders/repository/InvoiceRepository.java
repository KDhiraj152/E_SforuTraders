package com.sfourtraders.repository;

import com.sfourtraders.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Invoice repository with pagination and query support
 */
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    /**
     * Get all invoices with pagination, newest first
     */
    Page<Invoice> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Get all invoices without pagination (for older compatibility)
     */
    List<Invoice> findAllByOrderByCreatedAtDesc();

    /**
     * Find invoice by invoice number
     */
    Optional<Invoice> findByInvoiceNo(String invoiceNo);

    /**
     * Find invoices within date range
     */
    @Query("SELECT i FROM Invoice i WHERE i.invoiceDate BETWEEN :fromDate AND :toDate ORDER BY i.invoiceDate DESC")
    List<Invoice> findByInvoiceDateBetween(String fromDate, String toDate);

    /**
     * Get last invoice by ID to generate next sequence
     */
    @Query(value = "SELECT * FROM invoices ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<Invoice> findLastInvoice();

    /**
     * Search invoices by billed party name (case-insensitive)
     */
    List<Invoice> findByBilledNameIgnoreCaseOrShippedNameIgnoreCase(String billedName, String shippedName);

    /**
     * Search invoices by invoice number (case-insensitive)
     */
    Optional<Invoice> findByInvoiceNoIgnoreCase(String invoiceNo);

    /**
     * Count invoices for a given month (for reporting)
     */
    @Query("SELECT COUNT(i) FROM Invoice i WHERE YEAR(i.createdAt) = :year AND MONTH(i.createdAt) = :month")
    long countByMonth(int year, int month);
}

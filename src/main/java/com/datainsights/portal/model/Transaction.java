package com.datainsights.portal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "financial_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(length = 50)
    private String category;

    @Column(length = 20)
    private String type;

    @Column(length = 50)
    private String account;

    @Column(nullable = false)
    private LocalDate createdAt;

    @Column
    private LocalDate updatedAt;

    @Column
    private Boolean isReconciled = false;

    @Column
    private Long createdBy;

    // Added import ID field for tracking data imports
    @Column
    private Long importId;

    // Combined lifecycle callbacks
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDate.now();
        determineType();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDate.now();
        determineType();
    }

    // Helper method to determine transaction type based on amount
    private void determineType() {
        if (this.amount != null) {
            this.type = (this.amount.compareTo(BigDecimal.ZERO) > 0) ? "income" : "expense";
        }
    }
}
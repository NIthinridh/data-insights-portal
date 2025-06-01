// File: src/main/java/com/datainsights/portal/model/FinancialGoal.java
package com.datainsights.portal.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "financial_goals")
public class FinancialGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Database columns exactly as they appear in your Railway database
    private String category;        // matches 'category' column

    @Column(name = "current_amount")
    private BigDecimal currentAmount;   // matches 'current_amount' column

    private String name;            // matches 'name' column
    private String notes;           // matches 'notes' column
    private String priority;        // matches 'priority' column

    @Column(name = "start_date")
    private LocalDate startDate;    // matches 'start_date' column

    @Column(name = "target_amount")
    private BigDecimal targetAmount;    // matches 'target_amount' column

    @Column(name = "target_date")
    private LocalDate targetDate;   // matches 'target_date' column

    @Column(name = "created_by")
    private Long createdBy;         // matches 'created_by' column

    // Default constructor (required by JPA)
    public FinancialGoal() {}

    // Constructor with all fields
    public FinancialGoal(String category, BigDecimal currentAmount, String name,
                         String notes, String priority, LocalDate startDate,
                         BigDecimal targetAmount, LocalDate targetDate, Long createdBy) {
        this.category = category;
        this.currentAmount = currentAmount;
        this.name = name;
        this.notes = notes;
        this.priority = priority;
        this.startDate = startDate;
        this.targetAmount = targetAmount;
        this.targetDate = targetDate;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    @Override
    public String toString() {
        return "FinancialGoal{" +
                "id=" + id +
                ", category='" + category + '\'' +
                ", name='" + name + '\'' +
                ", targetAmount=" + targetAmount +
                ", currentAmount=" + currentAmount +
                ", priority='" + priority + '\'' +
                ", targetDate=" + targetDate +
                '}';
    }
}
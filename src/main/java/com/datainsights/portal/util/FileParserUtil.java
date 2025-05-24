package com.datainsights.portal.util;

import com.datainsights.portal.model.FinancialData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class FileParserUtil {

    private static final Logger logger = LoggerFactory.getLogger(FileParserUtil.class);

    /**
     * Parse financial data from a CSV or Excel file
     *
     * @param file The uploaded file
     * @return List of financial data records
     * @throws IOException if file reading fails
     */
    public static List<FinancialData> parseFinancialDataFile(MultipartFile file) throws IOException {
        // Simple implementation for now - just extract CSV data
        List<FinancialData> dataList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            // Skip header line
            String line = reader.readLine();

            // Read data lines
            while ((line = reader.readLine()) != null) {
                String[] values = line.split(",");

                if (values.length >= 2) {  // At minimum, need date and amount
                    FinancialData data = new FinancialData();

                    // Parse date
                    String dateStr = values[0];
                    data.setTransactionDate(parseDate(dateStr));

                    // Parse amount
                    String amountStr = values[1];
                    data.setAmount(new BigDecimal(amountStr));

                    // Add other fields if available
                    if (values.length > 2) data.setDescription(values[2]);
                    if (values.length > 3) data.setCategory(values[3]);
                    if (values.length > 4) data.setAccountName(values[4]);
                    if (values.length > 5) data.setTransactionType(values[5]);

                    dataList.add(data);
                }
            }
        }

        return dataList;
    }

    private static LocalDate parseDate(String dateStr) {
        try {
            // Try standard ISO format (yyyy-MM-dd)
            return LocalDate.parse(dateStr);
        } catch (DateTimeParseException e1) {
            try {
                // Try MM/dd/yyyy format
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("MM/dd/yyyy"));
            } catch (DateTimeParseException e2) {
                try {
                    // Try dd/MM/yyyy format
                    return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } catch (DateTimeParseException e3) {
                    // If all else fails, use current date and log warning
                    logger.warn("Could not parse date '{}', using current date", dateStr);
                    return LocalDate.now();
                }
            }
        }
    }

    /**
     * Determine file type based on extension
     */
    public static String getFileType(String fileName) {
        if (fileName != null) {
            if (fileName.toLowerCase().endsWith(".csv")) {
                return "CSV";
            } else if (fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls")) {
                return "EXCEL";
            }
        }
        return "UNKNOWN";
    }
}
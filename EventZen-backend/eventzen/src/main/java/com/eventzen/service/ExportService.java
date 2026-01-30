// ================================================================
// FILE 1: ExportService.java
// ================================================================
package com.eventzen.service;

import java.io.IOException;
import com.itextpdf.text.DocumentException;

public interface ExportService {
    byte[] exportEventsToCsv() throws IOException;
    byte[] exportEventsToPdf() throws IOException, DocumentException;
    byte[] exportUsersToCsv() throws IOException;
    byte[] exportUsersToPdf() throws IOException, DocumentException;
    byte[] exportRegistrationsToCsv() throws IOException;
    byte[] exportRegistrationsToPdf() throws IOException, DocumentException;
}
import { Injectable } from '@nestjs/common';
import { Invoice } from './invoice.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, 50);
      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 85);
      doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 50, 100);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 115);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 50, 130);

      // Client info
      doc.fillColor('#000000').fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 170);
      doc.fontSize(10).font('Helvetica');
      doc.text(invoice.client?.name || '', 50, 188);
      doc.text(invoice.client?.email || '', 50, 203);
      if (invoice.client?.phone) doc.text(invoice.client.phone, 50, 218);
      if (invoice.client?.companyName) doc.text(invoice.client.companyName, 50, 233);

      // Line items table header
      const tableTop = 280;
      doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
      doc.rect(50, tableTop - 5, 500, 20).fill('#f3f4f6');
      doc.fillColor('#000000');
      doc.text('Description', 55, tableTop);
      doc.text('Qty', 300, tableTop);
      doc.text('Unit Price', 360, tableTop);
      doc.text('Total', 460, tableTop);

      // Line items
      doc.font('Helvetica');
      let y = tableTop + 25;
      invoice.items.forEach((item) => {
        doc.text(item.description, 55, y);
        doc.text(String(item.quantity), 300, y);
        doc.text(`€${Number(item.unitPrice).toFixed(2)}`, 360, y);
        doc.text(`€${Number(item.total).toFixed(2)}`, 460, y);
        y += 20;
      });

      // Totals
      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke('#e5e7eb');
      y += 15;

      doc.text('Subtotal:', 360, y);
      doc.text(`€${Number(invoice.subtotal).toFixed(2)}`, 460, y);
      y += 18;

      doc.text(`Tax (${Number(invoice.taxRate).toFixed(0)}%):`, 360, y);
      doc.text(`€${Number(invoice.taxAmount).toFixed(2)}`, 460, y);
      y += 18;

      if (Number(invoice.discount) > 0) {
        doc.text('Discount:', 360, y);
        doc.text(`-€${Number(invoice.discount).toFixed(2)}`, 460, y);
        y += 18;
      }

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Total:', 360, y);
      doc.text(`€${Number(invoice.total).toFixed(2)}`, 460, y);

      // Notes
      if (invoice.notes) {
        y += 40;
        doc.font('Helvetica-Bold').fontSize(10).text('Notes:', 50, y);
        doc.font('Helvetica').text(invoice.notes, 50, y + 15);
      }

      doc.end();
    });
  }
}
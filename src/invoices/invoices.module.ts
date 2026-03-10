// src/invoices/invoices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, InvoiceItem } from './invoice.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem])],
  providers: [InvoicesService, PdfService],
  controllers: [InvoicesController],
})
export class InvoicesModule {}
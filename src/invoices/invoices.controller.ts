import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { PdfService } from './pdf.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from './invoice.entity';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private pdfService: PdfService,
  ) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.invoicesService.findAll(req.user.id);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.invoicesService.getDashboardStats(req.user.id);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const invoice = await this.invoicesService.findOne(id, req.user.id);
    const buffer = await this.pdfService.generateInvoicePdf(invoice);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.invoicesService.findOne(id, req.user.id);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: InvoiceStatus, @Request() req) {
    return this.invoicesService.updateStatus(id, status, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.invoicesService.remove(id, req.user.id);
  }
}
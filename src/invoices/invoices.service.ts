// src/invoices/invoices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceItem, InvoiceStatus } from './invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
  ) {}

  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${year}-${random}`;
  }

  private calculateTotals(items: { quantity: number; unitPrice: number }[], taxRate: number, discount: number) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discount;
    return { subtotal, taxAmount, total };
  }

  async create(dto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    const { subtotal, taxAmount, total } = this.calculateTotals(
      dto.items,
      dto.taxRate || 0,
      dto.discount || 0,
    );

    const invoice = this.invoicesRepository.create({
      invoiceNumber: this.generateInvoiceNumber(),
      clientId: dto.clientId,
      userId,
      issueDate: new Date(dto.issueDate),
      dueDate: new Date(dto.dueDate),
      taxRate: dto.taxRate || 0,
      taxAmount,
      discount: dto.discount || 0,
      subtotal,
      total,
      notes: dto.notes,
      items: dto.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
    });

    return this.invoicesRepository.save(invoice);
  }

  async findAll(userId: string): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: { userId },
      relations: ['client', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id, userId },
      relations: ['client', 'items'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus, userId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, userId);
    invoice.status = status;
    return this.invoicesRepository.save(invoice);
  }

  async remove(id: string, userId: string): Promise<void> {
    const invoice = await this.findOne(id, userId);
    await this.invoicesRepository.remove(invoice);
  }

  async getDashboardStats(userId: string) {
    const invoices = await this.invoicesRepository.find({ where: { userId } });
    const total = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const paid = invoices.filter((inv) => inv.status === InvoiceStatus.PAID).reduce((sum, inv) => sum + Number(inv.total), 0);
    const pending = invoices.filter((inv) => inv.status === InvoiceStatus.SENT).reduce((sum, inv) => sum + Number(inv.total), 0);
    const overdue = invoices.filter((inv) => inv.status === InvoiceStatus.OVERDUE).length;

    return { total, paid, pending, overdue, invoiceCount: invoices.length };
  }
}
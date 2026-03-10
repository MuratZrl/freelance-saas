// src/clients/clients.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto, userId: string): Promise<Client> {
    const client = this.clientsRepository.create({ ...dto, userId });
    return this.clientsRepository.save(client);
  }

  async findAll(userId: string): Promise<Client[]> {
    return this.clientsRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id, userId } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, dto: Partial<CreateClientDto>, userId: string): Promise<Client> {
    const client = await this.findOne(id, userId);
    Object.assign(client, dto);
    return this.clientsRepository.save(client);
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOne(id, userId);
    await this.clientsRepository.remove(client);
  }
}
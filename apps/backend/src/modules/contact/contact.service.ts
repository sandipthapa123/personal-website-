import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface IContactSubmission {
  name: string;
  email: string;
  subject?: string;
  message: string;
  isNewsletter?: boolean;
}

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async submit(dto: IContactSubmission) {
    const name = (dto.name || '').trim();
    const email = (dto.email || '').trim();
    const message = (dto.message || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('A valid email address is required.');
    }
    if (!message) {
      throw new BadRequestException('Message is required.');
    }

    const ticket = await this.prisma.contactTicket.create({
      data: {
        name: name || 'Subscriber',
        email,
        subject: dto.subject || (dto.isNewsletter ? 'Newsletter Signup' : undefined),
        message,
        status: 'NEW',
        metadata: dto.isNewsletter ? JSON.stringify({ isNewsletter: true }) : undefined,
        replies: {
          create: {
            sender: 'USER',
            message,
          },
        },
      },
    });

    return { id: ticket.id, status: ticket.status, createdAt: ticket.created_at };
  }

  async list(status?: string) {
    const where = status && status !== 'ALL' ? { status } : {};
    return this.prisma.contactTicket.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { replies: { orderBy: { created_at: 'asc' } } },
    });
  }
}

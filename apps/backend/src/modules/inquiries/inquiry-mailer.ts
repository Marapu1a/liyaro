import type { Inquiry } from '@prisma/client';
import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '../../config/env.js';

const contactMethodLabels: Record<Inquiry['contactMethod'], string> = {
  TELEGRAM: 'Telegram',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  PHONE: 'Телефон',
};

let transporter: Transporter | null = null;

export const isInquiryMailEnabled = () => Boolean(env.SMTP_PASSWORD);

const getTransporter = (): Transporter => {
  if (transporter) return transporter;
  if (!env.SMTP_PASSWORD) {
    throw new Error('SMTP credentials are not configured');
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return transporter;
};

export async function sendInquiryEmail(inquiry: Inquiry): Promise<void> {
  if (!env.SMTP_PASSWORD) return;

  const contactMethod = contactMethodLabels[inquiry.contactMethod];
  const receivedAt = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Moscow',
  }).format(inquiry.createdAt);

  const text = [
    `Новая заявка с сайта Liyaro`,
    `Номер: ${inquiry.id}`,
    `Получена: ${receivedAt} (МСК)`,
    `Канал ответа: ${contactMethod}`,
    `Контакт: ${inquiry.contact}`,
    `Имя: ${inquiry.name ?? 'не указано'}`,
    `Согласие: версия ${inquiry.consentVersion}, ${inquiry.consentGivenAt.toISOString()}`,
    `Форма: ${inquiry.consentFormId}`,
    '',
    'Сообщение:',
    inquiry.message,
  ].join('\n');

  await getTransporter().sendMail({
    from: { name: 'Liyaro', address: env.SMTP_USER },
    to: env.INQUIRY_EMAIL_TO,
    replyTo: inquiry.contactMethod === 'EMAIL' ? inquiry.contact : undefined,
    subject: `Новая заявка Liyaro — ${contactMethod}`,
    text,
  });
}

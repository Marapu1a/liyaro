import { ContactMethod } from '@prisma/client';
import type { FastifyPluginAsync } from 'fastify';

import { inquiryRequestSchema, type InquiryRequest } from './inquiry.schema.js';

const contactMethods: Record<InquiryRequest['contactMethod'], ContactMethod> = {
  telegram: ContactMethod.TELEGRAM,
  whatsapp: ContactMethod.WHATSAPP,
  email: ContactMethod.EMAIL,
  phone: ContactMethod.PHONE,
};

export const inquiryRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/inquiries',
    {
      schema: {
        response: {
          201: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
            required: ['status'],
            additionalProperties: false,
          },
        },
      },
    },
    async (request, reply) => {
      const inquiry = inquiryRequestSchema.parse(request.body);

      await app.prisma.inquiry.create({
        data: {
          message: inquiry.message,
          contactMethod: contactMethods[inquiry.contactMethod],
          contact: inquiry.contact,
          name: inquiry.name,
        },
      });

      return reply.status(201).send({ status: 'ok' });
    },
  );
};

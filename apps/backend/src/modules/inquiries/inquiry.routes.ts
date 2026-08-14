import { ContactMethod } from '@prisma/client';
import type { FastifyPluginAsync } from 'fastify';

import { isInquiryMailEnabled, sendInquiryEmail } from './inquiry-mailer.js';
import { inquiryRequestSchema, type InquiryRequest } from './inquiry.schema.js';

const contactMethods: Record<InquiryRequest['contactMethod'], ContactMethod> = {
  telegram: ContactMethod.TELEGRAM,
  whatsapp: ContactMethod.WHATSAPP,
  email: ContactMethod.EMAIL,
  phone: ContactMethod.PHONE,
};

export const inquiryRoutes: FastifyPluginAsync = async (app) => {
  if (!isInquiryMailEnabled()) {
    app.log.warn('Inquiry email notifications are disabled: SMTP credentials are not configured');
  }

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
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
      const inquiry = inquiryRequestSchema.parse(request.body);

      const savedInquiry = await app.prisma.inquiry.create({
        data: {
          message: inquiry.message,
          contactMethod: contactMethods[inquiry.contactMethod],
          contact: inquiry.contact,
          name: inquiry.name,
          consentVersion: inquiry.consentVersion,
          consentFormId: inquiry.formId,
        },
      });

      try {
        await sendInquiryEmail(savedInquiry);
        if (isInquiryMailEnabled()) {
          app.log.info({ inquiryId: savedInquiry.id }, 'Inquiry email sent');
        }
      } catch (error) {
        app.log.error({ err: error, inquiryId: savedInquiry.id }, 'Failed to send inquiry email');
      }

      return reply.status(201).send({ status: 'ok' });
    },
  );
};

import { z } from 'zod';

export const inquiryRequestSchema = z
  .object({
    message: z.string().trim().min(10).max(5000),
    contactMethod: z.enum(['telegram', 'whatsapp', 'email', 'phone']),
    contact: z.string().trim().min(3).max(254),
    name: z.string().trim().min(1).max(100).optional(),
    website: z.string().max(0).optional(),
  })
  .superRefine((data, context) => {
    if (data.contactMethod === 'email' && !z.email().safeParse(data.contact).success) {
      context.addIssue({
        code: 'custom',
        path: ['contact'],
        message: 'Invalid email address',
      });
    }
  });

export type InquiryRequest = z.infer<typeof inquiryRequestSchema>;

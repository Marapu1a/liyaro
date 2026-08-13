import {
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from 'libphonenumber-js/max';
import { z } from 'zod';

export const contactMethods = ['telegram', 'whatsapp', 'email', 'phone'] as const;
export type ContactMethod = (typeof contactMethods)[number];

export const legalDocuments = {
  effectiveDate: '2026-08-12',
  privacyVersion: '1.0',
  consentVersion: '1.0',
  inquiryFormId: 'homepage-inquiry-v1',
} as const;

const telegramUsernamePattern = /^[a-zA-Z0-9_]{5,32}$/;
const telegramLinkPattern = /^(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]{5,32})\/?$/i;

const normalizeTelegram = (value: string): string | null => {
  const trimmed = value.trim();
  const linkMatch = telegramLinkPattern.exec(trimmed);
  const username = linkMatch?.[1] ?? trimmed.replace(/^@/, '');

  return telegramUsernamePattern.test(username) ? `@${username}` : null;
};

export type PhoneInputIssue =
  'empty' | 'invalid_country' | 'too_short' | 'too_long' | 'invalid_length' | 'invalid_number';

export type PhoneInputValidation =
  { valid: true; normalized: string } | { valid: false; issue: PhoneInputIssue };

export const validatePhoneInput = (
  value: string,
  defaultCountry?: string,
): PhoneInputValidation => {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, issue: 'empty' };

  const country = defaultCountry?.toUpperCase() as CountryCode | undefined;
  const lengthIssue = validatePhoneNumberLength(trimmed, country);

  if (lengthIssue === 'INVALID_COUNTRY') return { valid: false, issue: 'invalid_country' };
  if (lengthIssue === 'TOO_SHORT') return { valid: false, issue: 'too_short' };
  if (lengthIssue === 'TOO_LONG') return { valid: false, issue: 'too_long' };
  if (lengthIssue) return { valid: false, issue: 'invalid_length' };

  const parsed = parsePhoneNumberFromString(trimmed, country);
  return parsed?.isValid()
    ? { valid: true, normalized: parsed.number }
    : { valid: false, issue: 'invalid_number' };
};

const normalizePhone = (value: string): string | null => {
  const validation = validatePhoneInput(value);
  return validation.valid ? validation.normalized : null;
};

const optionalNameSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z
    .string()
    .trim()
    .min(1, 'Укажите имя или оставьте поле пустым')
    .max(100, 'Не больше 100 символов')
    .optional(),
);

export const inquiryRequestSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(10, 'Расскажите чуть подробнее — хотя бы 10 символов')
      .max(5000, 'Сообщение не должно быть длиннее 5000 символов'),
    contactMethod: z.enum(contactMethods),
    contact: z
      .string()
      .trim()
      .min(1, 'Укажите, куда вам ответить')
      .max(254, 'Контакт слишком длинный'),
    name: optionalNameSchema,
    consent: z.literal(true, { error: 'Необходимо согласие на обработку персональных данных' }),
    consentVersion: z.literal(legalDocuments.consentVersion, {
      error: 'Версия согласия устарела. Обновите страницу',
    }),
    formId: z.literal(legalDocuments.inquiryFormId, {
      error: 'Неизвестная форма отправки',
    }),
    website: z.string().max(0).optional(),
  })
  .superRefine((data, context) => {
    if (data.contactMethod === 'email' && !z.email().safeParse(data.contact).success) {
      context.addIssue({
        code: 'custom',
        path: ['contact'],
        message: 'Проверьте адрес электронной почты',
      });
    }

    if (
      (data.contactMethod === 'phone' || data.contactMethod === 'whatsapp') &&
      !normalizePhone(data.contact)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['contact'],
        message: 'Проверьте номер телефона и код страны',
      });
    }

    if (data.contactMethod === 'telegram' && !normalizeTelegram(data.contact)) {
      context.addIssue({
        code: 'custom',
        path: ['contact'],
        message: 'Укажите @username или ссылку вида t.me/username',
      });
    }
  })
  .transform((data) => {
    let contact = data.contact.trim();

    if (data.contactMethod === 'email') contact = contact.toLowerCase();
    if (data.contactMethod === 'telegram') contact = normalizeTelegram(contact) ?? contact;
    if (data.contactMethod === 'phone' || data.contactMethod === 'whatsapp') {
      contact = normalizePhone(contact) ?? contact;
    }

    return { ...data, contact };
  });

export type InquiryRequest = z.infer<typeof inquiryRequestSchema>;

interface MailtoOptions {
  subject?: string;
  body?: string;
}

/** Link mailto: con oggetto e testo codificati (gli spazi restano %20, non "+", per i client di posta). */
export const mailtoHref = (email: string, { subject, body }: MailtoOptions = {}) => {
  const params = [
    subject && `subject=${encodeURIComponent(subject)}`,
    body && `body=${encodeURIComponent(body)}`,
  ].filter(Boolean);
  return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`;
};

export type LeadSubmission = {
  type: 'Test Drive' | 'General Inquiry';
  name: string;
  phone: string;
  vehicle_id?: string;
  vehicle_model?: string;
  message?: string;
  date?: string;
  time?: string;
  consent: true;
};

export const sanitizePhone = (value: string) =>
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\d+(). \-\/–—]/g, '')
    .slice(0, 25);

export const isValidPhone = (value: string) => {
  const trimmed = sanitizePhone(value).trim();
  const digits = trimmed.replace(/\D/g, '');
  const pattern = /^[0-9+() .\s\-/–—]{7,25}$/;
  return pattern.test(trimmed) && digits.length >= 7 && digits.length <= 16;
};

export const submitLead = async (lead: LeadSubmission) => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...lead,
      consent: true,
      botField: '',
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Lead capture failed.');
  }

  return data as { ok: true };
};

export type LeadSubmission = {
  type: 'Test Drive' | 'General Inquiry';
  name: string;
  phone: string;
  vehicle_id?: string;
  vehicle_model?: string;
  message?: string;
  date?: string;
  time?: string;
};

export const submitLead = async (lead: LeadSubmission) => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...lead,
      botField: '',
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Lead capture failed.');
  }

  return data as { ok: true };
};

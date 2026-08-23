// Tipos compartidos del módulo de reservas (/book).
// Aislado del resto del sitio: nada de aquí se importa desde blog/portfolio.

export interface BookSettings {
  timezone: string; // timezone del host, ej. 'America/Chicago'
  durations: number[]; // duraciones ofrecidas en minutos, ej. [30, 60]
  slot_increment: number; // cada cuántos minutos empieza un slot
  buffer_before: number;
  buffer_after: number;
  min_notice_minutes: number; // anticipación mínima
  max_days_ahead: number; // ventana máxima a futuro
  daily_limit: number; // 0 = sin límite
  allow_cancel: boolean;
  cancel_cutoff_hours: number;
  allow_reschedule: boolean;
  reschedule_cutoff_hours: number;
  zoom_link: string;
  zoom_note: string; // passcode u otra nota
  host_name: string;
  host_email: string;
  event_title: string; // plantilla, admite {name} y {host}
  event_description: string;
  page_title_en: string;
  page_title_es: string;
  page_intro_en: string;
  page_intro_es: string;
  calendar_id: string; // 'primary' u otro
  active: boolean; // permite apagar la página temporalmente
}

export interface AvailabilityRule {
  id: string;
  weekday: number; // 0 = domingo … 6 = sábado
  start_min: number; // minutos desde medianoche, hora del host
  end_min: number;
  active: boolean;
}

export interface Blackout {
  id: string;
  start_date: string; // YYYY-MM-DD (hora del host)
  end_date: string; // inclusive
  reason: string | null;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  manage_token: string;
  name: string;
  email: string;
  notes: string | null;
  start_utc: string; // ISO
  end_utc: string; // ISO
  duration_min: number;
  guest_tz: string;
  guest_lang: string;
  status: BookingStatus;
  google_event_id: string | null;
  created_at: string;
  cancelled_at: string | null;
  cancelled_by: string | null;
  ip: string | null;
}

export interface GoogleAccount {
  email: string | null;
  refresh_token: string;
  access_token: string | null;
  expires_at: string | null;
  calendar_id: string;
  scope: string | null;
  connected_at: string;
}

export interface Interval {
  start: number; // epoch ms
  end: number; // epoch ms
}

export const DEFAULT_SETTINGS: BookSettings = {
  timezone: 'America/Chicago',
  durations: [30, 60],
  slot_increment: 30,
  buffer_before: 0,
  buffer_after: 15,
  min_notice_minutes: 720, // 12 horas
  max_days_ahead: 45,
  daily_limit: 4,
  allow_cancel: true,
  cancel_cutoff_hours: 12,
  allow_reschedule: true,
  reschedule_cutoff_hours: 12,
  zoom_link: '',
  zoom_note: '',
  host_name: 'Vinicio Garzón',
  host_email: 'yo@viniciogarzon.com',
  event_title: '{name} ↔ {host}',
  event_description:
    'Virtual meeting booked through viniciogarzon.com/book.\n\nJoin on Zoom: {zoom}',
  page_title_en: "Let's talk",
  page_title_es: 'Hablemos',
  page_intro_en:
    'Pick a time that works for you. You will get a calendar invite with the Zoom link right away.',
  page_intro_es:
    'Elige el horario que mejor te sirva. Recibirás la invitación de calendario con el link de Zoom al instante.',
  calendar_id: 'primary',
  active: true,
};

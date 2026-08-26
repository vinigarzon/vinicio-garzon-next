// Diccionarios ES/EN del módulo. El idioma sale de Accept-Language y se puede
// forzar con ?lang=es | ?lang=en o con el switch de la página.

export type Lang = 'en' | 'es';

export function pickLang(acceptLanguage: string | null, override?: string | null): Lang {
  if (override === 'es' || override === 'en') return override;
  const header = (acceptLanguage || '').toLowerCase();
  // Nos quedamos con el primer idioma con peso más alto que entendamos.
  const entries = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: tag.trim(), q: q ? Number(q.split('=')[1]) : 1 };
    })
    .filter((e) => e.tag)
    .sort((a, b) => b.q - a.q);
  for (const e of entries) {
    if (e.tag.startsWith('es')) return 'es';
    if (e.tag.startsWith('en')) return 'en';
  }
  return 'en';
}

export const dict = {
  en: {
    locale: 'en-US',
    stepDuration: 'How long do you need?',
    minutes: 'minutes',
    minutesShort: 'min',
    stepDate: 'Pick a day',
    stepTime: 'Pick a time',
    stepDetails: 'Your details',
    timezoneLabel: 'Times shown in',
    detectedTz: 'detected from your browser',
    changeTz: 'Change',
    name: 'Full name',
    email: 'Email',
    notes: 'What would you like to talk about?',
    notesPlaceholder: 'Optional — a line or two helps me prepare.',
    optional: 'optional',
    back: 'Back',
    confirm: 'Confirm booking',
    booking: 'Booking…',
    loading: 'Loading availability…',
    noSlotsDay: 'No times left on this day.',
    noSlotsMonth: 'Nothing available this month. Try the next one.',
    pickAnother: 'Pick another day',
    confirmedTitle: "You're booked",
    confirmedBody: 'A calendar invite with the Zoom link is on its way to {email}.',
    joinZoom: 'Join on Zoom',
    manageLine: 'Need to change it? Use the link in your confirmation email.',
    withHost: 'with',
    errRequired: 'Please fill in your name and email.',
    errEmail: 'That email address does not look right.',
    errSlot: 'Sorry — someone just took that time. Pick another one.',
    errGeneric: 'Something went wrong. Please try again in a moment.',
    errClosed: 'Bookings are closed right now.',
    errUnavailable: "The calendar is not responding right now, so times can't be shown. Please try again shortly or email me.",
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    duration: 'Duration',
    when: 'When',
    // gestionar la cita
    manageTitle: 'Your meeting',
    manageWith: 'Meeting with',
    statusCancelled: 'This meeting was cancelled.',
    statusPast: 'This meeting already happened.',
    cancelCta: 'Cancel meeting',
    cancelConfirmTitle: 'Cancel this meeting?',
    cancelConfirmBody: 'It will be removed from the calendar and we will both get an email.',
    cancelYes: 'Yes, cancel it',
    cancelNo: 'Keep it',
    cancelledTitle: 'Meeting cancelled',
    cancelledBody: 'It is off the calendar. You can always book another time.',
    rescheduleCta: 'Reschedule',
    rescheduleTitle: 'Pick a new time',
    rescheduleConfirm: 'Confirm new time',
    rescheduledTitle: 'Meeting moved',
    rescheduledBody: 'The invite has been updated to the new time.',
    cutoffCancel: 'This meeting is too close to now to cancel online. Just reply to the invite email.',
    cutoffReschedule: 'This meeting is too close to now to reschedule online. Just reply to the invite email.',
    notFound: 'We could not find that meeting.',
    bookAnother: 'Book another time',
  },
  es: {
    locale: 'es-ES',
    stepDuration: '¿Cuánto tiempo necesitas?',
    minutes: 'minutos',
    minutesShort: 'min',
    stepDate: 'Elige el día',
    stepTime: 'Elige la hora',
    stepDetails: 'Tus datos',
    timezoneLabel: 'Horas mostradas en',
    detectedTz: 'detectada de tu navegador',
    changeTz: 'Cambiar',
    name: 'Nombre completo',
    email: 'Correo',
    notes: '¿De qué te gustaría hablar?',
    notesPlaceholder: 'Opcional — un par de líneas me ayudan a prepararme.',
    optional: 'opcional',
    back: 'Volver',
    confirm: 'Confirmar reserva',
    booking: 'Reservando…',
    loading: 'Cargando disponibilidad…',
    noSlotsDay: 'No quedan horarios ese día.',
    noSlotsMonth: 'No hay nada disponible este mes. Prueba el siguiente.',
    pickAnother: 'Elegir otro día',
    confirmedTitle: 'Listo, quedó agendada',
    confirmedBody: 'La invitación de calendario con el link de Zoom va en camino a {email}.',
    joinZoom: 'Entrar por Zoom',
    manageLine: '¿Necesitas cambiarla? Usa el link de tu correo de confirmación.',
    withHost: 'con',
    errRequired: 'Completa tu nombre y tu correo.',
    errEmail: 'Ese correo no parece válido.',
    errSlot: 'Alguien acaba de tomar ese horario. Elige otro, por favor.',
    errGeneric: 'Algo salió mal. Vuelve a intentarlo en un momento.',
    errClosed: 'Las reservas están cerradas en este momento.',
    errUnavailable: 'El calendario no está respondiendo, así que no se pueden mostrar horarios. Inténtalo en un rato o escríbeme por correo.',
    prevMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    duration: 'Duración',
    when: 'Cuándo',
    manageTitle: 'Tu reunión',
    manageWith: 'Reunión con',
    statusCancelled: 'Esta reunión fue cancelada.',
    statusPast: 'Esta reunión ya ocurrió.',
    cancelCta: 'Cancelar reunión',
    cancelConfirmTitle: '¿Cancelar esta reunión?',
    cancelConfirmBody: 'Se quitará del calendario y a los dos nos llegará un correo.',
    cancelYes: 'Sí, cancelar',
    cancelNo: 'Mantenerla',
    cancelledTitle: 'Reunión cancelada',
    cancelledBody: 'Ya no está en el calendario. Puedes agendar otro horario cuando quieras.',
    rescheduleCta: 'Reagendar',
    rescheduleTitle: 'Elige el nuevo horario',
    rescheduleConfirm: 'Confirmar nuevo horario',
    rescheduledTitle: 'Reunión movida',
    rescheduledBody: 'La invitación se actualizó al nuevo horario.',
    cutoffCancel: 'Falta muy poco para la reunión como para cancelarla en línea. Responde al correo de la invitación.',
    cutoffReschedule: 'Falta muy poco para la reunión como para reagendarla en línea. Responde al correo de la invitación.',
    notFound: 'No encontramos esa reunión.',
    bookAnother: 'Agendar otro horario',
  },
} as const;

export type Dict = (typeof dict)['en'];

export function t(lang: Lang): Dict {
  return dict[lang] as unknown as Dict;
}

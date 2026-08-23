const { computeSlots } = require('../node_modules/.book-test/availability');

let failures = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.log(`FAIL  ${name}\n      esperado ${e}\n      obtenido ${a}`);
  }
}

const settings = {
  timezone: 'America/Chicago',
  durations: [30, 60],
  slot_increment: 30,
  buffer_before: 0,
  buffer_after: 0,
  min_notice_minutes: 0,
  max_days_ahead: 365,
  daily_limit: 0,
  allow_cancel: true,
  cancel_cutoff_hours: 0,
  allow_reschedule: true,
  reschedule_cutoff_hours: 0,
  zoom_link: '',
  zoom_note: '',
  host_name: 'V',
  host_email: '',
  event_title: '',
  event_description: '',
  page_title_en: '', page_title_es: '', page_intro_en: '', page_intro_es: '',
  calendar_id: 'primary',
  active: true,
};

// Lunes 9:00–11:00 hora de Chicago
const rules = [{ id: 'r1', weekday: 1, start_min: 540, end_min: 660, active: true }];
const base = { settings, rules, blackouts: [], bookings: [], busy: [], duration: 30 };

// --- 1. Horario en invierno (CST = UTC-6): lunes 2 de marzo de 2026
let r = computeSlots({ ...base, guestTz: 'America/Chicago', fromKey: '2026-03-02', toKey: '2026-03-02', now: new Date('2026-02-01T00:00:00Z') });
check('CST: 9:00 CT = 15:00 UTC', r['2026-03-02'], [
  '2026-03-02T15:00:00.000Z', '2026-03-02T15:30:00.000Z',
  '2026-03-02T16:00:00.000Z', '2026-03-02T16:30:00.000Z',
]);

// --- 2. Después del cambio de hora (CDT = UTC-5): lunes 9 de marzo de 2026
r = computeSlots({ ...base, guestTz: 'America/Chicago', fromKey: '2026-03-09', toKey: '2026-03-09', now: new Date('2026-02-01T00:00:00Z') });
check('CDT: 9:00 CT = 14:00 UTC (DST aplicado)', r['2026-03-09'], [
  '2026-03-09T14:00:00.000Z', '2026-03-09T14:30:00.000Z',
  '2026-03-09T15:00:00.000Z', '2026-03-09T15:30:00.000Z',
]);

// --- 3. Invitado en Madrid: mismos instantes, agrupados por SU fecha local
r = computeSlots({ ...base, guestTz: 'Europe/Madrid', fromKey: '2026-03-09', toKey: '2026-03-09', now: new Date('2026-02-01T00:00:00Z') });
check('Madrid ve los mismos 4 instantes el mismo día', r['2026-03-09'], [
  '2026-03-09T14:00:00.000Z', '2026-03-09T14:30:00.000Z',
  '2026-03-09T15:00:00.000Z', '2026-03-09T15:30:00.000Z',
]);

// --- 4. Invitado en Tokio: 14:00 UTC del lunes es martes 23:00 en Tokio
r = computeSlots({ ...base, guestTz: 'Asia/Tokyo', fromKey: '2026-03-09', toKey: '2026-03-10', now: new Date('2026-02-01T00:00:00Z') });
// 14:00Z = 23:00 del lunes en Tokio; 15:00Z ya es medianoche del martes.
check('Tokio: los dos primeros caen en su lunes', r['2026-03-09'], [
  '2026-03-09T14:00:00.000Z', '2026-03-09T14:30:00.000Z',
]);
check('Tokio: los dos últimos cruzan a su martes', r['2026-03-10'], [
  '2026-03-09T15:00:00.000Z', '2026-03-09T15:30:00.000Z',
]);

// --- 5. Un evento en Google tapa el segundo slot
r = computeSlots({
  ...base,
  busy: [{ start: Date.parse('2026-03-09T14:30:00Z'), end: Date.parse('2026-03-09T15:00:00Z') }],
  guestTz: 'America/Chicago', fromKey: '2026-03-09', toKey: '2026-03-09', now: new Date('2026-02-01T00:00:00Z'),
});
check('Ocupado en Google elimina ese slot', r['2026-03-09'], [
  '2026-03-09T14:00:00.000Z', '2026-03-09T15:00:00.000Z', '2026-03-09T15:30:00.000Z',
]);

// --- 6. Buffer de 15 min después: una reserva bloquea también el slot siguiente
r = computeSlots({
  ...base,
  settings: { ...settings, buffer_after: 15 },
  bookings: [{ start: Date.parse('2026-03-09T14:00:00Z'), end: Date.parse('2026-03-09T14:30:00Z') }],
  guestTz: 'America/Chicago', fromKey: '2026-03-09', toKey: '2026-03-09', now: new Date('2026-02-01T00:00:00Z'),
});
check('Buffer posterior come el slot contiguo', r['2026-03-09'], [
  '2026-03-09T15:00:00.000Z', '2026-03-09T15:30:00.000Z',
]);

// --- 7. Anticipación mínima de 12 h
r = computeSlots({
  ...base,
  settings: { ...settings, min_notice_minutes: 720 },
  guestTz: 'America/Chicago', fromKey: '2026-03-09', toKey: '2026-03-09',
  now: new Date('2026-03-09T02:30:00Z'), // el corte de 12 h cae en las 14:30Z
});
check('Anticipación mínima recorta lo que queda muy cerca', r['2026-03-09'], [
  '2026-03-09T14:30:00.000Z', '2026-03-09T15:00:00.000Z', '2026-03-09T15:30:00.000Z',
]);

// --- 7b. Anticipación mínima que se come el día entero
r = computeSlots({
  ...base,
  settings: { ...settings, min_notice_minutes: 720 },
  guestTz: 'America/Chicago', fromKey: '2026-03-09', toKey: '2026-03-09',
  now: new Date('2026-03-09T05:00:00Z'),
});
check('Anticipación mínima puede cerrar el día completo', r['2026-03-09'], undefined);

// --- 8. Duración de 60 min: el último slot debe caber completo en la ventana
r = computeSlots({
  ...base, duration: 60,
  guestTz: 'America/Chicago', fromKey: '2026-03-09', toKey: '2026-03-09', now: new Date('2026-02-01T00:00:00Z'),
});
check('60 min no se desborda de la ventana 9–11', r['2026-03-09'], [
  '2026-03-09T14:00:00.000Z', '2026-03-09T14:30:00.000Z', '2026-03-09T15:00:00.000Z',
]);

// --- 9. Fecha bloqueada
r = computeSlots({
  ...base,
  blackouts: [{ id: 'b', start_date: '2026-03-09', end_date: '2026-03-09', reason: 'viaje' }],
  guestTz: 'America/Chicago', fromKey: '2026-03-09', toKey: '2026-03-09', now: new Date('2026-02-01T00:00:00Z'),
});
check('Fecha bloqueada no ofrece nada', r['2026-03-09'], undefined);

// --- 10. Tope diario alcanzado
r = computeSlots({
  ...base,
  settings: { ...settings, daily_limit: 1 },
  bookings: [{ start: Date.parse('2026-03-09T20:00:00Z'), end: Date.parse('2026-03-09T20:30:00Z') }],
  guestTz: 'America/Chicago', fromKey: '2026-03-09', toKey: '2026-03-09', now: new Date('2026-02-01T00:00:00Z'),
});
check('Tope diario cierra el día completo', r['2026-03-09'], undefined);

// --- 11. Página apagada
r = computeSlots({ ...base, settings: { ...settings, active: false }, guestTz: 'UTC', fromKey: '2026-03-09', toKey: '2026-03-09', now: new Date('2026-02-01T00:00:00Z') });
check('Página cerrada devuelve vacío', r, {});

console.log(failures === 0 ? '\nTodo verde' : `\n${failures} fallo(s)`);
process.exit(failures ? 1 : 0);

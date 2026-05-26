const TURNO_ID_KEY = 'plataforma_ovo_turno_id';

export function getTurnoIdSalvo() {
  const v = sessionStorage.getItem(TURNO_ID_KEY);
  return v ? Number(v) : null;
}

export function salvarTurnoId(id) {
  if (id) sessionStorage.setItem(TURNO_ID_KEY, String(id));
  else sessionStorage.removeItem(TURNO_ID_KEY);
}

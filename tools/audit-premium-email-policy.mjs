const GENERIC_EMAIL_ALIASES = new Set([
  'atendimento',
  'comunicacao',
  'contato',
  'dle',
  'licenciamento',
  'ouvidoria',
  'protocolo',
  'suporte',
]);

const AUTHORIZED_PUBLIC_EMAILS = new Set([
  'bol.rafaelaugusto@iat.pr.gov.br',
]);

export function isPermittedPublicEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (AUTHORIZED_PUBLIC_EMAILS.has(normalized)) return true;
  const separator = normalized.indexOf('@');
  if (separator < 1) return false;
  return GENERIC_EMAIL_ALIASES.has(normalized.slice(0, separator));
}

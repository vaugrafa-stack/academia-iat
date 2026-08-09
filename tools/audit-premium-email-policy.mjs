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

// Dominios que a RFC 2606 reserva para documentacao e teste. Ninguem pode
// registra-los, entao um endereco nesses dominios nao e de pessoa nenhuma, que
// e exatamente o que este portao existe para impedir de ser publicado.
//
// A comparacao e por igualdade, e nao por sufixo, de proposito: `example.com.br`
// existe de verdade e nao esta reservado. Aceitar sufixo abriria a porta que a
// regra fecha.
const DOMINIOS_RESERVADOS = new Set([
  'example.com',
  'example.net',
  'example.org',
]);

// TLDs reservados pela mesma RFC. Aqui o casamento e por sufixo porque a reserva
// vale para o topo inteiro: qualquer coisa em `.invalid` e inventada.
const TOPOS_RESERVADOS = ['.example', '.invalid', '.localhost', '.test'];

export function isPermittedPublicEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (AUTHORIZED_PUBLIC_EMAILS.has(normalized)) return true;
  const separator = normalized.indexOf('@');
  if (separator < 1) return false;

  const dominio = normalized.slice(separator + 1);
  if (DOMINIOS_RESERVADOS.has(dominio)) return true;
  if (TOPOS_RESERVADOS.some((topo) => dominio.endsWith(topo))) return true;

  return GENERIC_EMAIL_ALIASES.has(normalized.slice(0, separator));
}

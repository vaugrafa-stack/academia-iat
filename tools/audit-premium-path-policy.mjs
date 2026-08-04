export function containsPersonalHomePath(line) {
  const text = String(line || '');
  if (/\b[A-Za-z]:\\+(?:Users|Documents and Settings)\\+/i.test(text)) {
    return true;
  }

  // O nome de uma pasta inicial também pode ser um segmento legítimo de URLs
  // públicas, como no portal GeoPR. Retira somente URLs HTTP(S); caminhos locais
  // que apareçam na mesma linha continuam sujeitos à verificação.
  const withoutPublicUrls = text.replace(/\bhttps?:\/\/[^\s"'<>`]+/gi, '');
  return /\/(?:Users|home)\/[^/\s"']+/i.test(withoutPublicUrls);
}

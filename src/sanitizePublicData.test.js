import { describe, expect, it } from 'vitest';
import {
  findUnsafePublicData,
  isSanitizedPublicDocument,
  sanitizePublicDocument,
} from '../tools/sanitize-public-data.mjs';

describe('sanitização dos artefatos públicos', () => {
  it('aceita o mesmo documento independentemente da formatação e dos finais de linha', () => {
    const formattedWithCrLf = [
      '{',
      '  "metadata": {',
      '    "core": {},',
      '    "application": {},',
      '    "custom": {}',
      '  }',
      '}',
      '',
    ].join('\r\n');
    const document = JSON.parse(formattedWithCrLf);

    expect(isSanitizedPublicDocument(document)).toBe(true);
  });

  it('remove metadados pessoais e redações identificáveis antes da publicação', () => {
    const source = {
      metadata: {
        core: {
          creator: 'Pessoa Exemplo',
          title: 'POP de treinamento',
        },
        application: {
          Company: 'Empresa Exemplo',
          Application: 'Microsoft Office Word',
        },
        custom: {
          fullPath: ['C:', 'Users', 'pessoa', 'Downloads', 'fonte.docx'].join('\\'),
        },
      },
      paragraphs: [
        {
          text: `Revisado por Pessoa Exemplo; contato ${['pessoa', 'example.com'].join('@')}.`,
        },
      ],
    };

    expect(isSanitizedPublicDocument(source)).toBe(false);

    const sanitized = sanitizePublicDocument(source);
    const serialized = JSON.stringify(sanitized);

    expect(sanitized.metadata.core).toEqual({ title: 'POP de treinamento' });
    expect(sanitized.metadata.application).toEqual({
      Application: 'Microsoft Office Word',
    });
    expect(sanitized.metadata.custom).toEqual({});
    expect(serialized).toContain('[nome removido por privacidade]');
    expect(serialized).toContain('[e-mail removido por privacidade]');
    expect(findUnsafePublicData(serialized)).toEqual([]);
    expect(isSanitizedPublicDocument(sanitized)).toBe(true);
  });
});

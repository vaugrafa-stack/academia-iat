// Gate dos seis pilotos audiovisuais. Valida o roteiro contra a extração
// do POP e os ativos contra o manifesto gerado; não avalia o mérito técnico,
// que continua sujeito à revisão editorial e institucional prevista.
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const scriptsPath = resolve(root, 'src/data/audiovisual-pilot-scripts.json');
const sourceManifestPath = resolve(root, 'src/data/audiovisual-pilot-media.json');
const publicManifestPath = resolve(root, 'public/media/piloto/manifest.json');
const provenancePath = resolve(root, 'public/media/piloto/provenance.json');
const popPath = resolve(root, 'src/data/pop-public-content.json');
const expected = [
  'pop-section-018',
  'pop-section-059',
  'pop-section-069',
  'pop-section-094',
  'pop-section-108',
  'pop-section-134',
];
const visemeOrder = [
  'rest', 'MBP', 'IE', 'A', 'O', 'U', 'FV', 'L', 'CHJ', 'E_OPEN', 'SCHWA', 'rest_alt',
];

const loadJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const errors = [];
const fail = (message) => errors.push(message);

const [scripts, sourceManifest, publicManifest, provenance, pop] = await Promise.all([
  loadJson(scriptsPath),
  loadJson(sourceManifestPath),
  loadJson(publicManifestPath),
  loadJson(provenancePath),
  loadJson(popPath),
]);

const actualScripts = scripts.pilots.map((pilot) => pilot.lessonId).sort();
if (!sameJson(actualScripts, expected)) fail('a seleção de roteiros não corresponde aos seis IDs aprovados');
if (scripts.sourceDocument?.sha256 !== pop.source?.sha256) {
  fail('o hash do POP nos roteiros diverge da extração pública');
}

const sections = new Set(pop.sections.map((section) => section.id));
const paragraphSections = new Map(
  pop.blocks.filter((block) => block.paragraph?.id).map((block) => [block.paragraph.id, block.sectionId]),
);
const tableSections = new Map(
  pop.blocks.filter((block) => block.tableId).map((block) => [block.tableId, block.sectionId]),
);
const officialIds = new Set((scripts.officialSources || []).map((source) => source.id));

for (const pilot of scripts.pilots) {
  const refs = new Map(pilot.sourceRefs.map((ref) => [ref.id, ref]));
  for (const ref of refs.values()) {
    if (!ref.locator) fail(`${pilot.lessonId}/${ref.id}: localizador público ausente`);
    if (ref.kind === 'pop') {
      if (!sections.has(ref.sectionId)) fail(`${pilot.lessonId}/${ref.id}: seção inexistente`);
      for (const id of ref.paragraphIds || []) {
        if (paragraphSections.get(id) !== ref.sectionId) {
          fail(`${pilot.lessonId}/${ref.id}: ${ref.sectionId} não contém ${id}`);
        }
      }
      for (const id of ref.tableIds || []) {
        if (tableSections.get(id) !== ref.sectionId) {
          fail(`${pilot.lessonId}/${ref.id}: ${ref.sectionId} não contém ${id}`);
        }
      }
    } else if (ref.kind === 'official' && !officialIds.has(ref.officialSourceId)) {
      fail(`${pilot.lessonId}/${ref.id}: fonte oficial inexistente`);
    }
  }
  for (const scene of pilot.scenes) {
    if (!scene.citations?.length) fail(`${pilot.lessonId}/${scene.id}: fala sem fonte`);
    for (const citation of scene.citations || []) {
      if (!refs.has(citation)) fail(`${pilot.lessonId}/${scene.id}: fonte ${citation} não declarada`);
    }
  }
}

if (!sameJson(sourceManifest, publicManifest)) {
  fail('os manifestos de origem e público divergem');
}
const expectedProvenance = {
  schemaVersion: publicManifest.schemaVersion,
  voice: publicManifest.voice,
  background: publicManifest.background,
  presenterSprite: publicManifest.presenterSprite,
  sourceDocument: publicManifest.sourceDocument,
};
if (
  Object.keys(expectedProvenance).some(
    (key) => !sameJson(provenance?.[key], expectedProvenance[key]),
  )
) {
  fail('a proveniência pública diverge do manifesto audiovisual');
}
const items = publicManifest.items || [];
const actualMedia = items.map((item) => item.lessonId).sort();
if (!sameJson(actualMedia, expected)) fail('o manifesto não contém exatamente os seis pilotos');
if (new Set(actualMedia).size !== actualMedia.length) fail('o manifesto contém aula duplicada');

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const publicFile = (assetPath) => resolve(root, 'public', assetPath.replace(/^\/+/, ''));
const parseTime = (value) => {
  const match = value.trim().match(/^(?:(\d{2}):)?(\d{2}):(\d{2}\.\d{3})$/);
  return match ? Number(match[1] || 0) * 3600 + Number(match[2]) * 60 + Number(match[3]) : NaN;
};
const parseVtt = (value) => value.split(/\r?\n\r?\n/).slice(1).flatMap((block) => {
  const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const timingIndex = lines.findIndex((line) => line.includes('-->'));
  if (timingIndex < 0) return [];
  const [start, endWithOptions] = lines[timingIndex].split('-->').map((part) => part.trim());
  return [{
    start: parseTime(start),
    end: parseTime(endWithOptions.split(/\s+/)[0]),
    lines: lines.slice(timingIndex + 1),
  }];
});
const mp4Duration = (buffer) => {
  const typeAt = buffer.indexOf(Buffer.from('mvhd'));
  if (typeAt < 0) return NaN;
  const payload = typeAt + 4;
  const version = buffer[payload];
  if (version === 0) {
    const scale = buffer.readUInt32BE(payload + 12);
    return scale ? buffer.readUInt32BE(payload + 16) / scale : NaN;
  }
  if (version === 1) {
    const scale = buffer.readUInt32BE(payload + 20);
    return scale ? Number(buffer.readBigUInt64BE(payload + 24)) / scale : NaN;
  }
  return NaN;
};

for (const item of items) {
  if (item.durationSeconds < 90 || item.durationSeconds > 240) {
    fail(`${item.lessonId}: duração fora de 90–240 segundos`);
  }
  if (item.wordsPerMinute < 130 || item.wordsPerMinute > 150) {
    fail(`${item.lessonId}: ritmo fora de 130–150 palavras por minuto`);
  }
  if (item.presenterCoverage < 0.3 || item.presenterCoverage > 0.4) {
    fail(`${item.lessonId}: professor fora da faixa de 30–40%`);
  }
  if (item.transitionSeconds > 0.25) {
    fail(`${item.lessonId}: transição visual acima de 250 ms`);
  }
  const computedCoverage = (item.presenterWindows || [])
    .reduce((total, [start, end]) => total + end - start, 0) / item.durationSeconds;
  if (Math.abs(computedCoverage - item.presenterCoverage) > 0.002) {
    fail(`${item.lessonId}: cobertura do professor não confere com as janelas`);
  }

  const buffers = {};
  for (const name of ['video', 'poster', 'captions', 'transcript', 'visemes']) {
    const asset = item.assets?.[name];
    if (!asset?.path || !/^[a-f0-9]{64}$/i.test(asset.sha256 || '')) {
      fail(`${item.lessonId}: ativo ${name} sem contrato completo`);
      continue;
    }
    try {
      const buffer = await readFile(publicFile(asset.path));
      buffers[name] = buffer;
      if (buffer.byteLength !== asset.bytes) fail(`${item.lessonId}: tamanho de ${name} diverge`);
      if (sha256(buffer) !== asset.sha256) fail(`${item.lessonId}: hash de ${name} diverge`);
    } catch {
      fail(`${item.lessonId}: ativo ${name} ausente`);
    }
  }

  if (buffers.video) {
    const moov = buffers.video.indexOf(Buffer.from('moov'));
    const mdat = buffers.video.indexOf(Buffer.from('mdat'));
    if (moov < 0 || mdat < 0 || moov > mdat) fail(`${item.lessonId}: MP4 sem fast start`);
    if (!buffers.video.includes(Buffer.from('avc1')) || !buffers.video.includes(Buffer.from('mp4a'))) {
      fail(`${item.lessonId}: codecs H.264/AAC não identificados`);
    }
    const duration = mp4Duration(buffers.video);
    if (!Number.isFinite(duration) || Math.abs(duration - item.durationSeconds) > 0.35) {
      fail(`${item.lessonId}: duração real do MP4 diverge do manifesto`);
    }
  }

  if (buffers.captions) {
    const vtt = buffers.captions.toString('utf8');
    if (!vtt.startsWith('WEBVTT')) fail(`${item.lessonId}: legenda sem cabeçalho WEBVTT`);
    const cues = parseVtt(vtt);
    let previousEnd = 0;
    for (const cue of cues) {
      if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.end <= cue.start) {
        fail(`${item.lessonId}: intervalo de legenda inválido`);
      }
      if (cue.start + 0.002 < previousEnd) fail(`${item.lessonId}: legendas sobrepostas`);
      if (cue.end - cue.start > 6.01) fail(`${item.lessonId}: legenda acima de 6 segundos`);
      if (cue.lines.length > 2) fail(`${item.lessonId}: legenda acima de 2 linhas`);
      if (cue.lines.some((line) => line.length > 42)) fail(`${item.lessonId}: linha acima de 42 caracteres`);
      const characters = cue.lines.join(' ').length;
      if (characters / (cue.end - cue.start) > 17.01) fail(`${item.lessonId}: legenda acima de 17 cps`);
      previousEnd = cue.end;
    }
    if (!cues.length || cues.at(-1).end > item.durationSeconds + 0.03) {
      fail(`${item.lessonId}: legenda vazia ou posterior ao vídeo`);
    }
  }

  if (buffers.visemes) {
    const timeline = JSON.parse(buffers.visemes.toString('utf8'));
    if (!sameJson(timeline.visemeOrder, visemeOrder)) fail(`${item.lessonId}: ordem dos 12 visemas diverge`);
    if (timeline.alignmentStatus !== 'estimated-pilot') {
      fail(`${item.lessonId}: status da sincronização deve declarar estimativa`);
    }
    let previousEnd = 0;
    for (const entry of timeline.entries || []) {
      if (!Number.isInteger(entry.viseme) || entry.viseme < 0 || entry.viseme > 11) {
        fail(`${item.lessonId}: índice de visema inválido`);
      }
      if (entry.end <= entry.start || Math.abs(entry.start - previousEnd) > 0.003) {
        fail(`${item.lessonId}: linha do tempo de visemas tem lacuna ou sobreposição`);
      }
      previousEnd = entry.end;
    }
    if (!timeline.entries?.length || Math.abs(previousEnd - item.durationSeconds) > 0.003) {
      fail(`${item.lessonId}: visemas não cobrem toda a duração`);
    }
  }
}

for (const name of ['source', 'optimized']) {
  const asset = publicManifest.presenterSprite?.[name];
  if (!asset?.path) {
    fail(`sprite do professor sem ativo ${name}`);
    continue;
  }
  try {
    const buffer = await readFile(publicFile(asset.path));
    if (buffer.byteLength !== asset.bytes || sha256(buffer) !== asset.sha256) {
      fail(`sprite do professor ${name} diverge do manifesto`);
    }
    const searchable = buffer.toString('latin1').toLowerCase();
    if (['openai', 'gpt-image', 'trainedalgorithmicmedia'].some((term) => searchable.includes(term))) {
      fail(`sprite público do professor ${name} contém metadado editorial proibido`);
    }
  } catch {
    fail(`sprite do professor ${name} ausente`);
  }
}

try {
  const background = publicManifest.background;
  const buffer = await readFile(publicFile(background?.path));
  if (buffer.byteLength !== background?.bytes || sha256(buffer) !== background?.sha256) {
    fail('fundo temático diverge do manifesto');
  }
} catch {
  fail('fundo temático ausente');
}

if (publicManifest.voice?.provider !== 'piper-faber' || publicManifest.voice?.clonedVoice !== false) {
  fail('o piloto deve declarar a voz local Faber e que não houve clonagem');
}
for (const [label, value] of [
  ['modelo', publicManifest.voice?.modelSha256],
  ['configuração', publicManifest.voice?.configSha256],
]) {
  if (!/^[a-f0-9]{64}$/i.test(value || '')) {
    fail(`SHA-256 da voz inválido: ${label}`);
  }
}
// O modelo de geração é uma dependência de produção, não um ativo do site:
// os MP4 publicados já contêm o áudio e tools/tts é ignorado para não adicionar
// dezenas de megabytes ao repositório. Quando o modelo existe nesta estação,
// conferimos seus hashes; em clone limpo/CI, a proveniência registrada segue
// obrigatória, mas o gate não exige a ferramenta local de síntese.
for (const [path, expectedHash] of [
  [resolve(root, 'tools/tts/pt_BR-faber-medium.onnx'), publicManifest.voice?.modelSha256],
  [resolve(root, 'tools/tts/pt_BR-faber-medium.onnx.json'), publicManifest.voice?.configSha256],
]) {
  try {
    const buffer = await readFile(path);
    if (sha256(buffer) !== expectedHash) fail(`hash da voz diverge: ${path}`);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      fail(`não foi possível verificar o arquivo local da voz: ${path}`);
    }
  }
}

if (errors.length) {
  for (const error of errors) console.log(`FALHA: ${error}`);
  console.log(`${errors.length} problema(s) no piloto audiovisual.`);
  process.exit(1);
}
const totalBytes = await Promise.all(items.map((item) => stat(publicFile(item.assets.video.path))));
console.log(
  `OK: ${items.length} pilotos, roteiros e fontes rastreados, legendas legíveis, `
  + `12 visemas e ${(totalBytes.reduce((sum, info) => sum + info.size, 0) / 1_000_000).toFixed(1)} MB de vídeo.`,
);

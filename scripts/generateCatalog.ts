/**
 * Script para gerar CATALOG.md automaticamente a partir do songCatalog.ts
 * Execute: npx ts-node scripts/generateCatalog.ts
 */

import { SONG_CATALOG } from '../backend/src/data/songCatalog.js';
import * as fs from 'fs';
import * as path from 'path';

function getLanguageFlag(lang: string): string {
  switch (lang) {
    case 'pt-BR': return '🇧🇷';
    case 'en': return '🇺🇸';
    case 'es': return '🇪🇸';
    default: return lang;
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function generateCatalogMd(): string {
  const lines: string[] = [];

  lines.push('# 🎤 Catálogo de Músicas - CantAI Karaokê');
  lines.push('');
  lines.push(`> Atualizado automaticamente em ${new Date().toLocaleDateString('pt-BR')} | Total: **${SONG_CATALOG.length} músicas**`);
  lines.push('');
  lines.push('## Músicas Disponíveis');
  lines.push('');
  lines.push('| Código | Música | Artista | Gênero | Idioma | Duração | Verso Famoso |');
  lines.push('|--------|--------|---------|--------|--------|---------|--------------|');

  for (const song of SONG_CATALOG) {
    const code = song.code;
    const title = escapeMarkdown(song.song);
    const artist = escapeMarkdown(song.artist);
    const genre = escapeMarkdown(song.genre);
    const lang = getLanguageFlag(song.language);
    const duration = song.duration;
    const verse = song.famousVerse ? `_"${escapeMarkdown(song.famousVerse)}"_` : '-';

    lines.push(`| ${code} | ${title} | ${artist} | ${genre} | ${lang} | ${duration} | ${verse} |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Estatísticas');
  lines.push('');

  // Contagem por idioma
  const byLanguage = SONG_CATALOG.reduce((acc, song) => {
    acc[song.language] = (acc[song.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  lines.push('### Por Idioma');
  lines.push('| Idioma | Quantidade |');
  lines.push('|--------|------------|');
  lines.push(`| 🇧🇷 Português | ${byLanguage['pt-BR'] || 0} |`);
  lines.push(`| 🇺🇸 Inglês | ${byLanguage['en'] || 0} |`);
  lines.push(`| 🇪🇸 Espanhol | ${byLanguage['es'] || 0} |`);
  lines.push('');

  // Contagem por gênero
  const byGenre = SONG_CATALOG.reduce((acc, song) => {
    acc[song.genre] = (acc[song.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedGenres = Object.entries(byGenre).sort((a, b) => b[1] - a[1]);

  lines.push('### Por Gênero');
  lines.push('| Gênero | Quantidade |');
  lines.push('|--------|------------|');
  for (const [genre, count] of sortedGenres) {
    lines.push(`| ${genre} | ${count} |`);
  }
  lines.push('');

  // Músicas com versos famosos
  const withVerses = SONG_CATALOG.filter(s => s.famousVerse).length;
  lines.push('### Versos Famosos');
  lines.push(`- **${withVerses}** músicas têm versos famosos cadastrados`);
  lines.push(`- **${SONG_CATALOG.length - withVerses}** músicas aguardam cadastro de versos`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*Este arquivo é gerado automaticamente pelo script `scripts/generateCatalog.ts`*');

  return lines.join('\n');
}

// Gerar e salvar o arquivo
const catalogContent = generateCatalogMd();
const outputPath = path.join(__dirname, '..', 'CATALOG.md');

fs.writeFileSync(outputPath, catalogContent, 'utf-8');
console.log(`✅ CATALOG.md gerado com sucesso!`);
console.log(`   📁 ${outputPath}`);
console.log(`   🎵 ${SONG_CATALOG.length} músicas catalogadas`);

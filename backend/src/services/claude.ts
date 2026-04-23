import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// --- CONFIGURAÇÃO E VALIDAÇÃO (ZOD) ---

// Pesos das dimensões de avaliação (devem somar 1.0)
const DIMENSION_WEIGHTS = {
  pitch: 0.45,   // Tom: 45% - Mais importante, é a base do canto
  lyrics: 0.35,  // Letra: 35% - Importante, mas considera que nem todos sabem a letra
  energy: 0.20,  // Energia: 20% - Complementar, engajamento e interpretação
};

// Schema de validação robusta para garantir a estrutura do JSON
const EvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dimensions: z.object({
    pitch: z.object({ score: z.number(), detail: z.string() }),
    lyrics: z.object({ score: z.number(), detail: z.string() }),
    energy: z.object({ score: z.number(), detail: z.string() }),
  }),
  encouragement: z.string(),
});

// Singleton do Cliente Anthropic
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada no arquivo .env');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// --- INTERFACES ---

export interface PitchStats {
  averageFrequency: number;
  pitchStability: number;
  notesDetected: string[];
  pitchAccuracy: number;
  totalSamples: number;
  validSamples: number;
  chorusDetected?: boolean;
  peakVolumeMoments?: number;
}

export interface EvaluationInput {
  transcription: string;
  songCode: string;
  songTitle: string;
  artist: string;
  language: string;
  pitchStats?: PitchStats;
  songDuration?: string; // Duração da música no formato "MM:SS"
  recordingDuration?: number; // Duração da gravação em segundos
}

export interface DimensionScore {
  score: number;
  detail: string;
}

export interface PerformanceEvaluation {
  overallScore: number;
  dimensions: {
    pitch: DimensionScore;    // Tom
    lyrics: DimensionScore;   // Letra
    energy: DimensionScore;   // Animação/Energia
  };
  encouragement: string;
}

// --- TEORIA MUSICAL: ESCALAS ---

// Notas musicais (sem oitava)
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Intervalos das escalas (em semitons a partir da tônica)
const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],      // Escala maior: T T S T T T S
  minor: [0, 2, 3, 5, 7, 8, 10],      // Escala menor natural
  pentatonic: [0, 2, 4, 7, 9],        // Pentatônica maior (comum em pop/rock)
  minorPentatonic: [0, 3, 5, 7, 10],  // Pentatônica menor (comum em blues/rock)
};

/**
 * Extrai apenas o nome da nota (sem oitava): "C#4" -> "C#"
 */
function extractNoteName(noteWithOctave: string): string {
  return noteWithOctave.replace(/[0-9]/g, '');
}

/**
 * Converte nome da nota para índice (0-11): "C" -> 0, "C#" -> 1, etc.
 */
function noteToIndex(note: string): number {
  const noteName = extractNoteName(note);
  const index = NOTE_NAMES.indexOf(noteName);
  return index >= 0 ? index : -1;
}

/**
 * Gera as notas de uma escala a partir de uma tônica
 */
function getScaleNotes(tonic: string, scaleType: keyof typeof SCALE_INTERVALS): string[] {
  const tonicIndex = noteToIndex(tonic);
  if (tonicIndex < 0) return [];

  const intervals = SCALE_INTERVALS[scaleType];
  return intervals.map(interval => NOTE_NAMES[(tonicIndex + interval) % 12]);
}

/**
 * Analisa as notas cantadas e verifica coerência com escalas musicais
 * Retorna informações sobre qual escala melhor se encaixa
 */
function analyzeMusicalScale(notesDetected: string[]): {
  bestScale: { tonic: string; type: string; matchPercentage: number } | null;
  scaleCoherence: number; // 0-100: quão bem as notas se encaixam em uma escala
  analysis: string;
} {
  if (!notesDetected || notesDetected.length < 3) {
    return {
      bestScale: null,
      scaleCoherence: 50, // Sem dados suficientes, assume neutro
      analysis: 'Poucas notas detectadas para análise de escala.',
    };
  }

  // Extrai apenas os nomes das notas (sem oitava) e remove duplicatas
  const uniqueNotes = [...new Set(notesDetected.map(extractNoteName))];
  const noteSet = new Set(uniqueNotes);

  let bestMatch = { tonic: '', type: '', matchPercentage: 0 };

  // Testa cada tônica possível e cada tipo de escala
  for (const tonic of NOTE_NAMES) {
    for (const [scaleType, _] of Object.entries(SCALE_INTERVALS)) {
      const scaleNotes = getScaleNotes(tonic, scaleType as keyof typeof SCALE_INTERVALS);
      const scaleSet = new Set(scaleNotes);

      // Conta quantas notas cantadas estão na escala
      let notesInScale = 0;
      for (const note of uniqueNotes) {
        if (scaleSet.has(note)) notesInScale++;
      }

      const matchPercentage = (notesInScale / uniqueNotes.length) * 100;

      if (matchPercentage > bestMatch.matchPercentage) {
        bestMatch = { tonic, type: scaleType, matchPercentage };
      }
    }
  }

  // Calcula coerência baseada no melhor match
  const scaleCoherence = Math.round(bestMatch.matchPercentage);

  // Gera análise textual
  let analysis: string;
  const scaleTypeName = bestMatch.type === 'major' ? 'maior' :
                        bestMatch.type === 'minor' ? 'menor' :
                        bestMatch.type === 'pentatonic' ? 'pentatônica maior' :
                        'pentatônica menor';

  if (scaleCoherence >= 85) {
    analysis = `Excelente! As notas cantadas se encaixam muito bem na escala de ${bestMatch.tonic} ${scaleTypeName}.`;
  } else if (scaleCoherence >= 70) {
    analysis = `Bom! A maioria das notas está dentro da escala de ${bestMatch.tonic} ${scaleTypeName}.`;
  } else if (scaleCoherence >= 50) {
    analysis = `As notas mostram alguma coerência com a escala de ${bestMatch.tonic} ${scaleTypeName}.`;
  } else {
    analysis = `As notas cantadas estão um pouco dispersas entre diferentes escalas.`;
  }

  return {
    bestScale: bestMatch.matchPercentage > 0 ? bestMatch : null,
    scaleCoherence,
    analysis,
  };
}

// --- FUNÇÕES AUXILIARES ---

/**
 * Converte duração no formato "MM:SS" para segundos
 */
function parseDuration(duration: string): number {
  const parts = duration.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }
  return 180; // Default 3 minutos
}

/**
 * Conta palavras significativas na transcrição (ignora interjeições curtas isoladas)
 */
function countSignificantWords(text: string): number {
  if (!text || !text.trim()) return 0;

  // Remove pontuação e normaliza
  const cleaned = text.toLowerCase().replace(/[.,!?;:'"()-]/g, ' ');
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);

  // Conta palavras com 2+ caracteres (ignora "a", "e", "o" isolados mas conta "ah", "ei", etc)
  return words.filter(w => w.length >= 2).length;
}

/**
 * Calcula a cobertura de letra baseada em palavras por minuto esperadas
 * Uma música típica tem entre 30-50 palavras por minuto de canto
 * Consideramos ~35 palavras/minuto como média para karaokê (tem pausas instrumentais)
 */
function calculateLyricsCoverage(
  transcription: string,
  songDurationSeconds: number,
  recordingDurationSeconds?: number
): { coverage: number; wordCount: number; expectedWords: number; analysis: string } {
  const wordCount = countSignificantWords(transcription);

  // Usa a duração da gravação se disponível, senão usa a da música
  const effectiveDuration = recordingDurationSeconds || songDurationSeconds;
  const durationMinutes = effectiveDuration / 60;

  // Estimativa: ~20 palavras por minuto em média para karaokê
  // (considera longas pausas instrumentais e músicas lentas)
  const expectedWords = Math.round(durationMinutes * 20);

  // Calcula cobertura (máximo 100%, mínimo 0%)
  const rawCoverage = expectedWords > 0 ? (wordCount / expectedWords) * 100 : 0;
  const coverage = Math.min(100, Math.max(0, rawCoverage));

  // Análise textual
  let analysis: string;
  if (coverage >= 90) {
    analysis = 'Excelente cobertura! Cantou praticamente toda a letra.';
  } else if (coverage >= 70) {
    analysis = 'Boa cobertura da letra, acompanhou a maior parte da música.';
  } else if (coverage >= 50) {
    analysis = 'Cobertura parcial - cantou cerca de metade da letra.';
  } else if (coverage >= 25) {
    analysis = 'Cantou pouco da letra - tente acompanhar mais a música.';
  } else if (coverage > 0) {
    analysis = 'Cobertura muito baixa - precisa cantar mais junto com a música.';
  } else {
    analysis = 'Não detectamos canto - tente cantar mais alto e acompanhar a letra.';
  }

  return { coverage, wordCount, expectedWords, analysis };
}

/**
 * Calcula score base de letra (0-100) baseado na cobertura
 * Curva suave: penaliza mais quem canta muito pouco
 */
function calculateLyricsBaseScore(coverage: number): number {
  if (coverage >= 90) return 95 + (coverage - 90) * 0.5; // 95-100
  if (coverage >= 70) return 80 + (coverage - 70) * 0.75; // 80-95
  if (coverage >= 50) return 60 + (coverage - 50) * 1; // 60-80
  if (coverage >= 25) return 35 + (coverage - 25) * 1; // 35-60
  if (coverage >= 10) return 15 + (coverage - 10) * 1.33; // 15-35
  return coverage * 1.5; // 0-15
}

// --- FUNÇÃO PRINCIPAL ---

export async function evaluateWithClaude(input: EvaluationInput): Promise<PerformanceEvaluation> {
  const { transcription, songTitle, artist, language, pitchStats, songDuration, recordingDuration } = input;

  // Calcula cobertura de letra
  const songDurationSeconds = songDuration ? parseDuration(songDuration) : 180;
  const lyricsCoverage = calculateLyricsCoverage(transcription, songDurationSeconds, recordingDuration);
  const lyricsBaseScore = calculateLyricsBaseScore(lyricsCoverage.coverage);

  // Análise de escala musical
  const scaleAnalysis = pitchStats?.notesDetected
    ? analyzeMusicalScale(pitchStats.notesDetected)
    : { bestScale: null, scaleCoherence: 50, analysis: 'Sem dados de notas.' };

  console.log(`📝 Análise de Letra: ${lyricsCoverage.wordCount} palavras detectadas, esperado ~${lyricsCoverage.expectedWords} (${lyricsCoverage.coverage.toFixed(1)}% cobertura, score base: ${lyricsBaseScore.toFixed(0)})`);
  console.log(`🎵 Análise de Escala: ${scaleAnalysis.analysis} (coerência: ${scaleAnalysis.scaleCoherence}%)`);

  // 1. SYSTEM PROMPT OTIMIZADO: Focado em interpretação de contexto musical
  // IMPORTANTE: Avaliação GENEROSA de tom - se cantou no tom a maior parte, já é bom!
  const systemPrompt = `Você é o "KaraokeAI", um jurado de karaokê experiente, carismático e GENEROSO.

SUA MISSÃO:
Avaliar a performance cruzando os DADOS TÉCNICOS fornecidos com o GÊNERO MUSICAL da canção "${songTitle}" de "${artist}".

⭐ FILOSOFIA DE AVALIAÇÃO DE TOM (MUITO IMPORTANTE):
- Karaokê é DIVERSÃO, não competição profissional!
- Se a pessoa cantou no tom a MAIOR PARTE do tempo, já merece nota BOA (70+)
- Cantar em uma escala musical coerente é tão válido quanto acertar notas exatas
- O importante é MANTER o tom, não necessariamente acertar cada nota
- Transpor a música (cantar mais grave ou agudo) NÃO é erro, é adaptação válida
- Pequenos desvios são NORMAIS e aceitáveis em karaokê amador

COMO INTERPRETAR OS DADOS (Raciocínio Interno):
1. **Identifique o Gênero:** Rock, Sertanejo, Pop, Axé, Balada?
2. **Coerência de Escala (NOVO!):**
   - Se as notas cantadas estão dentro de uma escala musical (maior, menor, pentatônica), isso é ÓTIMO
   - Coerência de escala ${scaleAnalysis.scaleCoherence}% significa que as notas formam um conjunto harmônico
   - Coerência ≥85% = cantor arrasou no tom = sinta-se à vontade para dar nota entre 90 e 100!
   - Coerência ≥70% = cantor manteve o tom de forma consistente = nota mínima 80
   - Coerência ≥50% = cantor teve boa noção de tom = nota mínima 65
3. **Estabilidade (Pitch Stability):**
   - Em Baladas/Pop Lento: Baixa estabilidade (<50%) pode ser erro de sustentação
   - Em Axé/Rock/Ao Vivo: Baixa estabilidade pode ser energia/vibrato - NÃO penalize!
4. **Precisão (Pitch Accuracy):**
   - >60% já é BOM para karaokê amador!
   - >70% é EXCELENTE
   - Entre 40-60% é aceitável
5. **IMPORTANTE - Letra (Lyrics Score):**
   - O SCORE BASE de letra já foi calculado: ${lyricsBaseScore.toFixed(0)}/100
   - Você pode ajustar até ±30 pontos se achar que a performance compensou

TOM DE VOZ:
- Seja ENCORAJADOR e positivo
- Use gírias leves ("Soltou a voz", "Mandou bem", "Segurou o tom")
- Aponte onde melhorar de forma GENTIL e construtiva
- NUNCA mencione "JSON", "frequência", "algoritmo", "Hz" ou porcentagens

OUTPUT:
Retorne APENAS um JSON válido com EXATAMENTE esta estrutura:
{
  "overallScore": <número de 0 a 100>,
  "dimensions": {
    "pitch": {
      "score": <número de 0 a 100 - lembre: seja generoso se cantou no tom a maior parte!>,
      "detail": "<comentário POSITIVO sobre afinação e tom>"
    },
    "lyrics": {
      "score": <número próximo ao score base ${lyricsBaseScore.toFixed(0)}, ajuste ±10 máximo>,
      "detail": "<comentário sobre letra e dicção>"
    },
    "energy": {
      "score": <número de 0 a 100>,
      "detail": "<comentário sobre energia e interpretação>"
    }
  },
  "encouragement": "<mensagem motivacional POSITIVA e encorajadora>"
}`;

  // 2. CONSTRUÇÃO DO CONTEXTO TÉCNICO (Sem julgamento prévio, apenas dados)
  let technicalContext = '[Sem dados de áudio, avalie apenas pela letra]';

  if (pitchStats && pitchStats.validSamples > 0) {
    const presencePct = Math.round((pitchStats.validSamples / pitchStats.totalSamples) * 100);
    const chorusText = pitchStats.chorusDetected ? 'Sim (Público/Backing vocals detectados)' : 'Não';

    // Monta informação de escala
    const scaleInfo = scaleAnalysis.bestScale
      ? `${scaleAnalysis.bestScale.tonic} ${scaleAnalysis.bestScale.type} (${scaleAnalysis.scaleCoherence}% coerência)`
      : 'Não identificada';

    technicalContext = `
[DADOS DOS SENSORES - Use isso para calibrar sua avaliação]
- Precisão Melódica (Accuracy): ${Math.round(pitchStats.pitchAccuracy)}% (Quão bem acertou as notas)
- Estabilidade da Nota (Stability): ${Math.round(pitchStats.pitchStability)}% (Vibrato reduz mas é bom!)
- Presença Vocal: ${presencePct}% do tempo da música
- Coro Detectado: ${chorusText}
- Notas cantadas: ${pitchStats.notesDetected.length} notas diferentes

[ANÁLISE DE ESCALA MUSICAL - IMPORTANTE!]
- Escala detectada: ${scaleInfo}
- Coerência tonal: ${scaleAnalysis.scaleCoherence}%
- Interpretação: ${scaleAnalysis.analysis}
- LEMBRE-SE: Se a coerência for excelente (≥85%), dê nota de 90 a 100 para pitch!
    `;
  }

  // Contexto de cobertura de letra
  const lyricsContext = `
[ANÁLISE DE LETRA - IMPORTANTE]
- Palavras detectadas: ${lyricsCoverage.wordCount}
- Palavras esperadas (baseado na duração): ~${lyricsCoverage.expectedWords}
- Cobertura calculada: ${lyricsCoverage.coverage.toFixed(1)}%
- Score base de letra: ${lyricsBaseScore.toFixed(0)}/100
- Análise: ${lyricsCoverage.analysis}
`;

  const userPrompt = `
# DADOS DA PERFORMANCE
**Música:** "${songTitle}" - ${artist}
**Idioma:** ${language === 'pt-BR' ? 'Português' : 'Estrangeiro'}
**Duração da música:** ${songDuration || '~3:00'}

**Transcrição (O que o cantor disse):**
"${transcription || '(silêncio/apenas instrumental)'}"

${lyricsContext}

${technicalContext}

Gere o JSON de avaliação agora. Lembre-se: o score de letra deve ser próximo a ${lyricsBaseScore.toFixed(0)} (±10 pontos).`;

  try {
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', // Claude Sonnet 4 (lançado em maio 2025)
      max_tokens: 1024,
      temperature: 0.7, // Um pouco de criatividade para os comentários
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
        // TRUQUE DO PREFILL: Força o modelo a começar com JSON
        { role: 'assistant', content: '{' }
      ],
    });

    // 3. PARSING SEGURO
    const contentBlock = response.content[0];
    const rawText = contentBlock.type === 'text' ? contentBlock.text : '';

    console.log('🤖 Resposta bruta do Claude:', rawText.substring(0, 200) + '...');

    // Reconstrói o JSON completo
    const jsonStr = `{${rawText}`;

    // Limpeza extra de segurança (caso o modelo ignore o prefill e mande markdown)
    const cleanJsonStr = jsonStr.replace(/```json\n?|```/g, '').trim();

    // Parse do JSON com múltiplas estratégias
    let parsedData;
    try {
        parsedData = JSON.parse(cleanJsonStr);
    } catch (e) {
        console.error('❌ Erro ao parsear JSON. String recebida:', cleanJsonStr.substring(0, 200));
        // Fallback: Tenta encontrar o primeiro JSON válido na string se a limpeza falhou
        const match = cleanJsonStr.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                parsedData = JSON.parse(match[0]);
            } catch (e2) {
                throw new Error(`Falha ao parsear JSON da IA: ${cleanJsonStr.substring(0, 100)}...`);
            }
        } else {
            throw new Error(`Nenhum JSON encontrado na resposta: ${cleanJsonStr.substring(0, 100)}...`);
        }
    }

    console.log('✅ JSON parseado com sucesso:', JSON.stringify(parsedData).substring(0, 100) + '...');

    // 4. VALIDAÇÃO COM ZOD (Garante a tipagem)
    const evaluation = EvaluationSchema.parse(parsedData);

    // 5. AJUSTE FINAL: Garante que o score de letra está dentro do range esperado
    const finalLyricsScore = Math.max(
      lyricsBaseScore - 30,
      Math.min(lyricsBaseScore + 30, evaluation.dimensions.lyrics.score)
    );

    if (Math.abs(evaluation.dimensions.lyrics.score - lyricsBaseScore) > 30) {
      console.log(`⚠️ Ajustando score de letra: ${evaluation.dimensions.lyrics.score} -> ${finalLyricsScore} (base: ${lyricsBaseScore.toFixed(0)})`);
      evaluation.dimensions.lyrics.score = Math.round(finalLyricsScore);
    }

    // Recalcula overall score com pesos (tom tem mais peso)
    const weightedScore =
      evaluation.dimensions.pitch.score * DIMENSION_WEIGHTS.pitch +
      evaluation.dimensions.lyrics.score * DIMENSION_WEIGHTS.lyrics +
      evaluation.dimensions.energy.score * DIMENSION_WEIGHTS.energy;
    evaluation.overallScore = Math.round(weightedScore);

    return evaluation as PerformanceEvaluation;

  } catch (error) {
    console.error('Erro ao avaliar com Claude:', error);
    // Retornar avaliação padrão segura em caso de falha na API ou Parsing
    return createDefaultEvaluation(transcription, lyricsCoverage.coverage, lyricsBaseScore, scaleAnalysis.scaleCoherence);
  }
}

// --- FALLBACK EM CASO DE ERRO ---

function createDefaultEvaluation(
  transcription: string,
  lyricsCoverage: number,
  lyricsBaseScore: number,
  scaleCoherence: number = 50
): PerformanceEvaluation {
  const wordCount = (transcription || '').split(' ').filter(w => w.trim()).length;
  const hasContent = wordCount > 5;

  // Usa o score base calculado para lyrics
  const lyricsScore = Math.round(lyricsBaseScore);

  // Calcula pitch score MAIS GENEROSO usando coerência de escala
  // Se cantou no tom (coerência alta), dá nota boa!
  let pitchScore: number;
  if (scaleCoherence >= 70) {
    pitchScore = Math.round(75 + (scaleCoherence - 70) * 0.5); // 75-90
  } else if (scaleCoherence >= 50) {
    pitchScore = Math.round(65 + (scaleCoherence - 50) * 0.5); // 65-75
  } else if (hasContent) {
    pitchScore = Math.round(50 + scaleCoherence * 0.3); // 50-65
  } else {
    pitchScore = 40;
  }

  const energyScore = hasContent ? Math.round(65 + lyricsCoverage * 0.25) : 45;

  // Calcula score geral com pesos
  const weightedScore =
    pitchScore * DIMENSION_WEIGHTS.pitch +
    lyricsScore * DIMENSION_WEIGHTS.lyrics +
    energyScore * DIMENSION_WEIGHTS.energy;

  // Mensagens de pitch baseadas na coerência de escala (mais generosas!)
  let pitchDetail: string;
  if (scaleCoherence >= 70) {
    pitchDetail = 'Mandou bem no tom! Você manteve a afinação de forma consistente.';
  } else if (scaleCoherence >= 50) {
    pitchDetail = 'Boa afinação! Você segurou o tom na maior parte da música.';
  } else if (hasContent) {
    pitchDetail = 'Você cantou com vontade! Continue praticando que a afinação vem.';
  } else {
    pitchDetail = 'Solte mais a voz! O karaokê é seu momento de brilhar.';
  }

  return {
    overallScore: Math.round(weightedScore),
    dimensions: {
      pitch: {
        score: pitchScore,
        detail: pitchDetail,
      },
      lyrics: {
        score: lyricsScore,
        detail: lyricsCoverage >= 70
          ? 'Você acompanhou bem a letra da música!'
          : lyricsCoverage >= 40
          ? 'Você acompanhou parte da letra. Tente cantar mais trechos!'
          : 'Tente acompanhar mais a letra na próxima!',
      },
      energy: {
        score: energyScore,
        detail: hasContent
          ? 'Boa energia! O importante é se divertir.'
          : 'Solte a voz! O karaokê é seu momento de brilhar.',
      },
    },
    encouragement: scaleCoherence >= 60
      ? 'Muito bem! Você manteve o tom e arrasou! Continue assim! 🎤'
      : lyricsCoverage >= 50
      ? 'Você está no caminho certo! Continue cantando que cada vez fica melhor. 🎤'
      : 'Continue praticando! O karaokê é sobre se divertir! 🌟',
  };
}

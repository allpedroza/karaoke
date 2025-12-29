import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// --- CONFIGURAÇÃO E VALIDAÇÃO (ZOD) ---

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

  // Estimativa: ~35 palavras por minuto em média para karaokê
  // (considera pausas instrumentais, introduções, etc)
  const expectedWords = Math.round(durationMinutes * 35);

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

  console.log(`📝 Análise de Letra: ${lyricsCoverage.wordCount} palavras detectadas, esperado ~${lyricsCoverage.expectedWords} (${lyricsCoverage.coverage.toFixed(1)}% cobertura, score base: ${lyricsBaseScore.toFixed(0)})`);

  // 1. SYSTEM PROMPT OTIMIZADO: Focado em interpretação de contexto musical
  const systemPrompt = `Você é o "KaraokeAI", um jurado de karaokê experiente, carismático e técnico.

SUA MISSÃO:
Avaliar a performance cruzando os DADOS TÉCNICOS fornecidos com o GÊNERO MUSICAL da canção "${songTitle}" de "${artist}".

COMO INTERPRETAR OS DADOS (Raciocínio Interno):
1. **Identifique o Gênero:** Antes de dar a nota, lembre-se do estilo original (Rock, Sertanejo, Pop, Axé, Balada?).
2. **Analise a Estabilidade (Pitch Stability):**
   - Em Baladas/Pop Lento: Baixa estabilidade (<50%) geralmente é erro de sustentação.
   - Em Axé/Rock/Ao Vivo: Baixa estabilidade pode ser energia, "rasgado" ou vibrato. Se a precisão for boa, NÃO penalize a estabilidade baixa.
3. **Analise a Precisão (Pitch Accuracy):**
   - >70% é excelente. Entre 50-70% é aceitável para amadores.
   - Esta métrica já considera transposição (o usuário pode cantar em outra oitava).
4. **IMPORTANTE - Letra (Lyrics Score):**
   - O SCORE BASE de letra já foi calculado automaticamente: ${lyricsBaseScore.toFixed(0)}/100
   - Este score é baseado na quantidade de palavras cantadas vs esperado para a duração da música
   - Você pode ajustar ±10 pontos baseado na dicção e qualidade, mas RESPEITE o score base
   - Se o score base é baixo (<50), a pessoa cantou pouco - NÃO dê nota alta de letra
   - "Yeah", "Uhu", "Ah", "Ei" são sinais de animação, não erros de letra.

TOM DE VOZ:
- Use gírias leves de música ("Soltou a voz", "Mandou bem", "Segurou o tom").
- Seja encorajador, mas aponte onde melhorar sem ser técnico demais.
- NUNCA mencione "JSON", "frequência", "algoritmo", "Hz" ou porcentagens no texto final.

OUTPUT:
Retorne APENAS um JSON válido com EXATAMENTE esta estrutura:
{
  "overallScore": <número de 0 a 100>,
  "dimensions": {
    "pitch": {
      "score": <número de 0 a 100>,
      "detail": "<comentário sobre afinação e tom>"
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
  "encouragement": "<mensagem motivacional geral>"
}`;

  // 2. CONSTRUÇÃO DO CONTEXTO TÉCNICO (Sem julgamento prévio, apenas dados)
  let technicalContext = '[Sem dados de áudio, avalie apenas pela letra]';

  if (pitchStats && pitchStats.validSamples > 0) {
    const presencePct = Math.round((pitchStats.validSamples / pitchStats.totalSamples) * 100);
    const chorusText = pitchStats.chorusDetected ? 'Sim (Público/Backing vocals detectados)' : 'Não';

    technicalContext = `
[DADOS DOS SENSORES - Use isso para calibrar sua avaliação]
- Precisão Melódica (Accuracy): ${Math.round(pitchStats.pitchAccuracy)}% (Quão bem ele acertou as notas alvo)
- Estabilidade da Nota (Stability): ${Math.round(pitchStats.pitchStability)}% (Quão "reta" foi a sustentação. Lembre-se: Vibrato reduz estabilidade mas é bom!)
- Presença Vocal: ${presencePct}% do tempo da música
- Coro Detectado: ${chorusText}
- Notas alcançadas: ${pitchStats.notesDetected.length} notas diferentes
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
      lyricsBaseScore - 15,
      Math.min(lyricsBaseScore + 15, evaluation.dimensions.lyrics.score)
    );

    if (Math.abs(evaluation.dimensions.lyrics.score - lyricsBaseScore) > 15) {
      console.log(`⚠️ Ajustando score de letra: ${evaluation.dimensions.lyrics.score} -> ${finalLyricsScore} (base: ${lyricsBaseScore.toFixed(0)})`);
      evaluation.dimensions.lyrics.score = Math.round(finalLyricsScore);
    }

    // Recalcula overall score com o lyrics ajustado
    const avgScore = (evaluation.dimensions.pitch.score + evaluation.dimensions.lyrics.score + evaluation.dimensions.energy.score) / 3;
    evaluation.overallScore = Math.round(avgScore);

    return evaluation as PerformanceEvaluation;

  } catch (error) {
    console.error('Erro ao avaliar com Claude:', error);
    // Retornar avaliação padrão segura em caso de falha na API ou Parsing
    return createDefaultEvaluation(transcription, lyricsCoverage.coverage, lyricsBaseScore);
  }
}

// --- FALLBACK EM CASO DE ERRO ---

function createDefaultEvaluation(
  transcription: string,
  lyricsCoverage: number,
  lyricsBaseScore: number
): PerformanceEvaluation {
  const wordCount = (transcription || '').split(' ').filter(w => w.trim()).length;
  const hasContent = wordCount > 5;

  // Usa o score base calculado para lyrics
  const lyricsScore = Math.round(lyricsBaseScore);

  // Calcula outros scores baseado na cobertura também
  const pitchScore = hasContent ? Math.round(55 + lyricsCoverage * 0.35) : 30;
  const energyScore = hasContent ? Math.round(60 + lyricsCoverage * 0.3) : 35;

  return {
    overallScore: Math.round((pitchScore + lyricsScore + energyScore) / 3),
    dimensions: {
      pitch: {
        score: pitchScore,
        detail: hasContent
          ? 'Você cantou com desenvoltura! Continue praticando para refinar a afinação.'
          : 'Parece que você cantou bem baixinho. Solte mais a voz!',
      },
      lyrics: {
        score: lyricsScore,
        detail: lyricsCoverage >= 70
          ? 'Você acompanhou bem a letra da música!'
          : lyricsCoverage >= 40
          ? 'Você acompanhou parte da letra. Tente cantar mais trechos!'
          : 'Parece que você não acompanhou muito a letra. Tente cantar junto na próxima!',
      },
      energy: {
        score: energyScore,
        detail: hasContent
          ? 'Boa energia! O importante é se divertir.'
          : 'Solte a voz! O karaokê é seu momento de brilhar.',
      },
    },
    encouragement: lyricsCoverage >= 50
      ? 'Você está no caminho certo! Continue cantando e cada vez ficará melhor. 🎤'
      : 'Não desista! Cante mais alto e acompanhe a letra. Estamos torcendo por você! 🌟',
  };
}

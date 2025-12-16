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

// --- FUNÇÃO PRINCIPAL ---

export async function evaluateWithClaude(input: EvaluationInput): Promise<PerformanceEvaluation> {
  const { transcription, songTitle, artist, language, pitchStats } = input;

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
4. **Letra:**
   - "Yeah", "Uhu", "Ah", "Ei" são sinais de animação, não erros de letra.

TOM DE VOZ:
- Use gírias leves de música ("Soltou a voz", "Mandou bem", "Segurou o tom").
- Seja encorajador, mas aponte onde melhorar sem ser técnico demais.
- NUNCA mencione "JSON", "frequência", "algoritmo", "Hz" ou porcentagens no texto final.

OUTPUT:
Retorne APENAS um JSON válido.`;

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

  const userPrompt = `
# DADOS DA PERFORMANCE
**Música:** "${songTitle}" - ${artist}
**Idioma:** ${language === 'pt-BR' ? 'Português' : 'Estrangeiro'}

**Transcrição (O que o cantor disse):**
"${transcription || '(silêncio/apenas instrumental)'}"

${technicalContext}

Gere o JSON de avaliação agora.`;

  try {
    const anthropic = getAnthropicClient();
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest', // Usando a versão mais recente estável
      max_tokens: 1024,
      temperature: 0.7, // Um pouco de criatividade para os comentários
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
        // TRUQUE DO PREFILL: Força o modelo a começar com JSON
        { role: 'assistant', content: '{' } 
      ],
    });

    // 3. PARSING SEGURO COM PREFILL
    // Como injetamos '{', precisamos concatená-lo de volta na resposta
    const contentBlock = response.content[0];
    const rawText = contentBlock.type === 'text' ? contentBlock.text : '';
    
    // Reconstrói o JSON completo
    const jsonStr = `{${rawText}`;
    
    // Limpeza extra de segurança (caso o modelo ignore o prefill e mande markdown)
    const cleanJsonStr = jsonStr.replace(/```json\n?|```/g, '').trim();

    // Parse do JSON
    let parsedData;
    try {
        parsedData = JSON.parse(cleanJsonStr);
    } catch (e) {
        // Fallback: Tenta encontrar o primeiro JSON válido na string se a limpeza falhou
        const match = cleanJsonStr.match(/\{[\s\S]*\}/);
        if (match) {
            parsedData = JSON.parse(match[0]);
        } else {
            throw new Error(`Falha ao parsear JSON da IA: ${cleanJsonStr.substring(0, 50)}...`);
        }
    }

    // 4. VALIDAÇÃO COM ZOD (Garante a tipagem)
    const evaluation = EvaluationSchema.parse(parsedData);

    return evaluation as PerformanceEvaluation;

  } catch (error) {
    console.error('Erro ao avaliar com Claude:', error);
    // Retornar avaliação padrão segura em caso de falha na API ou Parsing
    return createDefaultEvaluation(transcription);
  }
}

// --- FALLBACK EM CASO DE ERRO ---

function createDefaultEvaluation(transcription: string): PerformanceEvaluation {
  const wordCount = (transcription || '').split(' ').filter(w => w.trim()).length;
  const hasContent = wordCount > 5;

  return {
    overallScore: hasContent ? 65 : 30,
    dimensions: {
      pitch: {
        score: hasContent ? 65 : 30,
        detail: hasContent
          ? 'Você cantou com desenvoltura! Continue praticando para refinar a afinação.'
          : 'Parece que você cantou bem baixinho. Solte mais a voz!',
      },
      lyrics: {
        score: hasContent ? 60 : 25,
        detail: hasContent
          ? 'Você acompanhou a música! Com mais prática, vai acertar cada vez mais.'
          : 'Parece que você não acompanhou a letra. Tente cantar junto na próxima!',
      },
      energy: {
        score: hasContent ? 70 : 35,
        detail: hasContent
          ? 'Boa energia! O importante é se divertir.'
          : 'Solte a voz! O karaokê é seu momento de brilhar.',
      },
    },
    encouragement: hasContent
      ? 'Você está no caminho certo! Continue cantando e cada vez ficará melhor. 🎤'
      : 'Não desista! Cante mais alto e acompanhe a letra. Estamos torcendo por você! 🌟',
  };
}

import Anthropic from '@anthropic-ai/sdk';

// Cliente será criado sob demanda para garantir que dotenv já carregou
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

export async function evaluateWithClaude(input: EvaluationInput): Promise<PerformanceEvaluation> {
  const { transcription, songCode, songTitle, artist, language, pitchStats } = input;

  // MUDANÇA 1: Refinamento do System Prompt com conceitos de Teoria Vocal
  const systemPrompt = `Você é um jurado de karaokê experiente, divertido e encorajador. Você está avaliando uma performance ao vivo de karaokê.

REGRAS DE LINGUAGEM - MUITO IMPORTANTE:
- Use linguagem de KARAOKÊ, não técnica. Fale sobre "cantar", "afinação", "voz", "música".
- NUNCA mencione: "transcrição", "reconhecimento de voz", "captado", "detectado", "sistema", "áudio gravado", "frequência Hz", "porcentagem".
- Fale como se você tivesse OUVIDO a pessoa cantando ao vivo.

INTERPRETANDO A AFINAÇÃO (NUANCE É ESSENCIAL):
- **Não seja um robô:** Uma nota não precisa ser uma linha reta perfeita.
- **Vibrato e Estilo:** Se os dados indicarem "muita variação" ou "movimento", isso pode ser VIBRATO ou interpretação emocional (comum em ballads, sertanejo, divas pop). ISSO É BOM!
- **Diferencie:** Só critique a oscilação se ela parecer insegurança ou "tremedeira". Se a precisão for alta mas a estabilidade baixa, elogie o vibrato/estilo!
- **Gênero:** Músicas rápidas pedem notas mais retas. Baladas pedem mais oscilação/emoção.

ONOMATOPEIAS E VOCALIZAÇÕES:
- Palavras como "é", "yeah", "wow", "oh", "ah", "uhu", "ei", "hey", "ô", "uh" são VOCALIZAÇÕES válidas.
- Não penalize o cantor por usar vocalizações - isso faz parte da experiência!

CORO/MÚLTIPLAS VOZES:
- Se houver indicação de coro, celebre! Karaokê é sobre galera.

RESPONDA APENAS com JSON válido.`;

  // MUDANÇA 2: Lógica de construção do contexto de Pitch mais inteligente
  let pitchContext = '';
  if (pitchStats && pitchStats.validSamples > 0) {
    const voicePercentage = Math.round((pitchStats.validSamples / pitchStats.totalSamples) * 100);
    
    // NOVA LÓGICA: Cruzar estabilidade com precisão para definir o "diagnóstico"
    let stabilityDesc = '';
    
    if (pitchStats.pitchStability >= 70) {
        stabilityDesc = 'Notas sustentadas e retas (estilo mais pop/rock ou fala)';
    } else if (pitchStats.pitchStability >= 40) {
        // Se a precisão é alta mas estabilidade média, é provável vibrato controlado
        if (pitchStats.pitchAccuracy > 70) {
            stabilityDesc = 'Voz com movimento e nuances (provável uso de vibrato ou estilo)';
        } else {
            stabilityDesc = 'Alguma oscilação na sustentação';
        }
    } else {
        // Estabilidade muito baixa
        if (pitchStats.pitchAccuracy > 60) {
             stabilityDesc = 'Muitas variações estilísticas (melismas ou vibrato intenso)';
        } else {
             stabilityDesc = 'Voz bastante trêmula ou instável';
        }
    }

    const presenceLevel = voicePercentage >= 60 ? 'forte presença' : voicePercentage >= 30 ? 'presença moderada' : 'pouca presença vocal';
    const chorusInfo = pitchStats.chorusDetected
      ? `\n- CORO DETECTADO: Outras pessoas cantaram junto! (${pitchStats.peakVolumeMoments || 0} momentos)`
      : '';

    pitchContext = `
[DADOS TÉCNICOS INTERNOS - Use para inferir o estilo, NÃO cite números]
- Característica da Afinação: ${stabilityDesc} (Baseado em estabilidade: ${pitchStats.pitchStability}% e Precisão da nota alvo: ${pitchStats.pitchAccuracy}%)
- Presença Vocal: ${presenceLevel}
- Extensão usada: ${pitchStats.notesDetected.length} notas diferentes${chorusInfo}
`;
  }

  const userPrompt = `# Performance de Karaokê para Avaliar

**Música:** "${songTitle}" de ${artist}
**Idioma:** ${language === 'pt-BR' ? 'Português' : language === 'en' ? 'Inglês' : 'Espanhol'}

## O que foi cantado:
"${transcription || '(o cantor não acompanhou a letra)'}"
${pitchContext}
---

## Avalie em 3 dimensões (0-100 cada):

### 1. TOM (Afinação e Estilo)
Avalie a qualidade vocal.
${pitchStats && pitchStats.validSamples > 0
  ? `Considere os dados técnicos: O cantor manteve a afinação? O uso de variações/vibrato combinou com a música "${songTitle}"?`
  : 'Avalie pelo fluxo e clareza do canto.'}

### 2. LETRA (Acompanhamento)
O cantor acompanhou a letra? 
IMPORTANTE: "Yeah", "Uhu", "Oh" são pontos positivos de empolgação, não erros!
${!transcription || transcription.trim().length < 10
  ? 'Parece que o cantor não acompanhou a letra.'
  : 'Verifique a fidelidade à letra original, mas aceite improvisos.'}

### 3. ANIMAÇÃO (Energia)
O cantor demonstrou energia?
${pitchStats && pitchStats.validSamples > 0
  ? `Baseado na presença vocal e momentos de pico.`
  : 'Avalie pela intensidade.'}
${pitchStats?.chorusDetected ? '🎉 BÔNUS: O público cantou junto (Coro detectado)!' : ''}

## Formato de Resposta (JSON):
{
  "overallScore": <0-100>,
  "dimensions": {
    "pitch": {
      "score": <0-100>,
      "detail": "<comentário sobre afinação/estilo>"
    },
    "lyrics": {
      "score": <0-100>,
      "detail": "<comentário sobre a letra>"
    },
    "energy": {
      "score": <0-100>,
      "detail": "<comentário sobre a energia>"
    }
  },
  "encouragement": "<mensagem motivacional>"
}

LEMBRE-SE: Fale sobre a PERFORMANCE de karaokê, não sobre tecnologia. Seja gentil mas honesto.`;

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Resposta inválida da IA');
    }

    // Limpar possíveis marcadores de código
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const evaluation = JSON.parse(jsonText) as PerformanceEvaluation;

    // Validar estrutura
    if (
      typeof evaluation.overallScore !== 'number' ||
      !evaluation.dimensions ||
      !evaluation.dimensions.pitch ||
      !evaluation.dimensions.lyrics ||
      !evaluation.dimensions.energy ||
      !evaluation.encouragement
    ) {
      throw new Error('Estrutura de avaliação inválida');
    }

    // Garantir que scores estão no range 0-100
    evaluation.overallScore = Math.max(0, Math.min(100, Math.round(evaluation.overallScore)));
    evaluation.dimensions.pitch.score = Math.max(0, Math.min(100, Math.round(evaluation.dimensions.pitch.score)));
    evaluation.dimensions.lyrics.score = Math.max(0, Math.min(100, Math.round(evaluation.dimensions.lyrics.score)));
    evaluation.dimensions.energy.score = Math.max(0, Math.min(100, Math.round(evaluation.dimensions.energy.score)));

    return evaluation;
  } catch (error) {
    console.error('Erro ao avaliar com Claude:', error);

    // Retornar avaliação padrão em caso de erro
    return createDefaultEvaluation(transcription);
  }
}

function createDefaultEvaluation(transcription: string): PerformanceEvaluation {
  const wordCount = (transcription || '').split(' ').filter(w => w.trim()).length;
  const hasContent = wordCount > 5;

  return {
    overallScore: hasContent ? 65 : 30,
    dimensions: {
      pitch: {
        score: hasContent ? 65 : 30,
        detail: hasContent
          ? 'Você cantou com desenvoltura! Continue praticando para melhorar ainda mais a afinação.'
          : 'Parece que você cantou bem baixinho. Solte mais a voz!',
      },
      lyrics: {
        score: hasContent ? 60 : 25,
        detail: hasContent
          ? 'Você acompanhou a música! Com mais prática, vai acertar cada vez mais.'
          : 'Parece que você não acompanhou a letra da música. Tente cantar junto!',
      },
      energy: {
        score: hasContent ? 70 : 35,
        detail: hasContent
          ? 'Boa energia! O karaokê é sobre se divertir cantando.'
          : 'Solte a voz! O karaokê é seu momento de brilhar.',
      },
    },
    encouragement: hasContent
      ? 'Você está no caminho certo! Continue cantando e cada vez ficará melhor. 🎤'
      : 'Não desista! Cante mais alto e acompanhe a letra. Estamos torcendo por você! 🌟',
  };
}

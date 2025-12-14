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

  const systemPrompt = `Você é um jurado de karaokê experiente, divertido e encorajador. Você está avaliando uma performance ao vivo de karaokê.

REGRAS DE LINGUAGEM - MUITO IMPORTANTE:
- Use linguagem de KARAOKÊ, não técnica. Fale sobre "cantar", "afinação", "voz", "música".
- NUNCA mencione: "transcrição", "reconhecimento de voz", "captado", "detectado", "sistema", "áudio gravado", "frequência Hz", "porcentagem".
- Fale como se você tivesse OUVIDO a pessoa cantando ao vivo.
- Seja específico sobre a MÚSICA e a PERFORMANCE, não sobre tecnologia.

ONOMATOPEIAS E VOCALIZAÇÕES:
- Palavras como "é", "yeah", "wow", "oh", "ah", "uhu", "ei", "hey", "ô", "uh" são VOCALIZAÇÕES válidas de karaokê.
- Essas expressões demonstram ENTUSIASMO e participação, NÃO são erros de letra.
- Não penalize o cantor por usar vocalizações - isso faz parte da experiência do karaokê!
- Se a pessoa canta "yeah yeah" ou "ô ô ô", ela está participando e se divertindo.

CORO/MÚLTIPLAS VOZES:
- Se foi detectado coro (outras pessoas cantando junto), isso é MUITO POSITIVO para a energia!
- Karaokê que envolve a plateia merece bônus na dimensão de Energia/Animação.
- Mencione positivamente se o cantor conseguiu engajar outras pessoas.

Exemplos de linguagem CORRETA:
- "Você manteve a afinação firme durante o refrão"
- "Parece que você pulou alguns trechos da letra"
- "Você cantou com bastante energia!"
- "A afinação variou um pouco nas notas mais altas"
- "Adorei as vocalizações! Você realmente entrou no clima da música!"
- "A galera cantou junto com você - isso é o espírito do karaokê!"

Exemplos de linguagem INCORRETA (NUNCA USE):
- "A transcrição captou apenas..."
- "O tom apresentou instabilidade de X%..."
- "A voz foi detectada em Y% do tempo..."
- "As notas variaram entre D2 e F#3..."

RESPONDA APENAS com JSON válido, sem texto adicional.`;

  // Construir contexto de pitch para o modelo (interno, não mostrado ao usuário)
  let pitchContext = '';
  if (pitchStats && pitchStats.validSamples > 0) {
    const voicePercentage = Math.round((pitchStats.validSamples / pitchStats.totalSamples) * 100);
    const stabilityLevel = pitchStats.pitchStability >= 70 ? 'estável' : pitchStats.pitchStability >= 40 ? 'moderada' : 'instável';
    const presenceLevel = voicePercentage >= 60 ? 'forte presença' : voicePercentage >= 30 ? 'presença moderada' : 'pouca presença vocal';
    const chorusInfo = pitchStats.chorusDetected
      ? `\n- CORO DETECTADO: Outras pessoas cantaram junto! Isso merece BÔNUS na energia! (${pitchStats.peakVolumeMoments || 0} momentos de coro)`
      : '';

    pitchContext = `
[DADOS INTERNOS - Use para avaliar, mas NÃO mencione números/percentuais na resposta]
- Afinação: ${stabilityLevel} (${pitchStats.pitchStability}% estabilidade, ${pitchStats.pitchAccuracy}% precisão)
- Presença: ${presenceLevel} (${voicePercentage}% do tempo cantando)
- Extensão vocal usada: ${pitchStats.notesDetected.length} notas diferentes${chorusInfo}
`;
  }

  const userPrompt = `# Performance de Karaokê para Avaliar

**Música:** "${songTitle}" de ${artist}
**Idioma:** ${language === 'pt-BR' ? 'Português' : language === 'en' ? 'Inglês' : 'Espanhol'}

## O que o cantor cantou:
"${transcription || '(o cantor não acompanhou a letra)'}"
${pitchContext}
---

## Avalie em 3 dimensões (0-100 cada):

### 1. TOM (Afinação)
Avalie se o cantor manteve a afinação correta durante a música.
${pitchStats && pitchStats.validSamples > 0
  ? `A afinação foi ${pitchStats.pitchStability >= 70 ? 'bem consistente' : pitchStats.pitchStability >= 40 ? 'razoável' : 'bastante variável'}.`
  : 'Avalie pelo fluxo e clareza do canto.'}

### 2. LETRA (Acompanhamento)
O cantor acompanhou a letra de "${songTitle}"? Compare o que foi cantado com a letra original que você conhece.
IMPORTANTE: Onomatopeias como "é", "yeah", "wow", "oh", "ah", "uhu", "hey" são VOCALIZAÇÕES VÁLIDAS, não erros!
${!transcription || transcription.trim().length < 10
  ? 'Parece que o cantor não acompanhou a letra da música.'
  : 'Verifique se as palavras cantadas correspondem à letra original. Vocalizações são bem-vindas!'}

### 3. ANIMAÇÃO (Energia e Presença)
O cantor demonstrou energia e presença ao cantar?
${pitchStats && pitchStats.validSamples > 0
  ? `O cantor teve ${Math.round((pitchStats.validSamples / pitchStats.totalSamples) * 100) >= 50 ? 'boa presença' : 'presença tímida'} durante a música.`
  : 'Avalie pela intensidade e emoção nas palavras.'}
${pitchStats?.chorusDetected ? '🎉 BÔNUS: Foi detectado CORO! Outras pessoas cantaram junto - isso demonstra que o cantor engajou a plateia!' : ''}

## Formato de Resposta (JSON):

{
  "overallScore": <0-100>,
  "dimensions": {
    "pitch": {
      "score": <0-100>,
      "detail": "<frase curta sobre a afinação, ex: 'Você manteve bem o tom!' ou 'A afinação oscilou um pouco nas partes mais difíceis'>"
    },
    "lyrics": {
      "score": <0-100>,
      "detail": "<frase sobre o acompanhamento da letra, ex: 'Você cantou junto certinho!' ou 'Parece que você não acompanhou a letra da música'>"
    },
    "energy": {
      "score": <0-100>,
      "detail": "<frase sobre energia, ex: 'Cantou com empolgação!' ou 'Pode soltar mais a voz, o karaokê é seu!'>"
    }
  },
  "encouragement": "<mensagem motivacional curta e específica>"
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

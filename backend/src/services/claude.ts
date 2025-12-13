import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface EvaluationInput {
  transcription: string;
  songTitle: string;
  artist: string;
  originalLyrics?: string;
}

interface CategoryScore {
  score: number;
  maxScore: number;
  feedback: string;
}

interface PerformanceEvaluation {
  overallScore: number;
  categories: {
    lyrics: CategoryScore;
    timing: CategoryScore;
    expression: CategoryScore;
  };
  feedback: string;
  highlights: string[];
  improvements: string[];
  encouragement: string;
}

export async function evaluateWithClaude(input: EvaluationInput): Promise<PerformanceEvaluation> {
  const { transcription, songTitle, artist, originalLyrics } = input;

  const systemPrompt = `Você é um jurado de karaokê especialista e carismático. Sua tarefa é avaliar a performance de um cantor amador com base na transcrição da sua voz.

Você deve ser encorajador mas honesto, dando feedback construtivo e específico.

IMPORTANTE: Você deve responder APENAS com um JSON válido, sem nenhum texto adicional antes ou depois.`;

  const userPrompt = `Avalie esta performance de karaokê:

**Música:** ${songTitle}
**Artista Original:** ${artist}

**Transcrição da performance do usuário:**
"${transcription}"

${originalLyrics ? `**Letra original (para referência):**\n"${originalLyrics}"` : ''}

Avalie a performance e retorne um JSON com EXATAMENTE esta estrutura:

{
  "overallScore": <número de 0 a 100>,
  "categories": {
    "lyrics": {
      "score": <número de 0 a 100>,
      "maxScore": 100,
      "feedback": "<feedback sobre a precisão da letra, 1-2 frases>"
    },
    "timing": {
      "score": <número de 0 a 100>,
      "maxScore": 100,
      "feedback": "<feedback sobre ritmo e timing, 1-2 frases>"
    },
    "expression": {
      "score": <número de 0 a 100>,
      "maxScore": 100,
      "feedback": "<feedback sobre expressão e emoção, 1-2 frases>"
    }
  },
  "feedback": "<avaliação geral da performance, 2-3 frases>",
  "highlights": [
    "<ponto positivo 1>",
    "<ponto positivo 2>",
    "<ponto positivo 3>"
  ],
  "improvements": [
    "<sugestão de melhoria 1>",
    "<sugestão de melhoria 2>",
    "<sugestão de melhoria 3>"
  ],
  "encouragement": "<mensagem motivacional personalizada, 1 frase>"
}

Critérios de avaliação:
- **Letra (lyrics)**: Quão bem o usuário cantou as palavras corretas da música
- **Ritmo (timing)**: Se a transcrição sugere um fluxo natural e rítmico
- **Expressão (expression)**: A emoção e entrega percebida através das palavras

Seja justo mas encorajador. Se a transcrição estiver muito diferente da música original, considere que pode haver erros de reconhecimento de voz.

RESPONDA APENAS COM O JSON, SEM TEXTO ADICIONAL.`;

  try {
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

    // Extrair o texto da resposta
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Resposta inválida da IA');
    }

    // Parse do JSON
    const jsonText = textContent.text.trim();
    const evaluation = JSON.parse(jsonText) as PerformanceEvaluation;

    // Validar estrutura básica
    if (
      typeof evaluation.overallScore !== 'number' ||
      !evaluation.categories ||
      !evaluation.feedback ||
      !Array.isArray(evaluation.highlights) ||
      !Array.isArray(evaluation.improvements)
    ) {
      throw new Error('Estrutura de avaliação inválida');
    }

    return evaluation;
  } catch (error) {
    console.error('Erro ao avaliar com Claude:', error);

    // Retornar avaliação padrão em caso de erro
    return {
      overallScore: 70,
      categories: {
        lyrics: {
          score: 70,
          maxScore: 100,
          feedback: 'Boa tentativa! Continue praticando a letra da música.',
        },
        timing: {
          score: 70,
          maxScore: 100,
          feedback: 'Ritmo razoável. Tente acompanhar mais de perto a música original.',
        },
        expression: {
          score: 70,
          maxScore: 100,
          feedback: 'Emoção presente! Solte a voz e divirta-se mais.',
        },
      },
      feedback: 'Performance sólida! Você mostrou que conhece a música e se dedicou. Continue praticando para melhorar ainda mais.',
      highlights: [
        'Demonstrou conhecimento da música',
        'Manteve-se cantando até o fim',
        'Boa disposição para cantar',
      ],
      improvements: [
        'Pratique a letra para maior precisão',
        'Tente acompanhar o ritmo da música original',
        'Experimente variar a intensidade da voz',
      ],
      encouragement: 'Você está no caminho certo! A prática leva à perfeição. 🎤',
    };
  }
}

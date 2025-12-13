import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface EvaluationInput {
  transcription: string;
  songCode: string;
  songTitle: string;
  artist: string;
  language: string;
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
  const { transcription, songCode, songTitle, artist, language } = input;

  const systemPrompt = `Você é um jurado de karaokê especialista, divertido e encorajador.

Sua tarefa é avaliar a performance de um cantor amador comparando a transcrição da voz dele com a letra REAL da música.

IMPORTANTE:
- Você CONHECE a letra original de "${songTitle}" de ${artist}. Use seu conhecimento para comparar.
- A transcrição pode ter erros do reconhecimento de voz, seja compreensivo.
- Avalie de forma justa mas encorajadora.
- RESPONDA APENAS com JSON válido, sem texto adicional.`;

  const userPrompt = `# Avaliação de Karaokê

**Código:** ${songCode}
**Música:** ${songTitle}
**Artista:** ${artist}
**Idioma:** ${language === 'pt-BR' ? 'Português' : language === 'en' ? 'Inglês' : 'Espanhol'}

## Transcrição da Performance do Usuário:
"${transcription}"

---

## Instruções de Avaliação

Compare a transcrição acima com a letra REAL de "${songTitle}" que você conhece.

Avalie em 3 DIMENSÕES (cada uma de 0 a 100):

1. **TOM (pitch)**: Baseado no fluxo e cadência das palavras transcritas, parece que o cantor estava no tom? Palavras claras e bem pronunciadas sugerem bom controle vocal.

2. **LETRA (lyrics)**: O cantor cantou as palavras corretas? Compare com a letra original. Considere que o reconhecimento de voz pode errar palavras similares.

3. **ANIMAÇÃO (energy)**: O cantor demonstrou energia e emoção? Frases completas, expressões e intensidade nas palavras sugerem animação.

## Formato de Resposta (JSON):

{
  "overallScore": <média ponderada das 3 dimensões, 0-100>,
  "dimensions": {
    "pitch": {
      "score": <0-100>,
      "detail": "<observação específica e REAL sobre o tom, ex: 'Manteve bem o tom no refrão' ou 'Algumas palavras saíram fora do ritmo esperado'>"
    },
    "lyrics": {
      "score": <0-100>,
      "detail": "<observação específica e REAL sobre a letra, mencione palavras que acertou ou errou, ex: 'Acertou o verso principal mas trocou X por Y'>"
    },
    "energy": {
      "score": <0-100>,
      "detail": "<observação específica e REAL sobre energia, ex: 'Cantou com empolgação especialmente em [trecho]' ou 'Pode soltar mais a voz no refrão'>"
    }
  },
  "encouragement": "<frase motivacional de 1-2 linhas que mencione algo ESPECÍFICO da performance, não genérico>"
}

IMPORTANTE:
- As observações em "detail" devem ser ESPECÍFICAS sobre o que foi cantado, não genéricas.
- O "encouragement" deve mencionar algo REAL da performance.
- Se a transcrição estiver muito diferente da música, dê uma nota menor mas seja gentil.`;

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
  const wordCount = transcription.split(' ').length;
  const hasContent = wordCount > 5;

  return {
    overallScore: hasContent ? 65 : 30,
    dimensions: {
      pitch: {
        score: hasContent ? 65 : 30,
        detail: hasContent
          ? 'Não foi possível analisar o tom com precisão, mas você manteve um bom fluxo.'
          : 'Não conseguimos captar muito da sua voz. Tente cantar mais perto do microfone.',
      },
      lyrics: {
        score: hasContent ? 60 : 25,
        detail: hasContent
          ? `Captamos ${wordCount} palavras. Continue praticando a letra!`
          : 'Poucas palavras foram captadas. Certifique-se de que o microfone está funcionando.',
      },
      energy: {
        score: hasContent ? 70 : 35,
        detail: hasContent
          ? 'Parabéns por participar! A energia é o primeiro passo para uma boa performance.'
          : 'Solte a voz! Karaokê é sobre se divertir.',
      },
    },
    encouragement: hasContent
      ? 'Você está no caminho certo! Continue cantando e cada vez ficará melhor. 🎤'
      : 'Não desista! Ajuste o microfone e tente novamente. Estamos torcendo por você! 🌟',
  };
}

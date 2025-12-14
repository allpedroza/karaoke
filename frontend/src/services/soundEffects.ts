// Serviço de efeitos sonoros usando Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Rufar de tambores (drum roll)
export async function playDrumRoll(durationMs: number = 3000): Promise<void> {
  const ctx = getAudioContext();
  const duration = durationMs / 1000;

  // Criar ruído para simular drum roll
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Gerar padrão de drum roll com crescendo
  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const progress = t / duration;

    // Frequência aumenta com o tempo (crescendo)
    const rollFrequency = 15 + progress * 25; // 15-40 Hz roll
    const rollPattern = Math.sin(2 * Math.PI * rollFrequency * t);

    // Envelope: cresce ao longo do tempo
    const envelope = 0.3 + progress * 0.7;

    // Ruído filtrado para som de tambor
    const noise = (Math.random() * 2 - 1) * 0.5;
    const drumTone = Math.sin(2 * Math.PI * 100 * t) * 0.3;

    data[i] = (noise * 0.6 + drumTone * 0.4) * envelope * (0.5 + Math.abs(rollPattern) * 0.5);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Filtro passa-baixa para som mais natural
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.4;

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start();

  return new Promise(resolve => {
    setTimeout(resolve, durationMs);
  });
}

// Aplausos (com variação de intensidade)
export async function playApplause(intensity: 'high' | 'medium' | 'low', durationMs: number = 4000): Promise<void> {
  const ctx = getAudioContext();
  const duration = durationMs / 1000;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate); // Stereo
  const leftData = buffer.getChannelData(0);
  const rightData = buffer.getChannelData(1);

  // Número de "palmas" por segundo baseado na intensidade
  const clapRate = intensity === 'high' ? 25 : intensity === 'medium' ? 15 : 8;
  const volume = intensity === 'high' ? 0.6 : intensity === 'medium' ? 0.4 : 0.25;

  // Gerar múltiplas camadas de aplausos
  const numLayers = intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3;

  for (let layer = 0; layer < numLayers; layer++) {
    const layerOffset = Math.random() * 0.1; // Pequeno offset temporal
    const layerPan = (Math.random() - 0.5) * 2; // Pan stereo

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate + layerOffset;
      const progress = t / duration;

      // Envelope natural: sobe, sustenta, desce
      let envelope = 1;
      if (progress < 0.1) {
        envelope = progress / 0.1;
      } else if (progress > 0.7) {
        envelope = (1 - progress) / 0.3;
      }

      // Padrão de palmas aleatórias
      const clapPhase = (t * clapRate + layer * 0.37) % 1;
      const isClapping = clapPhase < 0.15;

      if (isClapping) {
        const clapDecay = Math.exp(-clapPhase * 30);
        const noise = (Math.random() * 2 - 1) * clapDecay;

        const leftGain = 0.5 + layerPan * 0.5;
        const rightGain = 0.5 - layerPan * 0.5;

        leftData[i] += noise * envelope * volume * leftGain / numLayers;
        rightData[i] += noise * envelope * volume * rightGain / numLayers;
      }
    }
  }

  // Adicionar "woohoo" ocasionais para aplausos intensos
  if (intensity === 'high') {
    for (let w = 0; w < 3; w++) {
      const woohooTime = 0.5 + Math.random() * 2;
      const woohooStart = Math.floor(woohooTime * ctx.sampleRate);
      const woohooDuration = 0.3 * ctx.sampleRate;

      for (let i = 0; i < woohooDuration && woohooStart + i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const freq = 400 + Math.sin(t * 10) * 100; // Frequência variável
        const env = Math.sin(Math.PI * i / woohooDuration) * 0.15;
        const sample = Math.sin(2 * Math.PI * freq * t) * env;

        leftData[woohooStart + i] += sample * (0.3 + Math.random() * 0.4);
        rightData[woohooStart + i] += sample * (0.3 + Math.random() * 0.4);
      }
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 200;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 1;

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start();

  return new Promise(resolve => {
    setTimeout(resolve, durationMs);
  });
}

// Vaias
export async function playBoos(durationMs: number = 3000): Promise<void> {
  const ctx = getAudioContext();
  const duration = durationMs / 1000;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  const leftData = buffer.getChannelData(0);
  const rightData = buffer.getChannelData(1);

  // Múltiplas vozes fazendo "buuuu"
  const numVoices = 5;

  for (let voice = 0; voice < numVoices; voice++) {
    const baseFreq = 150 + Math.random() * 50; // Frequência base variável
    const voiceOffset = Math.random() * 0.2;
    const pan = (Math.random() - 0.5) * 1.5;

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate + voiceOffset;
      const progress = t / duration;

      // Envelope com fade in/out
      let envelope = 1;
      if (progress < 0.15) {
        envelope = progress / 0.15;
      } else if (progress > 0.8) {
        envelope = (1 - progress) / 0.2;
      }

      // Frequência descendente para som de "buuuu"
      const freq = baseFreq * (1 - progress * 0.2);

      // Ondas harmônicas para som de voz
      const fundamental = Math.sin(2 * Math.PI * freq * t);
      const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.5;
      const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.25;

      // Modulação para som mais natural
      const vibrato = 1 + Math.sin(2 * Math.PI * 5 * t) * 0.02;

      const sample = (fundamental + harmonic2 + harmonic3) * envelope * 0.15 * vibrato / numVoices;

      const leftGain = 0.5 + pan * 0.3;
      const rightGain = 0.5 - pan * 0.3;

      leftData[i] += sample * leftGain;
      rightData[i] += sample * rightGain;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0.5;

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start();

  return new Promise(resolve => {
    setTimeout(resolve, durationMs);
  });
}

// Som de "womp womp womp" (fracasso)
export async function playWompWomp(): Promise<void> {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;

  // Três "womps" descendentes
  oscillator.frequency.setValueAtTime(300, now);
  oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.3);

  oscillator.frequency.setValueAtTime(250, now + 0.5);
  oscillator.frequency.exponentialRampToValueAtTime(125, now + 0.8);

  oscillator.frequency.setValueAtTime(200, now + 1.0);
  oscillator.frequency.exponentialRampToValueAtTime(80, now + 1.5);

  // Envelope de volume
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(0.1, now + 0.3);

  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.55);
  gainNode.gain.linearRampToValueAtTime(0.08, now + 0.8);

  gainNode.gain.linearRampToValueAtTime(0.2, now + 1.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

  oscillator.start(now);
  oscillator.stop(now + 2);

  return new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
}

// Função principal para tocar som baseado no score
export async function playScoreSound(score: number): Promise<void> {
  if (score >= 80) {
    await playApplause('high', 5000);
  } else if (score >= 60) {
    await playApplause('medium', 3500);
  } else if (score >= 50) {
    await playBoos(2500);
  } else {
    await playWompWomp();
  }
}

// Parar todos os sons
export function stopAllSounds(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

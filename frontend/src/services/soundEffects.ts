// Serviço de efeitos sonoros
// Usa arquivos de áudio se disponíveis, senão gera sons via Web Audio API

let audioContext: AudioContext | null = null;
let currentAudio: HTMLAudioElement | null = null;
let drumRollAudio: HTMLAudioElement | null = null;
let drumRollSource: AudioBufferSourceNode | null = null;
let isDrumRollPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Cache para verificar se arquivos existem
const audioFileCache: Record<string, boolean> = {};

async function checkAudioFile(path: string): Promise<boolean> {
  if (audioFileCache[path] !== undefined) {
    return audioFileCache[path];
  }

  try {
    const response = await fetch(path, { method: 'HEAD' });
    audioFileCache[path] = response.ok;
    return response.ok;
  } catch {
    audioFileCache[path] = false;
    return false;
  }
}

async function playAudioFile(path: string): Promise<boolean> {
  const exists = await checkAudioFile(path);
  if (!exists) return false;

  return new Promise((resolve) => {
    currentAudio = new Audio(path);
    currentAudio.volume = 0.7;
    currentAudio.onended = () => resolve(true);
    currentAudio.onerror = () => resolve(false);
    currentAudio.play().catch(() => resolve(false));
  });
}

// ============================================
// RUFAR DE TAMBORES (LOOP CONTÍNUO)
// ============================================

// Buffer para fallback do drum roll
let drumRollBuffer: AudioBuffer | null = null;

async function createDrumRollBuffer(): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const duration = 2; // 2 segundos para o loop
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const rollFrequency = 20 + Math.sin(t * 0.5) * 5; // Frequência variável para som mais interessante
    const rollPattern = Math.sin(2 * Math.PI * rollFrequency * t);
    const envelope = 0.5 + Math.sin(t * Math.PI / duration) * 0.3; // Envelope suave para loop
    const noise = (Math.random() * 2 - 1) * 0.5;
    const drumTone = Math.sin(2 * Math.PI * 100 * t) * 0.3;
    data[i] = (noise * 0.6 + drumTone * 0.4) * envelope * (0.5 + Math.abs(rollPattern) * 0.5);
  }

  return buffer;
}

/**
 * Inicia o rufar de tambores em loop contínuo.
 * O som continua até que stopDrumRoll() seja chamado.
 */
export async function startDrumRollLoop(): Promise<void> {
  if (isDrumRollPlaying) return;
  isDrumRollPlaying = true;

  // Tentar usar arquivo de áudio primeiro (com loop)
  const exists = await checkAudioFile('/sounds/drumroll.mp3');
  if (exists) {
    drumRollAudio = new Audio('/sounds/drumroll.mp3');
    drumRollAudio.volume = 0.7;
    drumRollAudio.loop = true;
    drumRollAudio.play().catch(() => {
      // Se falhar, usar fallback
      playDrumRollFallbackLoop();
    });
    return;
  }

  // Fallback: usar Web Audio API com loop
  await playDrumRollFallbackLoop();
}

async function playDrumRollFallbackLoop(): Promise<void> {
  const ctx = getAudioContext();

  if (!drumRollBuffer) {
    drumRollBuffer = await createDrumRollBuffer();
  }

  const playLoop = () => {
    if (!isDrumRollPlaying) return;

    drumRollSource = ctx.createBufferSource();
    drumRollSource.buffer = drumRollBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.4;

    drumRollSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    drumRollSource.onended = () => {
      if (isDrumRollPlaying) {
        playLoop(); // Continuar o loop
      }
    };

    drumRollSource.start();
  };

  playLoop();
}

/**
 * Para o rufar de tambores.
 */
export function stopDrumRoll(): void {
  isDrumRollPlaying = false;

  if (drumRollAudio) {
    drumRollAudio.pause();
    drumRollAudio.currentTime = 0;
    drumRollAudio = null;
  }

  if (drumRollSource) {
    try {
      drumRollSource.stop();
    } catch {
      // Ignorar erro se já parou
    }
    drumRollSource = null;
  }
}

// Manter compatibilidade com código antigo (função antiga)
export async function playDrumRoll(durationMs: number = 3000): Promise<void> {
  await startDrumRollLoop();
  return new Promise(resolve => setTimeout(() => {
    stopDrumRoll();
    resolve();
  }, durationMs));
}

// ============================================
// APLAUSOS
// ============================================
export async function playApplause(intensity: 'high' | 'medium' | 'low', durationMs: number = 4000): Promise<void> {
  // Tentar usar arquivo de áudio primeiro
  const filename = intensity === 'high' ? 'applause-high.mp3' : 'applause-medium.mp3';
  const played = await playAudioFile(`/sounds/${filename}`);
  if (played) return;

  // Fallback: gerar som
  const ctx = getAudioContext();
  const duration = durationMs / 1000;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  const leftData = buffer.getChannelData(0);
  const rightData = buffer.getChannelData(1);

  const clapRate = intensity === 'high' ? 25 : intensity === 'medium' ? 15 : 8;
  const volume = intensity === 'high' ? 0.6 : intensity === 'medium' ? 0.4 : 0.25;
  const numLayers = intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3;

  for (let layer = 0; layer < numLayers; layer++) {
    const layerOffset = Math.random() * 0.1;
    const layerPan = (Math.random() - 0.5) * 2;

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate + layerOffset;
      const progress = t / duration;

      let envelope = 1;
      if (progress < 0.1) envelope = progress / 0.1;
      else if (progress > 0.7) envelope = (1 - progress) / 0.3;

      const clapPhase = (t * clapRate + layer * 0.37) % 1;
      if (clapPhase < 0.15) {
        const clapDecay = Math.exp(-clapPhase * 30);
        const noise = (Math.random() * 2 - 1) * clapDecay;
        const leftGain = 0.5 + layerPan * 0.5;
        const rightGain = 0.5 - layerPan * 0.5;
        leftData[i] += noise * envelope * volume * leftGain / numLayers;
        rightData[i] += noise * envelope * volume * rightGain / numLayers;
      }
    }
  }

  // Adicionar "woohoo" para aplausos intensos
  if (intensity === 'high') {
    for (let w = 0; w < 3; w++) {
      const woohooTime = 0.5 + Math.random() * 2;
      const woohooStart = Math.floor(woohooTime * ctx.sampleRate);
      const woohooDuration = 0.3 * ctx.sampleRate;

      for (let i = 0; i < woohooDuration && woohooStart + i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const freq = 400 + Math.sin(t * 10) * 100;
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

  return new Promise(resolve => setTimeout(resolve, durationMs));
}

// ============================================
// VAIAS
// ============================================
export async function playBoos(durationMs: number = 3000): Promise<void> {
  // Tentar usar arquivo de áudio primeiro
  const played = await playAudioFile('/sounds/boos.mp3');
  if (played) return;

  // Fallback: gerar som
  const ctx = getAudioContext();
  const duration = durationMs / 1000;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  const leftData = buffer.getChannelData(0);
  const rightData = buffer.getChannelData(1);

  const numVoices = 5;
  for (let voice = 0; voice < numVoices; voice++) {
    const baseFreq = 150 + Math.random() * 50;
    const voiceOffset = Math.random() * 0.2;
    const pan = (Math.random() - 0.5) * 1.5;

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate + voiceOffset;
      const progress = t / duration;

      let envelope = 1;
      if (progress < 0.15) envelope = progress / 0.15;
      else if (progress > 0.8) envelope = (1 - progress) / 0.2;

      const freq = baseFreq * (1 - progress * 0.2);
      const fundamental = Math.sin(2 * Math.PI * freq * t);
      const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.5;
      const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.25;
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

  return new Promise(resolve => setTimeout(resolve, durationMs));
}

// ============================================
// WOMP WOMP WOMP (fracasso)
// ============================================
export async function playWompWomp(): Promise<void> {
  // Tentar usar arquivo de áudio primeiro
  const played = await playAudioFile('/sounds/womp-womp.mp3');
  if (played) return;

  // Fallback: gerar som (sad trombone style)
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;

  // Três "womps" descendentes (estilo trombone triste)
  oscillator.frequency.setValueAtTime(350, now);
  oscillator.frequency.exponentialRampToValueAtTime(175, now + 0.4);

  oscillator.frequency.setValueAtTime(300, now + 0.6);
  oscillator.frequency.exponentialRampToValueAtTime(150, now + 1.0);

  oscillator.frequency.setValueAtTime(250, now + 1.2);
  oscillator.frequency.exponentialRampToValueAtTime(90, now + 1.8);

  // Envelope de volume
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(0.08, now + 0.4);

  gainNode.gain.linearRampToValueAtTime(0.2, now + 0.65);
  gainNode.gain.linearRampToValueAtTime(0.06, now + 1.0);

  gainNode.gain.linearRampToValueAtTime(0.15, now + 1.25);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

  oscillator.start(now);
  oscillator.stop(now + 2.2);

  return new Promise(resolve => setTimeout(resolve, 2200));
}

// ============================================
// FUNÇÃO PRINCIPAL - TOCAR SOM BASEADO NO SCORE
// ============================================
export async function playScoreSound(score: number): Promise<void> {
  if (score >= 80) {
    await playApplause('high', 5000);
  } else if (score >= 60) {
    await playApplause('medium', 3500);
  } else if (score >= 50) {
    await playWompWomp();
  } else {
    await playBoos(2500);
  }
}

// ============================================
// PARAR TODOS OS SONS
// ============================================
export function stopAllSounds(): void {
  // Parar rufar de tambores
  stopDrumRoll();

  // Parar áudio HTML5
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Fechar Web Audio context
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  // Limpar buffer do drum roll para recriá-lo com novo context
  drumRollBuffer = null;
}

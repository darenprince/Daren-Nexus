// services/audioService.ts

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let animationFrameId: number | null = null;
let startTime = 0;
let startedAt = 0;

const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    // FIX: Specify the sample rate to match the TTS decoding context.
    // This is critical because an AudioBuffer created with one sample rate
    // cannot be played in a context with a different sample rate.
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

const stop = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (currentSource) {
    currentSource.onended = null; // Prevent onEnd callback from firing on manual stop
    try {
        currentSource.stop();
    } catch (e) {
        // Ignore errors if the source is already stopped.
    }
    currentSource.disconnect();
    currentSource = null;
  }
  startTime = 0;
  startedAt = 0;
};

const play = (
  buffer: AudioBuffer,
  onProgress: (progress: number) => void,
  onEnd: () => void
) => {
  stop(); // Stop any currently playing audio

  const context = getAudioContext();
  
  // Sanity check for sample rate mismatch before attempting to play.
  if (context.sampleRate !== buffer.sampleRate) {
    console.error(`Audio playback failed: Sample rate mismatch. Context is ${context.sampleRate}Hz, Buffer is ${buffer.sampleRate}Hz.`);
    onEnd(); // End the playback state in the UI.
    return;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  
  startedAt = context.currentTime;
  startTime = 0;

  source.onended = () => {
    // Only call onEnd if it wasn't a manual stop
    if (currentSource === source) {
        stop();
        onEnd();
    }
  };
  
  currentSource = source;

  const duration = buffer.duration;
  
  const step = () => {
    if (currentSource === source) {
      const elapsed = context.currentTime - startedAt;
      const progress = Math.min((elapsed / duration) * 100, 100);
      onProgress(progress);
      animationFrameId = requestAnimationFrame(step);
    }
  };

  source.start(0);
  animationFrameId = requestAnimationFrame(step);
};

export const audioService = {
  play,
  stop,
};
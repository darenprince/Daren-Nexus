import React, { useRef, useEffect } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  analyserNode: AnalyserNode | null;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const embersContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (glowRef.current) glowRef.current.style.opacity = '0';
      return;
    }

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    // Faster response time, smoother waveform
    analyserNode.smoothingTimeConstant = 0.1;
    analyserNode.fftSize = 512;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const computedStyle = getComputedStyle(document.body);
    const color1 = computedStyle.getPropertyValue('--particle-color-1').trim() || '#F97316';
    const color2 = computedStyle.getPropertyValue('--particle-color-2').trim() || '#DC2626';

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      
      analyserNode.getByteTimeDomainData(dataArray);

      // Calculate average volume for effects
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        sum += (v - 1) * (v - 1);
      }
      const volume = Math.sqrt(sum / bufferLength);

      // Update glow effect
      if (glowRef.current) {
        glowRef.current.style.opacity = `${Math.min(1, volume * 2.5)}`;
        glowRef.current.style.transform = `translateX(-50%) scale(${1 + volume * 0.5})`;
      }

      // Trigger embers
      if (isListening && volume > 0.1 && Math.random() < 0.2) {
          const ember = document.createElement('div');
          ember.className = 'voice-visualizer-ember';
          const xDrift = (Math.random() - 0.5) * 100;
          ember.style.setProperty('--x-drift', `${xDrift}px`);
          ember.style.left = `${Math.random() * 100}%`;
          ember.onanimationend = () => ember.remove();
          embersContainerRef.current?.appendChild(ember);
      }
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.5, color2);
      gradient.addColorStop(1, color1);
      
      canvasCtx.lineWidth = 3;
      canvasCtx.strokeStyle = gradient;
      canvasCtx.beginPath();
      
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      const centerY = canvas.height / 2;

      for(let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128.0;
        const y = centerY + (v * centerY * 0.8);
        if(i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceWidth;
      }
      
      canvasCtx.stroke();
    };

    draw();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isListening, analyserNode]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none">
        <div ref={glowRef} className="voice-visualizer-glow"></div>
        <div ref={embersContainerRef} className="absolute inset-0"></div>
        <canvas ref={canvasRef} width="600" height="200" className="w-full h-full waveform-fade-edges" />
    </div>
  );
};
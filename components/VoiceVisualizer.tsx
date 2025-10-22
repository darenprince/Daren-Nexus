import React, { useRef, useEffect } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  analyserNode: AnalyserNode | null;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isListening || !analyserNode || !canvasRef.current) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    if (!canvasCtx) return;

    // Use a larger fftSize for higher resolution waveform data
    analyserNode.fftSize = 2048;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      
      // Use getByteTimeDomainData for waveform visualization
      analyserNode.getByteTimeDomainData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.7)');
      gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.2)');
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0.7)');
      
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgba(167, 139, 250, 0.5)';
      canvasCtx.fillStyle = gradient;

      canvasCtx.beginPath();
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Normalize the value
        const y = v * canvas.height / 2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.lineTo(0, canvas.height / 2);
      
      canvasCtx.closePath();
      canvasCtx.stroke();
      canvasCtx.fill();
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isListening, analyserNode]);

  if (!isListening) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-48 opacity-75 pointer-events-none">
        <canvas ref={canvasRef} width="600" height="200" className="w-full h-full" />
    </div>
  );
};
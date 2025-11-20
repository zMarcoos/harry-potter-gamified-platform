'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/music/background.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      alert(
        'Seu navegador bloqueou a reprodução automática. Tente interagir com a página novamente.',
      );
    }
  };

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <div className='flex items-center gap-2 rounded-lg border border-border bg-card/90 p-2 backdrop-blur-sm'>
        <Button
          className='transition-all duration-300 hover:bg-accent/20'
          onClick={toggleMusic}
          size='sm'
          variant='ghost'
        >
          {isPlaying ? (
            <Volume2 className='h-4 w-4 text-accent' />
          ) : (
            <VolumeX className='h-4 w-4 text-muted-foreground' />
          )}
        </Button>
        <input
          className='h-1 w-16 cursor-pointer appearance-none rounded-lg bg-muted'
          max='1'
          min='0'
          onChange={(event) => setVolume(parseFloat(event.target.value))}
          step='0.05'
          type='range'
          value={volume}
        />
      </div>
    </div>
  );
}

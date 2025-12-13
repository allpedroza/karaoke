import { useState, useCallback, useRef, useEffect } from 'react';

interface UseYouTubePlayerReturn {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loadVideo: (videoId: string) => void;
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  playerRef: React.RefObject<HTMLDivElement>;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideoById: (videoId: string) => void;
  destroy: () => void;
}

export function useYouTubePlayer(): UseYouTubePlayerReturn {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YTPlayer | null>(null);
  const timeUpdateRef = useRef<number | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      setIsReady(true);
    };

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setIsReady(true);
    }

    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, []);

  const loadVideo = useCallback((videoId: string) => {
    if (!isReady || !playerRef.current) return;

    if (playerInstanceRef.current) {
      playerInstanceRef.current.loadVideoById(videoId);
      return;
    }

    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration());
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            // Start time updates
            timeUpdateRef.current = window.setInterval(() => {
              if (playerInstanceRef.current) {
                setCurrentTime(playerInstanceRef.current.getCurrentTime());
              }
            }, 1000);
          } else {
            setIsPlaying(false);
            if (timeUpdateRef.current) {
              clearInterval(timeUpdateRef.current);
              timeUpdateRef.current = null;
            }
          }
        },
      },
    });
  }, [isReady]);

  const play = useCallback(() => {
    playerInstanceRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerInstanceRef.current?.pauseVideo();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    playerInstanceRef.current?.seekTo(seconds, true);
  }, []);

  return {
    isReady,
    isPlaying,
    currentTime,
    duration,
    loadVideo,
    play,
    pause,
    seekTo,
    playerRef,
  };
}

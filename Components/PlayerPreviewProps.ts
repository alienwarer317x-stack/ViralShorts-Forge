import React, { useRef, useEffect } from 'react';
import { TimelineClip, ProjectSettings } from '../types';
interface PlayerPreviewProps {
  currentTime: number;
  totalDurationSec: number;
  isPlaying: boolean;
  activeVideoClip: TimelineClip | null;
  activeTextClips: TimelineClip[];
  settings: ProjectSettings;
  onTogglePlay: () => void;
  onSeek: (timeSec: number) => void;
  onStepFrame: (frames: number) => void;
}
export const PlayerPreview: React.FC<PlayerPreviewProps> = ({
  currentTime,
  totalDurationSec,
  isPlaying,
  activeVideoClip,
  activeTextClips,
  settings,
  onTogglePlay,
  onSeek,
  onStepFrame,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Sync HTML video element with timeline current playhead and unmute on user play
  useEffect(() => {
    if (!videoRef.current || !activeVideoClip) return;
    const offsetInClip = currentTime - activeVideoClip.startSec + (activeVideoClip.trimInSec || 0);
    const clampedOffset = Math.max(0, offsetInClip);
    if (Math.abs(videoRef.current.currentTime - clampedOffset) > 0.15) {
      videoRef.current.currentTime = clampedOffset;
    }
    videoRef.current.muted = false;
    videoRef.current.volume = 1.0;
    if (isPlaying) {
      videoRef.current.play().catch(() => {
        // Fallback to muted playback if user gesture was not registered
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    } else {
      videoRef.current.pause();
    }
  }, [currentTime, isPlaying, activeVideoClip]);
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * settings.fps);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}:${frames < 10 ? '0' : ''}${frames}`;
  };
  const getAspectClass = () => {
    if (settings.aspectRatio === '9:16') return 'w-[250px] sm:w-[280px] aspect-[9/16]';
    if (settings.aspectRatio === '1:1') return 'w-[320px] sm:w-[380px] aspect-square';
    return 'w-full max-w-[620px] aspect-video';
  };
  return (
    <div className="w-full flex flex-col items-center justify-between h-full bg-[#0a0c12] p-3 gap-2 select-none">
      {/* Top Monitor Info Header */}
      <div className="w-full max-w-[620px] flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-[10px] font-bold">
            {settings.aspectRatio}
          </span>
          <span className="text-[10px] text-slate-500">{settings.resolution} &bull; {settings.fps} FPS &bull; Audio Active</span>
        </div>
        <div className="text-[11px] font-bold text-amber-300 font-mono">
          {formatTimecode(currentTime)} / {formatTimecode(totalDurationSec)}
        </div>
      </div>
      {/* Screen Monitor Canvas */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        <div
          className={`relative overflow-hidden rounded-xl bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center transition-all ${getAspectClass()}`}
        >
          {activeVideoClip?.base64 ? (
            <video
              ref={videoRef}
              src={`data:${activeVideoClip.mimeType || 'video/mp4'};base64,${activeVideoClip.base64}`}
              className="w-full h-full object-contain"
              playsInline
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-600 gap-1.5 bg-[#0e111a]">
              <span className="material-symbols-outlined text-4xl">movie</span>
              <span className="text-xs font-mono text-slate-400">
                {activeVideoClip ? activeVideoClip.name : 'No Clip at Playhead'}
              </span>
              <span className="text-[10px] text-slate-600">
                Position playhead over timeline clip or import media
              </span>
            </div>
          )}
          {/* Active Text Title / Subtitle Overlays */}
          {activeTextClips.map((t) => (
            <div
              key={t.id}
              className="absolute bottom-8 inset-x-4 flex justify-center pointer-events-none z-20"
            >
              <div
                style={{
                  fontSize: `${t.fontSize || 16}px`,
                  color: t.textColor || '#ffffff',
                  backgroundColor: t.textBgColor || 'rgba(0,0,0,0.7)',
                }}
                className="px-3 py-1 rounded-lg font-bold uppercase tracking-wide shadow-lg border border-white/10 text-center max-w-[90%] break-words"
              >
                {t.text || 'Sample Title'}
              </div>
            </div>
          ))}
          {/* Safe Frame Guides */}
          <div className="absolute inset-4 border border-dashed border-white/10 pointer-events-none" />
        </div>
      </div>
      {/* Transport Controls Bar */}
      <div className="w-full max-w-[620px] flex items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Jump to Start (Home)"
          >
            <span className="material-symbols-outlined text-[17px]">first_page</span>
          </button>
          <button
            onClick={() => onStepFrame(-1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Step 1 Frame Back (Left Arrow)"
          >
            <span className="material-symbols-outlined text-[17px]">skip_previous</span>
          </button>
          <button
            onClick={onTogglePlay}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 shadow-md cursor-pointer transition-colors active:scale-95"
            title="Play / Pause (Space)"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={() => onStepFrame(1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Step 1 Frame Forward (Right Arrow)"
          >
            <span className="material-symbols-outlined text-[17px]">skip_next</span>
          </button>
          <button
            onClick={() => onSeek(totalDurationSec)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Jump to End (End)"
          >
            <span className="material-symbols-outlined text-[17px]">last_page</span>
          </button>
        </div>
        {/* Timecode scrub slider */}
        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
          <input
            type="range"
            min="0"
            max={Math.max(1, totalDurationSec)}
            step="0.05"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

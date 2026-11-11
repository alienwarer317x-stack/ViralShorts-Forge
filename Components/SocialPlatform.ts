import React from 'react';
import { VideoProject, SceneSegment } from '../types';
export type SocialPlatform = 'none' | 'tiktok' | 'youtube_shorts' | 'youtube_desktop';
interface SocialPlatformOverlaysProps {
  platform: SocialPlatform;
  project: VideoProject;
  activeScene: SceneSegment;
  showSafeZones: boolean;
  isLandscape: boolean;
}
export const SocialPlatformOverlays: React.FC<SocialPlatformOverlaysProps> = ({
  platform,
  project,
  activeScene,
  showSafeZones,
  isLandscape,
}) => {
  if (platform === 'none') return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between overflow-hidden select-none text-white">
      {/* Visual Safe Zone Grid Outline */}
      {showSafeZones && (
        <div className="absolute inset-0 border-2 border-dashed border-amber-400/60 z-30 pointer-events-none">
          <div className="absolute top-1 left-2 bg-amber-500/90 text-black font-mono text-[9px] px-1.5 py-0.5 rounded font-bold shadow">
            SAFE CONTENT ZONE
          </div>
          {/* Top obstruction safe zone */}
          <div className="absolute top-0 inset-x-0 h-10 bg-amber-500/10 border-b border-amber-400/30 flex items-center justify-center">
            <span className="text-[9px] text-amber-300 font-mono tracking-widest uppercase">Header Safe Zone (UI Covered)</span>
          </div>
          {/* Bottom obstruction safe zone */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-amber-500/10 border-t border-amber-400/30 flex items-center justify-center">
            <span className="text-[9px] text-amber-300 font-mono tracking-widest uppercase">Caption & Navigation Safe Zone</span>
          </div>
          {/* Right action column safe zone for vertical formats */}
          {!isLandscape && (
            <div className="absolute right-0 top-16 bottom-20 w-14 bg-amber-500/10 border-l border-amber-400/30 flex items-center justify-center">
              <span className="text-[8px] text-amber-300 font-mono rotate-90 whitespace-nowrap">Icon Margin</span>
            </div>
          )}
        </div>
      )}
      {/* 1. TIKTOK FRAME OVERLAY */}
      {platform === 'tiktok' && (
        <>
          {/* Top Bar */}
          <div className="pt-2 px-3 flex items-center justify-between text-xs drop-shadow-md z-10">
            <div className="flex items-center gap-1.5 text-white/90">
              <span className="material-symbols-outlined text-[16px]">live_tv</span>
              <span className="text-[10px] font-bold tracking-tight">LIVE</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-white/60">Following</span>
              <span className="text-white border-b-2 border-white pb-0.5">For You</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-white">search</span>
          </div>
          {/* Right Engagement Floating Column */}
          <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3.5 z-10">
            {/* Profile Avatar */}
            <div className="relative mb-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[11px] font-black text-white">
                  VS
                </div>
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold leading-none shadow">
                +
              </div>
            </div>
            {/* Like */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-white">favorite</span>
              </div>
              <span className="text-[9px] font-bold text-white/90 mt-0.5">482.3K</span>
            </div>
            {/* Comments */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-white">chat_bubble</span>
              </div>
              <span className="text-[9px] font-bold text-white/90 mt-0.5">18.4K</span>
            </div>
            {/* Bookmark */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-white">bookmark</span>
              </div>
              <span className="text-[9px] font-bold text-white/90 mt-0.5">89.2K</span>
            </div>
            {/* Share */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-white">share</span>
              </div>
              <span className="text-[9px] font-bold text-white/90 mt-0.5">34.1K</span>
            </div>
            {/* Rotating Audio Disc */}
            <div className="w-7 h-7 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
              <span className="material-symbols-outlined text-[13px] text-zinc-300">music_note</span>
            </div>
          </div>
          {/* Bottom Left Info / Caption & Hashtags */}
          <div className="p-3 pr-16 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <p className="text-[11px] font-bold text-white flex items-center gap-1 drop-shadow">
              @viralforge
              <span className="material-symbols-outlined text-[12px] text-cyan-400">verified</span>
            </p>
            <p className="text-[10px] text-white/95 font-medium line-clamp-2 mt-0.5 drop-shadow leading-tight">
              {activeScene.narration || project.topic}
            </p>
            <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-bold text-cyan-200">
              {activeScene.hookKeywords.map((kw, i) => (
                <span key={i}>#{kw}</span>
              ))}
              <span>#fyp</span>
              <span>#viral</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-white/80 mt-1.5 font-mono">
              <span className="material-symbols-outlined text-[11px]">music_note</span>
              <span className="truncate max-w-[140px]">Original Audio - {project.bgmGenre}</span>
            </div>
          </div>
        </>
      )}
      {/* 2. YOUTUBE SHORTS OVERLAY */}
      {platform === 'youtube_shorts' && (
        <>
          {/* Top Bar */}
          <div className="pt-2 px-3 flex items-center justify-between text-xs z-10 drop-shadow">
            <span className="text-xs font-black tracking-tight flex items-center gap-1 text-white">
              <span className="text-red-500 material-symbols-outlined text-[16px]">play_circle</span>
              Shorts
            </span>
            <div className="flex items-center gap-2.5 text-white/90">
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span className="material-symbols-outlined text-[18px]">camera_alt</span>
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </div>
          </div>
          {/* Right Floating Actions (YouTube Shorts style) */}
          <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 z-10">
            {/* Thumbs up */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px] text-white">thumb_up</span>
              </div>
              <span className="text-[9px] font-bold text-white mt-0.5">320K</span>
            </div>
            {/* Thumbs down */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px] text-white">thumb_down</span>
              </div>
              <span className="text-[9px] font-bold text-white mt-0.5">Dislike</span>
            </div>
            {/* Comments */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px] text-white">comment</span>
              </div>
              <span className="text-[9px] font-bold text-white mt-0.5">4.2K</span>
            </div>
            {/* Share */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px] text-white">share</span>
              </div>
              <span className="text-[9px] font-bold text-white mt-0.5">Share</span>
            </div>
            {/* Remix */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px] text-white">instant_mix</span>
              </div>
              <span className="text-[9px] font-bold text-white mt-0.5">Remix</span>
            </div>
            {/* Square sound cover thumbnail */}
            <div className="w-6 h-6 rounded-md bg-red-600/80 border border-white/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px] text-white">music_note</span>
            </div>
          </div>
          {/* YouTube Bottom Bar */}
          <div className="p-3 pr-16 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
            {/* Channel info with Subscribe button */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
                YT
              </div>
              <span className="text-[11px] font-bold truncate">@CreatorChannel</span>
              <button className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-bold shadow-sm">
                Subscribe
              </button>
            </div>
            {/* Title / prompt preview */}
            <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
              {project.topic} - {activeScene.title}
            </p>
            {/* Audio track attribution */}
            <div className="flex items-center gap-1 text-[9px] text-white/70 mt-1 font-mono">
              <span className="material-symbols-outlined text-[10px]">graphic_eq</span>
              <span className="truncate max-w-[150px]">{project.bgmGenre} • Original sound</span>
            </div>
          </div>
        </>
      )}
      {/* 3. YOUTUBE DESKTOP / STANDARD 16:9 OVERLAY */}
      {platform === 'youtube_desktop' && (
        <>
          {/* Top Title Bar HUD */}
          <div className="pt-2 px-3 flex items-center justify-between text-xs z-10 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
                ▶
              </div>
              <span className="text-[11px] font-semibold text-white truncate max-w-[280px] drop-shadow">
                {project.topic}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="material-symbols-outlined text-[16px]">watch_later</span>
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span className="material-symbols-outlined text-[16px]">more_vert</span>
            </div>
          </div>
          {/* Bottom Player Controller HUD */}
          <div className="p-2.5 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col gap-1.5">
            {/* Red Scrub Bar */}
            <div className="w-full flex items-center gap-1 group">
              <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 bg-red-600 w-1/3 rounded-full" />
              </div>
            </div>
            {/* Player Controls Bar */}
            <div className="flex items-center justify-between text-white/90">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span className="material-symbols-outlined text-[16px]">skip_next</span>
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span className="text-[10px] font-mono text-white/80">0:12 / 1:00</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/80">
                <span className="material-symbols-outlined text-[15px]">subtitles</span>
                <span className="material-symbols-outlined text-[15px]">settings</span>
                <span className="material-symbols-outlined text-[15px]">branding_watermark</span>
                <span className="material-symbols-outlined text-[15px]">fullscreen</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

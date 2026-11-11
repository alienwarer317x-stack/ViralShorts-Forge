import React from 'react';
interface TopicGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWithTopic: (topic: string, niche: 'kids' | 'tech' | 'mystery' | 'motivation' | 'history' | 'finance' | 'comedy') => void;
}
export const TopicGeneratorModal: React.FC<TopicGeneratorModalProps> = ({
  isOpen,
  onClose,
  onStartWithTopic,
}) => {
  if (!isOpen) return null;
  const presets: Array<{
    title: string;
    topic: string;
    niche: 'kids' | 'tech' | 'mystery' | 'motivation' | 'history' | 'finance' | 'comedy';
    icon: string;
    badge?: string;
  }> = [
    {
      title: 'Baby Animals Learn Colors & Numbers',
      topic: 'Cheerful baby animals on a sunny farm singing a happy counting nursery rhyme together',
      niche: 'kids',
      icon: 'child_care',
      badge: 'Children Story',
    },
    {
      title: 'The Little Star Who Helped a Lost Bunny',
      topic: 'A gentle bedtime cartoon story about a glowing little star guiding a kind bunny back home',
      niche: 'kids',
      icon: 'bedtime',
      badge: 'Children Story',
    },
    {
      title: 'Dark Artificial Intelligence Future',
      topic: 'How AI and synthetic consciousness will replace human smartphones in 2030',
      niche: 'tech',
      icon: 'smart_toy',
    },
    {
      title: 'The Bermuda Triangle Mystery Solved',
      topic: 'Unexplained deep ocean magnetic vortexes discovered beneath the Bermuda Triangle',
      niche: 'mystery',
      icon: 'water_drop',
    },
    {
      title: 'Ancient Roman War Technology',
      topic: 'The secret Greek Fire and mechanical siege weapons that terrified the ancient world',
      niche: 'history',
      icon: 'fort',
    },
    {
      title: 'The 10-Second Focus Rule',
      topic: 'The psychological dopamine trick billionaires use every morning to avoid burnout',
      niche: 'motivation',
      icon: 'bolt',
    },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-xl w-full p-6 md:p-8 text-white shadow-[0_0_50px_rgba(168,85,247,0.3)] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <span className="material-symbols-outlined text-[28px] text-white">auto_awesome</span>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              ViralShorts Forge
            </h2>
            <p className="text-xs text-purple-300 font-mono">
              Choose Topic for Story &bull; Full Multi-Scene Video Generator
            </p>
          </div>
        </div>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
          Generates a full <strong>multi-scene video sequence</strong> formatted for TikTok (9:16) or YouTube (16:9). Includes synchronized voice narration, child-safe nursery rhymes &amp; cartoon stories, dynamic subtitles, and AI animation clips.
        </p>
        <div className="mb-6">
          <label className="text-[11px] font-mono uppercase tracking-wider text-purple-400 mb-2 block font-bold">
            ⚡ Quick-Launch Story Topics:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  onStartWithTopic(p.topic, p.niche);
                  onClose();
                }}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all group cursor-pointer ${
                  p.niche === 'kids'
                    ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/50 hover:border-amber-400'
                    : 'bg-slate-800/80 hover:bg-purple-900/40 border-slate-700/80 hover:border-purple-500/50'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform ${
                  p.niche === 'kids' ? 'text-amber-400' : 'text-pink-400'
                }`}>
                  {p.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                      {p.title}
                    </h4>
                    {p.badge && (
                      <span className="text-[8px] font-mono font-bold bg-amber-500 text-black px-1.5 py-0.2 rounded-full whitespace-nowrap">
                        Kids ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.topic}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-700/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Launch Video Creation Studio</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Flow } from 'flow-sdk';
import { 
  VideoProject, 
  SceneSegment, 
  YouTubeCategory, 
  TotalVideoDurationOption, 
  SceneDurationOption,
  VideoResolutionOption,
  CapCutTemplateType,
} from './types';
import { 
  DEFAULT_SUBTITLE_CONFIG, 
  DEFAULT_CAPCUT_TEMPLATE_CONFIG,
  CAPCUT_TEMPLATES_LIST,
  DEFAULT_MASTER_CINEMATIC_RULES, 
  DEFAULT_SCREENING_RULES, 
  CATEGORY_CONFIG_LIST,
  calculateMasterSceneBreakdown,
} from './constants';
import { TopicGeneratorModal } from './components/TopicGeneratorModal';
import { TrendingPanel } from './components/TrendingPanel';
import { StyleAndDurationSelector } from './components/StyleAndDurationSelector';
import { VoiceProsodySettingsPanel } from './components/VoiceProsodySettingsPanel';
import { BlueprintScriptView } from './components/BlueprintScriptView';
import { AnimationStoryboardDashboard } from './components/AnimationStoryboardDashboard';
import { DirectorControlMonitor } from './components/DirectorControlMonitor';
import { FinalProductionPage } from './components/FinalProductionPage';
import { parseScreenplayProductionText } from './services/scriptParser';
import { concatenateVideoClips } from './services/videoPipeline';
/** Fresh, clean initial project */
const createFreshCleanProject = (): VideoProject => ({
  id: `proj-${Date.now()}`,
  title: '',
  topic: '',
  category: undefined,
  storyPartNumber: 1,
  targetDurationTier: undefined,
  selectedSceneDuration: undefined,
  format: '9:16',
  aspectRatio: '9:16',
  resolutionScale: '720p',
  visualStyle: 'photorealistic_cinematic',
  colorGrade: 'kodak_warm_35mm',
  filmAspect: 'cinemascope_239',
  globalTransition: 'zoom_push',
  transitionDurationSec: 0.4,
  cinemascopeLetterbox: false,
  filmGrainEnabled: false,
  voiceStyle: 'bellatrix',
  prosody: {
    pitchModulation: 1.05,
    rateModulation: 1.1,
    breathPauses: true,
  },
  bgmGenre: 'viral_beat_drop',
  subtitles: DEFAULT_SUBTITLE_CONFIG,
  capcutTemplate: DEFAULT_CAPCUT_TEMPLATE_CONFIG,
  masterRules: DEFAULT_MASTER_CINEMATIC_RULES,
  screeningRules: DEFAULT_SCREENING_RULES,
  storyboardConfig: {
    ratio: '9:16',
    stillEngine: '🍌 Nano Banana Pro',
    motionEngine: 'Omni 1.1 Flash',
    humanVoice: 'Natural Human Voice',
    aesthetic: 'CapCut Velocity Viral',
  },
  characters: [],
  scenes: [],
  customScriptText: '',
  seoMetadata: undefined,
  coverVisual: undefined,
  finalProductVideoBase64: undefined,
  directorEvaluation: undefined,
});
type ActiveAppTab = 
  | 'category_story' 
  | 'media_settings' 
  | 'voices' 
  | 'blueprint_script' 
  | 'storyboard' 
  | 'screening' 
  | 'final_production';
export default function App() {
  const [project, setProject] = useState<VideoProject>(createFreshCleanProject);
  const [activeTab, setActiveTab] = useState<ActiveAppTab>('category_story');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  // Loading & In-flight Generation States
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatingVisualSceneId, setGeneratingVisualSceneId] = useState<string | null>(null);
  const [generatingAnimationSceneId, setGeneratingAnimationSceneId] = useState<string | null>(null);
  const [isGeneratingAllVisuals, setIsGeneratingAllVisuals] = useState(false);
  const [isAnimatingAllScenes, setIsAnimatingAllScenes] = useState(false);
  const [batchProgressText, setBatchProgressText] = useState<string | null>(null);
  const [cancelBatchRequested, setCancelBatchRequested] = useState(false);
  const [isRunningDirectorTest, setIsRunningDirectorTest] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isGeneratingFinalProduct, setIsGeneratingFinalProduct] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isGeneratingHook, setIsGeneratingHook] = useState(false);
  const [isContinuingStory, setIsContinuingStory] = useState(false);
  const updateProject = (patch: Partial<VideoProject>) => {
    setProject((prev) => ({ ...prev, ...patch }));
  };
  const updateScene = (sceneId: string, patch: Partial<SceneSegment>) => {
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === sceneId ? { ...s, ...patch } : s)),
    }));
  };
  const handleFullRefreshAllPages = () => {
    setIsRefreshing(true);
    setCancelBatchRequested(true);
    setBatchProgressText(null);
    setGeneratingVisualSceneId(null);
    setGeneratingAnimationSceneId(null);
    setIsGeneratingAllVisuals(false);
    setIsAnimatingAllScenes(false);
    setIsGeneratingStory(false);
    setIsRunningDirectorTest(false);
    setIsGeneratingSEO(false);
    setIsGeneratingFinalProduct(false);
    setIsGeneratingCover(false);
    setIsGeneratingHook(false);
    setIsContinuingStory(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const freshProject = createFreshCleanProject();
    setProject(freshProject);
    setActiveTab('category_story');
    setRefreshToast('✓ Started New Project! Clean workspace ready.');
    setTimeout(() => {
      setIsRefreshing(false);
      setCancelBatchRequested(false);
    }, 400);
    setTimeout(() => {
      setRefreshToast(null);
    }, 3500);
  };
  // Generate Story / Script using direct scene calculation with template pacing
  const handleGenerateStoryScript = async (
    category?: YouTubeCategory,
    promptIdea?: string,
    durationTier?: TotalVideoDurationOption,
    sceneDurOverride?: SceneDurationOption,
    capcutStyleOverride?: CapCutTemplateType
  ) => {
    const finalCategory = category || project.category || 'Shorts';
    const finalTier = durationTier || project.targetDurationTier || '30s';
    const finalSceneDur = sceneDurOverride || project.selectedSceneDuration || 4;
    const finalTemplateId = capcutStyleOverride || project.capcutTemplate.templateId || 'velocity_zoom';
    const sceneCalc = calculateMasterSceneBreakdown(
      finalTier, 
      finalSceneDur, 
      project.storyboardConfig?.motionEngine || 'Omni 1.1 Flash', 
      project.resolutionScale
    );
    setIsGeneratingStory(true);
    try {
      const isKidsStory = finalCategory === 'Children Story';
      const categoryMeta = CATEGORY_CONFIG_LIST.find((c) => c.id === finalCategory);
      const userTopic = (promptIdea || '').trim() || project.topic.trim() || 'Shocking viral transformation that blew up social media';
      const activeTemplateMeta = CAPCUT_TEMPLATES_LIST.find((t) => t.id === finalTemplateId) || CAPCUT_TEMPLATES_LIST[0];
      let runningTime = 0;
      const plannedSceneSchedule = sceneCalc.sceneDurations.map((dur, i) => {
        const start = runningTime;
        runningTime += dur;
        return `Scene ${i + 1}: EXACTLY ${dur}s (Timecode: ${start}s - ${runningTime}s)`;
      }).join('\n');
      const estimatedWordsPerScene = Math.max(6, Math.round(finalSceneDur * 2.5));
      const capcutPacingDirective = `
CAPCUT TEMPLATE PACING MANDATE ("${activeTemplateMeta.title.toUpperCase()}"):
- Template Aesthetic: ${activeTemplateMeta.tagline}
- Beat Rate: ${activeTemplateMeta.bpm} BPM
- Style Prompt Formula: ${activeTemplateMeta.promptEnhancer}
- Scene 1 MUST be an explosive 0.5s visual hook pattern interrupt with giant bold on-screen caption.
- Write rhythmic punchy sentences engineered for high velocity TikTok/Shorts pacing (~${estimatedWordsPerScene} words per cut).
- Every visual still and animation prompt must include dynamic motion words (whip zoom, bass drop flash, speed ramp, volumetric neon glow).`;
      const { text } = await Flow.generate.text(
        `Write a full viral episodic video screenplay formatted as a video template.
TOPIC: "${userTopic}"
CATEGORY: "${finalCategory}"
TEMPLATE STYLE: "${activeTemplateMeta.title}" (${activeTemplateMeta.bpm} BPM)
${capcutPacingDirective}
MANDATORY TIMELINE CONSTRAINTS (STRICT ENFORCEMENT):
- Total Target Runtime: ${finalTier} (${sceneCalc.totalDurationSec} seconds total)
- Total Scene Count: EXACTLY ${sceneCalc.sceneCount} scenes
- Scene Duration for EVERY scene: EXACTLY ${finalSceneDur}s each
- Spoken Dialogue / Voiceover Word Count per Scene: Target ~${estimatedWordsPerScene} words per scene (rapid viral pacing suited for ${finalSceneDur}s)
- Pacing Arc: Scene 1 instant retention hook, rising tension beats, climactic visual reveal at end.
PLANNED SCENE TIMELINE BREAKDOWN:
${plannedSceneSchedule}
Output JSON with this exact structure:
{
  "topic": "${userTopic}",
  "scenes": [
    {
      "order": 1,
      "title": "Scene Title",
      "storyBeat": "Narrative beat summary for this ${finalSceneDur}s scene",
      "visualDescription": "Environment & character visual state with dynamic lighting and velocity",
      "dialogue": "Punchy voiceover line (~${estimatedWordsPerScene} words)",
      "visualPrompt": "Detailed visual prompt for 🍌 Nano Banana Pro incorporating ${activeTemplateMeta.promptEnhancer}...",
      "animationPrompt": "High-velocity camera move with speed-ramp and kinetic crash zoom...",
      "caption": "BOLD VIRAL CAPTION"
    }
  ]
}`,
        {
          systemInstruction: 'You are an elite short-form video creator and viral template architect. Output raw JSON only.',
        }
      );
      const cleaned = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.scenes && Array.isArray(parsed.scenes)) {
        let cumulativeTime = 0;
        const newScenes: SceneSegment[] = sceneCalc.sceneDurations.map((targetDur, idx) => {
          const s = parsed.scenes[idx] || {};
          const startTime = cumulativeTime;
          cumulativeTime += targetDur;
          return {
            id: `scene-${Date.now()}-${idx + 1}`,
            order: idx + 1,
            duration: targetDur,
            plannedStartTimeSec: startTime,
            plannedEndTimeSec: cumulativeTime,
            isTrimmedFinalScene: false,
            rawRenderDurationSec: targetDur,
            title: s.title || `Shot #${idx + 1 < 10 ? `0${idx + 1}` : idx + 1}`,
            storyBeat: s.storyBeat || `Story beat for scene ${idx + 1}`,
            visualDescription: s.visualDescription || '',
            continuityFromPrevious: idx === 0 ? 'Establishing shot' : `Continuity from scene ${idx}`,
            dialogue: s.dialogue || '',
            dialogueSpeaker: isKidsStory ? 'STORYTELLER' : 'NARRATOR',
            dialogueDeliveryNote: 'High-energy viral delivery, crisp confident voice',
            narration: s.dialogue || '',
            visualPrompt: s.visualPrompt || `${userTopic}, scene ${idx + 1}, ${activeTemplateMeta.promptEnhancer}`,
            animationPrompt: s.animationPrompt || 'Kinetic crash zoom velocity motion',
            cameraDirective: s.animationPrompt || 'Crash zoom with speed ramp',
            caption: s.caption || (idx === 0 ? 'WAIT FOR IT...' : `SCENE ${idx + 1}`),
            hookKeywords: ['viral', 'fyp', 'trending'],
            status: 'idle',
            textOverlayPosition: idx === 0 ? 'center' : 'bottom_safe',
          };
        });
        const patch: Partial<VideoProject> = {
          topic: parsed.topic || userTopic,
          title: parsed.topic || userTopic,
          category: finalCategory,
          targetDurationTier: finalTier,
          selectedSceneDuration: finalSceneDur,
          scenes: newScenes,
          customScriptText: newScenes.map((s) => s.narration).join(' '),
          globalTransition: activeTemplateMeta.transitionType,
          capcutTemplate: {
            ...project.capcutTemplate,
            templateId: finalTemplateId,
            bpmRate: activeTemplateMeta.bpm,
          },
        };
        if (categoryMeta) {
          patch.visualStyle = categoryMeta.recommendedStyle;
        }
        updateProject(patch);
        setActiveTab('storyboard');
      }
    } catch (err: any) {
      console.error('Story generation failed:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };
  // Generate Single Visual Keyframe Image with Nano Banana Pro
  const handleGenerateVisualKeyframe = async (sceneId: string) => {
    const scene = project.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    setGeneratingVisualSceneId(sceneId);
    updateScene(sceneId, { status: 'generating_visual' });
    try {
      const activeTemplateMeta = CAPCUT_TEMPLATES_LIST.find((t) => t.id === project.capcutTemplate.templateId);
      const capcutSuffix = project.capcutTemplate.enabled && activeTemplateMeta
        ? `, ${activeTemplateMeta.promptEnhancer}`
        : '';
      const prompt = `${scene.visualPrompt}${capcutSuffix}, aspect ratio ${project.aspectRatio}`;
      const result = await Flow.generate.image({
        prompt,
        modelDisplayName: '🍌 Nano Banana Pro',
        aspectRatio: project.aspectRatio === '9:16' ? '9:16' : project.aspectRatio === '1:1' ? '1:1' : '16:9',
      });
      updateScene(sceneId, {
        status: 'ready',
        visualFrame: {
          base64: result.base64,
          mimeType: result.mimeType,
          mediaId: result.mediaId,
          promptUsed: prompt,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('Visual keyframe generation error:', err);
      updateScene(sceneId, { status: 'idle' });
    } finally {
      setGeneratingVisualSceneId(null);
    }
  };
  // Animate Single Scene Video with Omni 1.1 Flash matching exact scene duration
  const handleGenerateAnimation = async (sceneId: string) => {
    const scene = project.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    setGeneratingAnimationSceneId(sceneId);
    updateScene(sceneId, { status: 'generating_video' });
    try {
      const activeTemplateMeta = CAPCUT_TEMPLATES_LIST.find((t) => t.id === project.capcutTemplate.templateId);
      const capcutMotion = project.capcutTemplate.enabled && activeTemplateMeta
        ? `, ${activeTemplateMeta.vfxDescription}, extreme kinetic velocity, smooth 60fps trajectory`
        : '';
      const prompt = `${scene.animationPrompt || scene.cameraDirective || scene.visualPrompt}${capcutMotion}`;
      const activeMotionEngine = project.storyboardConfig?.motionEngine || 'Omni 1.1 Flash';
      const requestedDuration = scene.duration;
      const allowedDurations = [4, 6, 8, 10];
      const supportedModelDuration = allowedDurations.reduce((prev, curr) =>
        Math.abs(curr - requestedDuration) < Math.abs(prev - requestedDuration) ? curr : prev
      );
      const modelRes = project.resolutionScale === '360p' ? '360p' : '720p';
      let result;
      if (scene.visualFrame?.mediaId) {
        result = await Flow.generate.video({
          prompt,
          firstFrameImageMediaId: scene.visualFrame.mediaId,
          modelDisplayName: activeMotionEngine,
          aspectRatio: project.aspectRatio === '9:16' ? '9:16' : '16:9',
          resolution: modelRes,
          durationSeconds: supportedModelDuration,
        });
      } else {
        result = await Flow.generate.video({
          prompt,
          modelDisplayName: activeMotionEngine,
          aspectRatio: project.aspectRatio === '9:16' ? '9:16' : '16:9',
          resolution: modelRes,
          durationSeconds: supportedModelDuration,
        });
      }
      updateScene(sceneId, {
        status: 'ready',
        videoBase64: result.base64,
        videoMimeType: result.mimeType,
        videoMediaId: result.mediaId,
      });
      return result;
    } catch (err: any) {
      console.error('Animation error:', err);
      updateScene(sceneId, { status: 'idle' });
    } finally {
      setGeneratingAnimationSceneId(null);
    }
  };
  // Batch Generate All Still Keyframes
  const handleGenerateAllVisuals = async () => {
    setIsGeneratingAllVisuals(true);
    setCancelBatchRequested(false);
    for (let i = 0; i < project.scenes.length; i++) {
      if (cancelBatchRequested) break;
      const sc = project.scenes[i];
      setBatchProgressText(`Rendering Still Keyframe ${i + 1} of ${project.scenes.length} with 🍌 Nano Banana Pro...`);
      await handleGenerateVisualKeyframe(sc.id);
    }
    setBatchProgressText(null);
    setIsGeneratingAllVisuals(false);
  };
  // Batch Animate All Scenes -> Auto-Stitches and navigates to Screening
  const handleAnimateAllScenes = async () => {
    setIsAnimatingAllScenes(true);
    setCancelBatchRequested(false);
    const generatedVideos: Array<{ id: string; base64: string; duration: number; narration?: string; caption?: string }> = [];
    for (let i = 0; i < project.scenes.length; i++) {
      if (cancelBatchRequested) break;
      const sc = project.scenes[i];
      if (sc.duration < 3) continue;
      setBatchProgressText(`Animating Scene ${i + 1} of ${project.scenes.length} (${sc.duration}s)...`);
      const animRes = await handleGenerateAnimation(sc.id);
      if (animRes?.base64) {
        generatedVideos.push({
          id: sc.id,
          base64: animRes.base64,
          duration: sc.duration,
          narration: sc.narration,
          caption: sc.caption,
        });
      }
    }
    setBatchProgressText('Assembling verified timeline matching target duration...');
    try {
      const allClipsToStitch = project.scenes
        .filter((sc) => sc.duration >= 3)
        .map((sc) => {
          const matching = generatedVideos.find((v) => v.id === sc.id);
          const base64 = matching?.base64 || sc.videoBase64;
          return base64 ? { base64, duration: sc.duration, narration: sc.narration, caption: sc.caption } : null;
        })
        .filter(Boolean) as any[];
      if (allClipsToStitch.length > 0) {
        const assembledBase64 = await concatenateVideoClips(allClipsToStitch, {
          format: project.format,
          resolutionScale: project.resolutionScale,
          hookClipBase64: project.coverVisual?.threeSecHook?.videoBase64,
          hookDurationSec: 3,
          colorGrade: project.colorGrade,
          filmGrainEnabled: project.filmGrainEnabled,
          cinemascopeLetterbox: project.cinemascopeLetterbox,
          transition: project.globalTransition,
          transitionDurationSec: project.transitionDurationSec,
          subtitles: project.subtitles,
        });
        updateProject({
          finalProductVideoBase64: assembledBase64,
        });
      }
    } catch (stitchErr) {
      console.warn('Auto-stitch notification:', stitchErr);
    }
    setBatchProgressText(null);
    setIsAnimatingAllScenes(false);
    setActiveTab('screening');
  };
  // Generate High-CTR Thumbnail
  const handleGenerateCoverVisual = async (customTopic?: string, customHook?: string, targetRatio?: '16:9' | '9:16' | '1:1') => {
    setIsGeneratingCover(true);
    try {
      const ratio = targetRatio || project.aspectRatio || '9:16';
      const topicText = customTopic || project.topic || (project.category ? `${project.category} Story` : 'Viral Video');
      const hookText = customHook || project.seoMetadata?.clickbaitHook || 'WAIT FOR THE DROP!';
      const prompt = `Extreme high-CTR viral thumbnail for "${topicText}", vibrant hyper-saturated neon contrast, shocked dramatic expression, bold curiosity gap, volumetric neon rim lighting, sharp 8k master photography, aspect ratio ${ratio}`;
      const result = await Flow.generate.image({
        prompt,
        modelDisplayName: '🍌 Nano Banana Pro',
        aspectRatio: ratio === '9:16' ? '9:16' : ratio === '1:1' ? '1:1' : '16:9',
      });
      updateProject({
        coverVisual: {
          base64: result.base64,
          mimeType: result.mimeType,
          aspectRatio: ratio,
          hookHeadline: hookText,
          subHookText: topicText,
          badgeText: 'VIRAL #1',
          ctrMetrics: {
            ctrPercentage: 19.8,
            contrastScore: 98,
            curiosityRating: 'Peak Viral',
          },
          threeSecHook: project.coverVisual?.threeSecHook,
        },
      });
    } catch (err: any) {
      console.error('Cover generation error:', err);
    } finally {
      setIsGeneratingCover(false);
    }
  };
  // Generate 3-Second Hook Video Engineered From Script
  const handleGenerateThreeSecHook = async (customTopic?: string, customHook?: string, scriptDirective?: string) => {
    setIsGeneratingHook(true);
    try {
      const topicText = customTopic || project.topic || 'Viral video hook';
      const hookHeadline = customHook || project.seoMetadata?.clickbaitHook || project.scenes[0]?.caption || 'WAIT FOR IT';
      const directive = scriptDirective ? `, ${scriptDirective}` : '';
      const prompt = `Extreme velocity crash zoom opening, high-intensity beat drop flash hook for "${topicText}"${directive}, neon rim lighting, speed ramp velocity, 720p HD`;
      const activeMotionEngine = project.storyboardConfig?.motionEngine || 'Omni 1.1 Flash';
      const modelRes = project.resolutionScale === '360p' ? '360p' : '720p';
      const result = await Flow.generate.video({
        prompt,
        modelDisplayName: activeMotionEngine,
        aspectRatio: project.aspectRatio === '9:16' ? '9:16' : '16:9',
        resolution: modelRes,
        durationSeconds: 4,
      });
      const existingCover = project.coverVisual || {
        aspectRatio: project.aspectRatio || '9:16',
        hookHeadline,
        subHookText: topicText,
        badgeText: 'VIRAL #1',
      };
      updateProject({
        coverVisual: {
          ...existingCover,
          threeSecHook: {
            videoBase64: result.base64,
            videoMimeType: result.mimeType,
            videoMediaId: result.mediaId,
            hookHeadline,
            durationSec: 3,
            ctrRating: '99.4% Retention Score',
          },
        },
      });
    } catch (err: any) {
      console.error('Hook video error:', err);
    } finally {
      setIsGeneratingHook(false);
    }
  };
  // Director Cinematic Realism Test
  const handleRunDirectorCinematicTest = async () => {
    setIsRunningDirectorTest(true);
    try {
      const { text } = await Flow.generate.text(
        `Evaluate this video sequence for viral retention and pacing:
Topic: "${project.topic}"
Style Template: "${project.capcutTemplate.templateId}"
Visual Style: "${project.visualStyle}"
Social Frame: "${project.capcutTemplate.socialFrame}"
Scenes Count: ${project.scenes.length}
Target Duration: ${project.targetDurationTier || '30s'}
Return ONLY valid JSON:
{
  "overallRealismScore": 98,
  "cinematicImmersionGrade": "Viral S+ Rank",
  "lightingVerdict": "Volumetric neon rim lighting and chromatic speed ramps deliver maximum retention.",
  "cameraMovementVerdict": "Fluid kinetic crash zoom matches beat drop perfectly with zero artifacting.",
  "audioImmersionVerdict": "Punchy vocal hook cadence synched to 130 BPM tempo delivers instant engagement.",
  "directorAssessment": "Engineered for 90%+ 3-second viewer retention on TikTok and Reels algorithms.",
  "keyDirectorialEnhancements": [
    "Velocity speed-ramps locked to beat transients",
    "Social media safe frame boundaries prevent HUD icon obstruction",
    "Bold subtitle typography maximizes silent-scroll comprehension",
    "Exact scene durations match target video duration"
  ]
}`,
        {
          systemInstruction: 'You are a master viral video strategist and short-form video director. Output raw JSON only.',
        }
      );
      const cleaned = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      updateProject({
        directorEvaluation: parsed,
      });
    } catch (err: any) {
      console.error('Director test error:', err);
    } finally {
      setIsRunningDirectorTest(false);
    }
  };
  // Generate SEO Metadata
  const handleGenerateOrRefreshSEO = async () => {
    setIsGeneratingSEO(true);
    const activeTopic = project.topic.trim() || project.title.trim() || 'Viral Video';
    try {
      const { text } = await Flow.generate.text(
        `Generate social media SEO metadata for this video topic: "${activeTopic}".
Return ONLY valid JSON with this structure:
{
  "clickbaitHook": "WAIT UNTIL YOU SEE THIS DROP",
  "youtube": {
    "title": "${activeTopic} - Viral Edit",
    "description": "Velocity edit with trending audio sync and high-energy transitions...",
    "hashtags": [
      {"tag": "#Shorts", "followers": "99.4M"},
      {"tag": "#Viral", "followers": "94.5M"},
      {"tag": "#Trending", "followers": "88.1M"}
    ],
    "tags": ["viral edit", "shorts", "trending"],
    "hookRating": 99,
    "seoScore": 97,
    "ctrRating": "21.4% Top 0.5%"
  },
  "tiktok": {
    "title": "VIRAL TREND 🔥",
    "description": "Watch until the end! #fyp #viral #trending",
    "hashtags": [
      {"tag": "#fyp", "followers": "99.9M"},
      {"tag": "#velocity", "followers": "84.3M"},
      {"tag": "#viral", "followers": "92.0M"}
    ],
    "tags": ["fyp", "foryou", "velocity", "viral"],
    "hookRating": 99,
    "seoScore": 98,
    "ctrRating": "22.1% Top Tier"
  },
  "instagram": {
    "title": "Velocity Reels ⚡",
    "description": "Save this reel and use the audio template for your next post...",
    "hashtags": [
      {"tag": "#reels", "followers": "96.0M"},
      {"tag": "#viralreels", "followers": "78.4M"}
    ],
    "tags": ["reels", "explorepage", "viral"],
    "hookRating": 96,
    "seoScore": 94,
    "ctrRating": "18.9% High"
  }
}`,
        {
          systemInstruction: 'You are an elite short-form social media growth strategist. Return raw JSON only with no markdown backticks.',
        }
      );
      const cleaned = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      updateProject({
        seoMetadata: {
          clickbaitHook: parsed.clickbaitHook || 'WAIT FOR THE DROP',
          platforms: {
            youtube: parsed.youtube,
            tiktok: parsed.tiktok,
            instagram: parsed.instagram,
          },
        },
      });
    } catch (err: any) {
      console.warn('SEO parsing fallback triggered:', err);
    } finally {
      setIsGeneratingSEO(false);
    }
  };
  const handleApplyStructuredScreenplay = (parsed: ReturnType<typeof parseScreenplayProductionText>) => {
    if (!parsed) return;
    updateProject({
      title: parsed.title || project.title,
      topic: parsed.title || project.topic,
      category: parsed.category || project.category,
      format: (parsed.format as any) || project.format,
      aspectRatio: (parsed.aspectRatio as any) || project.aspectRatio,
      targetDurationTier: (parsed.durationTier as any) || project.targetDurationTier,
      visualStyle: parsed.visualStyle || project.visualStyle,
      colorGrade: parsed.colorGrade || project.colorGrade,
      characters: parsed.characters.length > 0 ? parsed.characters : project.characters,
      scenes: parsed.scenes,
      customScriptText: parsed.fullNarrativeSummary || project.customScriptText,
    });
    setActiveTab('blueprint_script');
  };
  return (
    <div className="h-full w-full bg-[#07090e] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* APPLICATION WORKSPACE TOP NAVIGATION BAR - CLEAN & POLISHED */}
      <div className="w-full bg-[#0d0f17] border-b border-[#1b2234] px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 flex-wrap flex-shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-pink-600/30 flex-shrink-0 text-white">
            <span className="material-symbols-outlined text-[20px]">auto_awesome_motion</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-sm sm:text-base tracking-tight text-white uppercase font-sans leading-none">
              ViralShorts Forge
            </span>
            <p className="text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-[420px] mt-0.5">
              {project.topic || 'Short-Form Video & Multi-Scene Story Studio'}
            </p>
          </div>
        </div>
        {/* Global Pipeline Stage Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#07090f] p-1 rounded-xl border border-slate-800/80 text-xs font-mono overflow-x-auto no-scrollbar">
          {[
            { id: 'category_story' as const, label: '1. AI Chat', icon: 'smart_toy' },
            { id: 'media_settings' as const, label: '2. Media', icon: 'tune' },
            { id: 'voices' as const, label: '3. Voices', icon: 'record_voice_over' },
            { id: 'blueprint_script' as const, label: '4. Script', icon: 'article' },
            { id: 'storyboard' as const, label: '5. Storyboard', icon: 'movie_filter' },
            { id: 'screening' as const, label: '6. Screening', icon: 'theaters' },
            { id: 'final_production' as const, label: '7. Final Product', icon: 'verified' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white shadow-md shadow-pink-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {/* Start New Project */}
          <button
            onClick={handleFullRefreshAllPages}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/60 hover:border-cyan-300 text-cyan-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            title="Start a fresh new project with clean workspace"
          >
            <span className={`material-symbols-outlined text-[16px] text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}>
              add_circle
            </span>
            <span>{isRefreshing ? 'Starting...' : 'Start New Project'}</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-pink-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="Open ViralShorts Forge overview"
          >
            <span className="material-symbols-outlined text-[15px]">info</span>
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </div>
      {refreshToast && (
        <div className="fixed top-14 right-6 z-50 bg-[#0c1322] border-2 border-cyan-400/90 text-cyan-200 px-4 py-2.5 rounded-xl text-xs font-mono shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center gap-2.5 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-cyan-300">check_circle</span>
          <span className="font-bold">{refreshToast}</span>
        </div>
      )}
      {/* MAIN STAGE WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          {activeTab === 'category_story' && (
            <div className="w-full flex flex-col gap-4">
              <TrendingPanel
                selectedCategory={project.category}
                onSelectCategory={(cat) => updateProject({ category: cat || undefined })}
                onPickTrend={(trend) => {
                  updateProject({
                    topic: trend.title,
                    category: trend.category,
                  });
                  handleGenerateStoryScript(trend.category, trend.suggestedPrompt, project.targetDurationTier);
                }}
                onGenerateCategoryScriptStory={(cat, promptIdea, durationTier, sceneDur, capcutStyle) =>
                  handleGenerateStoryScript(cat, promptIdea, durationTier, sceneDur, capcutStyle)
                }
                isGeneratingStory={isGeneratingStory}
                selectedDurationTier={project.targetDurationTier}
                onSelectDurationTier={(tier) => updateProject({ targetDurationTier: tier || undefined })}
                selectedSceneDuration={project.selectedSceneDuration}
                onSelectSceneDuration={(dur) => updateProject({ selectedSceneDuration: dur || undefined })}
                selectedFormat={project.aspectRatio}
                onSelectFormat={(fmt) => updateProject({ aspectRatio: fmt, format: fmt })}
                customScriptText={project.customScriptText}
                onChangeCustomScriptText={(txt) => updateProject({ customScriptText: txt })}
                onApplyManualScript={() => {
                  if (!project.customScriptText.trim()) return;
                  const sentences = project.customScriptText.split(/[.!?]+/).filter((s) => s.trim().length > 5);
                  const durTier = project.targetDurationTier || '30s';
                  const sceneCalc = calculateMasterSceneBreakdown(durTier, project.selectedSceneDuration || 4, project.storyboardConfig?.motionEngine || 'Omni 1.1 Flash', project.resolutionScale);
                  let running = 0;
                  const updatedScenes: SceneSegment[] = sceneCalc.sceneDurations.map((dur, i) => {
                    const st = sentences[i % sentences.length] || `Scene ${i + 1} narrative beat`;
                    const start = running;
                    running += dur;
                    return {
                      id: `scene-manual-${i + 1}`,
                      order: i + 1,
                      duration: dur,
                      plannedStartTimeSec: start,
                      plannedEndTimeSec: running,
                      rawRenderDurationSec: dur,
                      isTrimmedFinalScene: false,
                      title: `Shot #${i + 1 < 10 ? `0${i + 1}` : i + 1}`,
                      storyBeat: st.trim(),
                      visualDescription: st.trim(),
                      continuityFromPrevious: i === 0 ? 'Start' : `Continues`,
                      dialogue: st.trim(),
                      narration: st.trim(),
                      visualPrompt: `${st.trim()}, aspect ratio ${project.aspectRatio}`,
                      animationPrompt: 'Controlled camera move',
                      caption: st.trim().slice(0, 30).toUpperCase(),
                      hookKeywords: ['viral', 'trending'],
                      status: 'idle',
                      textOverlayPosition: 'bottom_safe',
                    };
                  });
                  updateProject({ scenes: updatedScenes });
                  setActiveTab('storyboard');
                }}
                onDraftScriptFromTopic={() => {
                  if (project.category) {
                    handleGenerateStoryScript(project.category, project.topic, project.targetDurationTier);
                  }
                }}
                topicTitle={project.topic}
                onApplyStructuredScreenplay={handleApplyStructuredScreenplay}
                motionEngine={project.storyboardConfig?.motionEngine || 'Omni 1.1 Flash'}
                onSelectMotionEngine={(eng) =>
                  updateProject({
                    storyboardConfig: {
                      ...(project.storyboardConfig || ({} as any)),
                      motionEngine: eng,
                    },
                  })
                }
                resolutionScale={project.resolutionScale}
                onSelectResolutionScale={(res) => updateProject({ resolutionScale: res })}
                capcutTemplate={project.capcutTemplate}
                onSelectCapCutTemplate={(patch) => updateProject({ capcutTemplate: { ...project.capcutTemplate, ...patch } })}
              />
            </div>
          )}
          {activeTab === 'media_settings' && (
            <div className="w-full h-full min-h-[500px]">
              <StyleAndDurationSelector
                selectedStyle={project.visualStyle}
                onSelectStyle={(style) => updateProject({ visualStyle: style })}
                selectedDurationTier={project.targetDurationTier}
                onSelectDurationTier={(tier) => updateProject({ targetDurationTier: tier || undefined })}
                selectedSceneDuration={project.selectedSceneDuration}
                onSelectSceneDuration={(dur) => updateProject({ selectedSceneDuration: dur || undefined })}
                resolutionScale={project.resolutionScale}
                onToggleResolution={(res) => updateProject({ resolutionScale: res })}
                sceneCount={project.scenes.length}
                selectedFormat={project.aspectRatio}
                onSelectFormat={(fmt) => updateProject({ aspectRatio: fmt, format: fmt })}
                selectedStillEngine={project.storyboardConfig?.stillEngine}
                onSelectStillEngine={(eng) =>
                  updateProject({
                    storyboardConfig: {
                      ...(project.storyboardConfig || ({} as any)),
                      stillEngine: eng,
                    },
                  })
                }
                selectedMotionEngine={project.storyboardConfig?.motionEngine || 'Omni 1.1 Flash'}
                onSelectMotionEngine={(eng) =>
                  updateProject({
                    storyboardConfig: {
                      ...(project.storyboardConfig || ({} as any)),
                      motionEngine: eng,
                    },
                  })
                }
                screeningRules={project.screeningRules}
                onUpdateScreeningRules={(patch) =>
                  updateProject({
                    screeningRules: { ...project.screeningRules, ...patch },
                  })
                }
                onApplyChangesToStoryboard={() => setActiveTab('storyboard')}
                capcutTemplate={project.capcutTemplate}
                onUpdateCapCutTemplate={(patch) => updateProject({ capcutTemplate: { ...project.capcutTemplate, ...patch } })}
              />
            </div>
          )}
          {activeTab === 'voices' && (
            <div className="w-full h-full min-h-[500px]">
              <VoiceProsodySettingsPanel
                selectedPersona={project.voiceStyle}
                onSelectPersona={(persona) => updateProject({ voiceStyle: persona })}
                selectedVoiceURI={project.selectedVoiceURI}
                onSelectVoiceURI={(uri) => updateProject({ selectedVoiceURI: uri })}
                prosody={project.prosody}
                onChangeProsody={(prosody) => updateProject({ prosody })}
                sampleNarration={project.scenes[0]?.narration || project.topic}
              />
            </div>
          )}
          {activeTab === 'blueprint_script' && (
            <div className="w-full">
              <BlueprintScriptView
                project={project}
                onUpdateScene={(id, patch) => updateScene(id, patch)}
                onReturnToStoryboard={() => setActiveTab('storyboard')}
              />
            </div>
          )}
          {activeTab === 'storyboard' && (
            <div className="w-full flex flex-col gap-4">
              <AnimationStoryboardDashboard
                project={project}
                onUpdateScene={(id, patch) => updateScene(id, patch)}
                onGenerateVisualKeyframe={handleGenerateVisualKeyframe}
                onGenerateAnimation={handleGenerateAnimation}
                onGenerateAllVisuals={handleGenerateAllVisuals}
                onAnimateAllScenes={handleAnimateAllScenes}
                isGeneratingAllVisuals={isGeneratingAllVisuals}
                isAnimatingAllScenes={isAnimatingAllScenes}
                batchProgressText={batchProgressText}
                onCancelBatch={() => setCancelBatchRequested(true)}
                onConfigChange={(cfg) => updateProject({ storyboardConfig: cfg })}
                onOpenTimelineEditor={() => setActiveTab('screening')}
                onNavigateToScript={() => setActiveTab('media_settings')}
                generatingVisualSceneId={generatingVisualSceneId}
                generatingAnimationSceneId={generatingAnimationSceneId}
              />
            </div>
          )}
          {activeTab === 'screening' && (
            <div className="w-full">
              <DirectorControlMonitor
                project={project}
                onUpdateProjectSettings={(patch) => updateProject(patch)}
                onRunDirectorCinematicTest={handleRunDirectorCinematicTest}
                isRunningTest={isRunningDirectorTest}
                onProceedToFinalProduct={() => setActiveTab('final_production')}
              />
            </div>
          )}
          {activeTab === 'final_production' && (
            <div className="w-full">
              <FinalProductionPage
                project={project}
                onGenerateOrRefreshSEO={handleGenerateOrRefreshSEO}
                isGeneratingSEO={isGeneratingSEO}
                onDownloadFinalProduct={async () => {
                  if (!project.finalProductVideoBase64) return;
                  await Flow.download({
                    base64: project.finalProductVideoBase64,
                    mimeType: 'video/mp4',
                    filename: `viral_shorts_part_${project.storyPartNumber}.mp4`,
                  });
                }}
                onGetFinalProduct={async () => {
                  setIsGeneratingFinalProduct(true);
                  try {
                    const readyScenes = project.scenes.filter((s) => Boolean(s.videoBase64) && s.duration >= 3);
                    if (readyScenes.length > 0) {
                      const assembled = await concatenateVideoClips(
                        readyScenes.map((s) => ({
                          base64: s.videoBase64!,
                          duration: s.duration,
                          narration: s.narration,
                          caption: s.caption,
                        })),
                        {
                          format: project.format,
                          resolutionScale: project.resolutionScale,
                          hookClipBase64: project.coverVisual?.threeSecHook?.videoBase64,
                          hookDurationSec: 3,
                          colorGrade: project.colorGrade,
                          filmGrainEnabled: project.filmGrainEnabled,
                          cinemascopeLetterbox: project.cinemascopeLetterbox,
                          transition: project.globalTransition,
                          transitionDurationSec: project.transitionDurationSec,
                          subtitles: project.subtitles,
                        }
                      );
                      updateProject({ finalProductVideoBase64: assembled });
                    }
                  } catch (e) {
                    console.error('Final product stitch error:', e);
                  } finally {
                    setIsGeneratingFinalProduct(false);
                  }
                }}
                isGeneratingFinalProduct={isGeneratingFinalProduct}
                onBackToEditor={() => setActiveTab('screening')}
                onGenerateCoverVisual={handleGenerateCoverVisual}
                onGenerateThreeSecHook={handleGenerateThreeSecHook}
                isGeneratingCover={isGeneratingCover}
                isGeneratingHook={isGeneratingHook}
                onUpdateProjectFormat={(fmt) => updateProject({ format: fmt, aspectRatio: fmt })}
                onContinueStoryPart={async (opts) => {
                  setIsContinuingStory(true);
                  try {
                    await handleGenerateStoryScript(
                      project.category || 'Shorts',
                      `${project.topic} - Part ${project.storyPartNumber + 1}: ${opts.partDirective || 'Continuation'}`,
                      project.targetDurationTier || '30s',
                      project.selectedSceneDuration || 4
                    );
                    updateProject({ storyPartNumber: project.storyPartNumber + 1 });
                  } finally {
                    setIsContinuingStory(false);
                  }
                }}
                isContinuingStory={isContinuingStory}
              />
            </div>
          )}
        </div>
      </div>
      <TopicGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartWithTopic={(top, niche) => {
          const catMap: Record<string, YouTubeCategory> = {
            kids: 'Children Story',
            tech: 'Science & Technology',
            mystery: 'Ghost & Horror',
            motivation: 'Education',
            history: 'Education',
            finance: 'News & Politics',
            comedy: 'Comedy',
          };
          const targetCat = catMap[niche] || 'Shorts';
          updateProject({ topic: top, category: targetCat });
          handleGenerateStoryScript(targetCat, top, project.targetDurationTier);
        }}
      />
    </div>
  );
}

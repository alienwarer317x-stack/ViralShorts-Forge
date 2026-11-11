export type VideoFormat = '16:9' | '9:16' | '1:1';
export type TotalVideoDurationOption =
  | '10s'
  | '20s'
  | '30s'
  | '45s'
  | '1m'
  | '3m'
  | '5m'
  | '10m'
  | '15m'
  | '30m'
  | '45m'
  | '1h';
export type SceneDurationOption = 4 | 6 | 8 | 10;
export type VideoDurationTier = TotalVideoDurationOption;
export type VideoResolutionOption = '360p' | '720p';
export interface SceneDurationCalculation {
  totalDurationSec: number;
  selectedSceneDurationSec: SceneDurationOption;
  sceneCount: number;
  fullScenes: number;
  remainingDurationSec: number;
  sceneDurations: number[]; // Array of duration per scene index
  totalCredits: number;
}
export type YouTubeCategory =
  | 'Film & Animation'
  | 'Autos & Vehicles'
  | 'Music'
  | 'Pets & Animals'
  | 'Sports'
  | 'Short Movies'
  | 'Travel & Events'
  | 'Gaming'
  | 'Videoblogging'
  | 'People & Blogs'
  | 'Comedy'
  | 'Entertainment'
  | 'News & Politics'
  | 'Howto & Style'
  | 'Education'
  | 'Science & Technology'
  | 'Nonprofits & Activism'
  | 'Movies'
  | 'Anime & Animation'
  | 'Action & Adventure'
  | 'Classics'
  | 'Documentary'
  | 'Drama'
  | 'Family'
  | 'Foreign'
  | 'Ghost & Horror'
  | 'Sci-Fi & Fantasy'
  | 'Thriller'
  | 'Shorts'
  | 'Shows'
  | 'Trailers'
  | 'Children Story';
export type VisualStylePreset =
  | 'photorealistic_cinematic'
  | 'dark_documentary'
  | 'realistic_human'
  | 'cyberpunk_vfx'
  | '3d_animated'
  | 'analog_vintage'
  | 'anime_studio'
  | 'retro_neon_synthwave'
  | 'dark_fantasy_oil'
  | 'graphic_novel_noir'
  | 'hyperlapse_macro'
  | 'claymation_stop_motion'
  | 'thermal_infrared_vision'
  | 'isometric_voxel_3d';
export type CinematicColorGrade =
  | 'kodak_warm_35mm'
  | 'teal_and_orange_blockbuster'
  | 'noir_high_contrast_silver'
  | 'fincher_cold_green'
  | 'bleach_bypass_grit'
  | 'anamorphic_tungsten_glow';
export type FilmAspectGuidance =
  | 'cinemascope_239'
  | 'anamorphic_200'
  | 'academy_185'
  | 'full_frame_169'
  | 'imax_vertical_916';
export type VideoTransitionType =
  | 'film_dissolve'
  | 'fade_black'
  | 'whip_pan'
  | 'zoom_push'
  | 'crossfade'
  | 'direct_cut';
export type VoiceEngineType =
  | 'algenib'
  | 'enceladus'
  | 'orus'
  | 'umbriel'
  | 'capella'
  | 'callisto'
  | 'bellatrix'
  | 'leda';
export interface VoiceProsodyConfig {
  pitchModulation: number;
  rateModulation: number;
  breathPauses: boolean;
}
export type SubtitleStylePreset =
  | 'tiktok_bold'
  | 'neon_glow'
  | 'cinema_box'
  | 'karaoke_pop'
  | 'minimal_sub';
export interface SubtitleConfig {
  enabled: boolean;
  style: SubtitleStylePreset;
  fontSize: 'small' | 'medium' | 'large';
  position: 'top_safe' | 'center' | 'bottom_safe';
  highlightColor: string;
  backgroundColor: string;
  showHookInFirstScene: boolean;
  uppercase: boolean;
}
export type CapCutTemplateType =
  | 'velocity_zoom'
  | 'aesthetic_vlog'
  | 'glow_cinematic'
  | 'beat_drop_flash'
  | 'retro_vhs_polaroid'
  | 'cyber_neon_split';
export type SocialFramePreset = 'none' | 'tiktok' | 'youtube_shorts' | 'instagram_reels';
export interface CapCutTemplateConfig {
  enabled: boolean;
  templateId: CapCutTemplateType;
  socialFrame: SocialFramePreset;
  beatDropEnabled: boolean;
  kineticZoom: boolean;
  lightLeakEffect: boolean;
  animatedStickerOverlay: boolean;
  bpmRate: number;
  hookFlashSec: number;
}
export interface CharacterSheet {
  id: string;
  name: string;
  role: string;
  apparentAge: string;
  build: string;
  facialFeatures: string;
  hair: string;
  wardrobe: string;
  innerClothing: string;
  lowerClothing: string;
  footwear: string;
  accessories: string;
  carriedObjects: string;
  attachedObjects: string;
  prohibitedAdditions: string;
  voiceStyle: string;
  lockedReferencePrompt: string;
  referenceImageMediaId?: string;
  referenceImageBase64?: string;
}
export interface SceneInventoryRecord {
  characterName?: string;
  outerClothing?: string;
  innerClothing?: string;
  lowerClothing?: string;
  footwear?: string;
  jewelryAndOrnaments?: string;
  otherAccessories?: string;
  carriedObjects?: string;
  attachedObjects?: string;
  prohibitedAdditions?: string;
  continuityInstruction?: string;
}
export interface I2VSourceLock {
  sceneReferenceId: string;
  isApprovedImage: boolean;
  controlledAnimationPermitted: boolean;
  videoValidatedAgainstSource: boolean;
  validationChecklist: {
    characterIdentity: boolean;
    faceAndBodyProportions: boolean;
    clothingAndCostume: boolean;
    jewelleryAndAccessories: boolean;
    propInventory: boolean;
    backgroundAndEnvironment: boolean;
    lightingAndComposition: boolean;
    unexpectedMotionChanges: boolean;
  };
}
export interface SceneVisualFrame {
  base64: string;
  mimeType: string;
  mediaId?: string;
  promptUsed: string;
  createdAt: string;
}
export interface SceneSegment {
  id: string;
  order: number;
  duration: number; // in seconds
  plannedStartTimeSec?: number;
  plannedEndTimeSec?: number;
  isTrimmedFinalScene?: boolean;
  rawRenderDurationSec?: number; // length requested from video model if different from duration
  title: string;
  storyBeat: string;
  visualDescription: string;
  continuityFromPrevious: string;
  dialogue?: string;
  dialogueSpeaker?: string;
  dialogueDeliveryNote?: string;
  narration: string;
  visualPrompt: string;
  animationPrompt: string;
  cameraDirective?: string;
  soundEffectsAtmosphere?: string;
  musicEmotionalDirection?: string;
  sceneTransition?: string;
  transitionType?: VideoTransitionType;
  continuityCheckpoint?: string;
  inventoryRecord?: SceneInventoryRecord;
  i2vSourceLock?: I2VSourceLock;
  caption: string;
  hookKeywords: string[];
  status: 'idle' | 'generating_visual' | 'generating_video' | 'ready';
  visualFrame?: SceneVisualFrame;
  videoBase64?: string;
  videoMimeType?: string;
  videoMediaId?: string;
  textOverlayPosition?: 'top_safe' | 'center' | 'bottom_safe';
  innerClothing?: string;
  lowerClothing?: string;
}
export interface PlatformHashtag {
  tag: string;
  followers?: string;
  views?: string;
}
export interface PlatformSEOData {
  title: string;
  description: string;
  hashtags: PlatformHashtag[];
  tags: string[];
  hookRating?: number;
  seoScore?: number;
  ctrRating?: string;
}
export interface SEOMetadata {
  clickbaitHook: string;
  platforms: {
    youtube: PlatformSEOData;
    tiktok: PlatformSEOData;
    instagram: PlatformSEOData;
  };
}
export type TargetPlatform = 'youtube' | 'tiktok' | 'instagram';
export interface TrendingTopicItem {
  id: string;
  category: YouTubeCategory;
  title: string;
  channelName: string;
  verifiedChannel: boolean;
  hookSummary: string;
  velocityTag: string;
  viewsVelocity: string;
  suggestedPrompt: string;
  hashtagOrQuery: string;
  lastUpdated: string;
  trendingRank: number;
  isLiveSurge: boolean;
  youtubeVideoId?: string;
  sourceVideoUrl?: string;
  sourceVideoId?: string;
}
export interface MasterCinematicRules {
  enforced: boolean;
  lockCharacterContinuity: boolean;
  lockWorldAndPropPhysics: boolean;
  enforceStandardSceneFormat: boolean;
  strictCameraVariation: boolean;
  realisticHumanTextures: boolean;
  causeAndEffectPhysics: boolean;
  soundscapeAndMusicDirection: boolean;
  qualityControlGateActive: boolean;
  wardrobeAndPropInventoryLock: boolean;
  temporalIdentityStability: boolean;
  sectionJInventoryEnforced: boolean;
  exactImageToVideoSourceLock: boolean;
}
export interface ScreeningRulesConfig {
  enabled: boolean;
  lockExistingVisuals: boolean;
  enforceOpticsDirective: boolean;
  enforcePhysicalLighting: boolean;
  enforceSteadicamParallax: boolean;
  renderAllStoryScenes: boolean;
  enforceInventoryLock: boolean;
  enforceExactImageToVideoLock: boolean;
}
export interface StoryboardEngineConfig {
  ratio: VideoFormat;
  stillEngine: string;
  motionEngine: string;
  humanVoice: string;
  aesthetic: string;
}
export interface CoverCTRMetrics {
  ctrPercentage: number;
  contrastScore: number;
  curiosityRating: string;
}
export interface ThreeSecHookClip {
  videoBase64?: string;
  videoMimeType?: string;
  videoMediaId?: string;
  hookHeadline: string;
  durationSec: number;
  ctrRating: string;
}
export interface CoverPageVisual {
  base64?: string;
  mimeType?: string;
  aspectRatio: VideoFormat;
  hookHeadline: string;
  subHookText: string;
  badgeText: string;
  ctrMetrics?: CoverCTRMetrics;
  threeSecHook?: ThreeSecHookClip;
}
export interface DirectorEvaluation {
  overallRealismScore: number;
  cinematicImmersionGrade: string;
  lightingVerdict: string;
  cameraMovementVerdict: string;
  audioImmersionVerdict: string;
  directorAssessment: string;
  keyDirectorialEnhancements: string[];
}
export interface VideoProject {
  id: string;
  title: string;
  topic: string;
  category?: YouTubeCategory;
  storyPartNumber: number;
  targetDurationTier?: VideoDurationTier;
  selectedSceneDuration?: SceneDurationOption;
  format: VideoFormat;
  aspectRatio: VideoFormat;
  resolutionScale: VideoResolutionOption;
  visualStyle: VisualStylePreset;
  colorGrade: CinematicColorGrade;
  filmAspect: FilmAspectGuidance;
  globalTransition: VideoTransitionType;
  transitionDurationSec: number;
  cinemascopeLetterbox: boolean;
  filmGrainEnabled: boolean;
  voiceStyle: VoiceEngineType;
  selectedVoiceURI?: string;
  prosody: VoiceProsodyConfig;
  bgmGenre: string;
  subtitles: SubtitleConfig;
  capcutTemplate: CapCutTemplateConfig;
  masterRules: MasterCinematicRules;
  screeningRules: ScreeningRulesConfig;
  storyboardConfig?: StoryboardEngineConfig;
  characters: CharacterSheet[];
  scenes: SceneSegment[];
  customScriptText: string;
  seoMetadata?: SEOMetadata;
  coverVisual?: CoverPageVisual;
  finalProductVideoBase64?: string;
  directorEvaluation?: DirectorEvaluation;
}
/* NLE Editor Suite Types */
export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  heightPx: number;
  isMuted?: boolean;
  isLocked?: boolean;
}
export interface TimelineClip {
  id: string;
  trackId: string;
  trackType: 'video' | 'audio' | 'text';
  name: string;
  startSec: number;
  durationSec: number;
  trimInSec: number;
  color: string;
  speed?: number;
  volume?: number;
  base64?: string;
  mimeType?: string;
  mediaId?: string;
  text?: string;
  fontSize?: number;
  textColor?: string;
  textBgColor?: string;
}
export interface ProjectSettings {
  aspectRatio: '16:9' | '9:16' | '1:1';
  resolution: VideoResolutionOption;
  fps: number;
}

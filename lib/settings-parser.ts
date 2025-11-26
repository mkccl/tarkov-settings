export type GameSettings = {
  Version?: number;
  Language?: string;
  FieldOfView?: number;
  HeadBobbing?: number;
  [key: string]: any;
};

export type SoundSettings = {
  OverallVolume?: number;
  InterfaceVolume?: number;
  ChatVolume?: number;
  MusicVolume?: number;
  HideoutVolume?: number;
  VoipEnabled?: boolean;
  VoiceChatVolume?: number;
  MicrophoneSensitivity?: number;
  [key: string]: any;
};

export type PostFxSettings = {
  EnablePostFx?: boolean;
  Brightness?: number;
  Saturation?: number;
  Clarity?: number;
  Colorfulness?: number;
  LumaSharpen?: number;
  AdaptiveSharpen?: number;
  ColorFilterType?: string;
  Intensity?: number;
  [key: string]: any;
};

export type GraphicsSettings = {
  DisplaySettings?: {
    Display?: number;
    FullScreenMode?: number;
    Resolution?: {
      Width?: number;
      Height?: number;
    };
  };
  GraphicsQuality?: string | null;
  ShadowsQuality?: number;
  TextureQuality?: number;
  VSync?: boolean;
  AntiAliasing?: string;
  [key: string]: any;
};

export type ControlSettings = {
  MouseSensitivity?: number;
  MouseAimingSensitivity?: number;
  OpticSensitivity?: number;
  [key: string]: any;
};

export type ParsedSettings = {
  game: GameSettings;
  sound: SoundSettings;
  postFx: PostFxSettings;
  graphics: GraphicsSettings;
  control: ControlSettings;
};

/**
 * Parse all settings for a profile (settings are already JSON in the database)
 */
export function parseSettings(settings: {
  gameSettings: any;
  soundSettings: any;
  postFxSettings: any;
  graphicsSettings: any;
  controlSettings: any;
}): ParsedSettings {
  return {
    game: settings.gameSettings as GameSettings,
    sound: settings.soundSettings as SoundSettings,
    postFx: settings.postFxSettings as PostFxSettings,
    graphics: settings.graphicsSettings as GraphicsSettings,
    control: settings.controlSettings as ControlSettings,
  };
}

/**
 * Extract key settings for display
 */
export function extractKeySettings(parsed: ParsedSettings) {
  return {
    // Game Settings
    fov: parsed.game.FieldOfView,
    headBobbing: parsed.game.HeadBobbing,
    language: parsed.game.Language,

    // Sound Settings
    overallVolume: parsed.sound.OverallVolume,
    voipEnabled: parsed.sound.VoipEnabled,
    voiceChatVolume: parsed.sound.VoiceChatVolume,

    // PostFX Settings
    postFxEnabled: parsed.postFx.EnablePostFx,
    brightness: parsed.postFx.Brightness,
    saturation: parsed.postFx.Saturation,
    clarity: parsed.postFx.Clarity,
    lumaSharpen: parsed.postFx.LumaSharpen,

    // Graphics Settings
    resolution: parsed.graphics.DisplaySettings?.Resolution
      ? `${parsed.graphics.DisplaySettings.Resolution.Width}x${parsed.graphics.DisplaySettings.Resolution.Height}`
      : "Unknown",
    textureQuality: parsed.graphics.TextureQuality,
    shadowsQuality: parsed.graphics.ShadowsQuality,
    antiAliasing: parsed.graphics.AntiAliasing,
    vsync: parsed.graphics.VSync,

    // Control Settings
    mouseSensitivity: parsed.control.MouseSensitivity,
    aimSensitivity: parsed.control.MouseAimingSensitivity,
    opticSensitivity: parsed.control.OpticSensitivity,
  };
}

/**
 * Extract keybinds from control settings
 */
export function extractKeybinds(controlSettings: ControlSettings) {
  const keybinds: { [key: string]: string } = {};
  const excludeKeys = ['MouseSensitivity', 'MouseAimingSensitivity', 'OpticSensitivity'];

  Object.entries(controlSettings).forEach(([key, value]) => {
    if (!excludeKeys.includes(key) && value !== undefined && value !== null) {
      // Format the key name (e.g., "MoveForward" -> "Move Forward")
      const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
      keybinds[formattedKey] = String(value);
    }
  });

  return keybinds;
}

/**
 * Format all settings for display
 */
export function formatAllSettings(parsed: ParsedSettings) {
  return {
    game: formatSettingsObject(parsed.game),
    sound: formatSettingsObject(parsed.sound),
    postFx: formatSettingsObject(parsed.postFx),
    graphics: formatSettingsObject(parsed.graphics),
    control: formatSettingsObject(parsed.control),
  };
}

/**
 * Helper to format a settings object
 */
function formatSettingsObject(obj: any): { [key: string]: any } {
  const formatted: { [key: string]: any } = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Format the key name
      const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();

      // Handle nested objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        formatted[formattedKey] = formatSettingsObject(value);
      } else {
        formatted[formattedKey] = value;
      }
    }
  });

  return formatted;
}

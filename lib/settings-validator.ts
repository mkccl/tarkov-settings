/**
 * Validates Tarkov settings files to ensure they are legitimate config files
 */

export type SettingsFileType = "game" | "sound" | "postfx" | "graphics" | "control";

export interface ValidationResult {
  isValid: boolean;
  fileType?: SettingsFileType;
  error?: string;
}

/**
 * Validate filename matches expected Tarkov settings file names
 */
export function validateFileName(fileName: string): ValidationResult {
  const lowerName = fileName.toLowerCase();

  const validNames = {
    "game.ini": "game" as SettingsFileType,
    "sound.ini": "sound" as SettingsFileType,
    "postfx.ini": "postfx" as SettingsFileType,
    "graphics.ini": "graphics" as SettingsFileType,
    "control.ini": "control" as SettingsFileType,
  };

  const fileType = validNames[lowerName as keyof typeof validNames];

  if (!fileType) {
    return {
      isValid: false,
      error: `Invalid file name "${fileName}". Expected: Game.ini, Sound.ini, PostFx.ini, Graphics.ini, or Control.ini`,
    };
  }

  return { isValid: true, fileType };
}

/**
 * Validate Game.ini structure
 */
function validateGameSettings(data: any): boolean {
  return (
    typeof data === "object" &&
    typeof data.Version === "number" &&
    typeof data.Language === "string" &&
    typeof data.FieldOfView === "number" &&
    typeof data.HeadBobbing === "number"
  );
}

/**
 * Validate Sound.ini structure
 */
function validateSoundSettings(data: any): boolean {
  return (
    typeof data === "object" &&
    typeof data.OverallVolume === "number" &&
    typeof data.VoipEnabled === "boolean" &&
    typeof data.MusicVolume === "number"
  );
}

/**
 * Validate PostFx.ini structure
 */
function validatePostFxSettings(data: any): boolean {
  return (
    typeof data === "object" &&
    typeof data.EnablePostFx === "boolean" &&
    typeof data.Brightness === "number" &&
    typeof data.Clarity === "number" &&
    typeof data.LumaSharpen === "number"
  );
}

/**
 * Validate Graphics.ini structure
 */
function validateGraphicsSettings(data: any): boolean {
  return (
    typeof data === "object" &&
    typeof data.Version === "number" &&
    typeof data.DisplaySettings === "object" &&
    data.DisplaySettings !== null &&
    typeof data.TextureQuality === "number" &&
    typeof data.VSync === "boolean" &&
    typeof data.AntiAliasing === "string"
  );
}

/**
 * Validate Control.ini structure
 */
function validateControlSettings(data: any): boolean {
  return (
    typeof data === "object" &&
    typeof data.Version === "number" &&
    typeof data.MouseSensitivity === "number" &&
    Array.isArray(data.axisBindings) &&
    Array.isArray(data.keyBindings) &&
    data.axisBindings.length > 0 &&
    data.keyBindings.length > 0
  );
}

/**
 * Validate file content based on type
 */
export function validateFileContent(
  data: any,
  fileType: SettingsFileType
): ValidationResult {
  let isValid = false;
  let error = "";

  switch (fileType) {
    case "game":
      isValid = validateGameSettings(data);
      error = "Invalid Game.ini file. Missing required fields: Version, Language, FieldOfView, or HeadBobbing";
      break;
    case "sound":
      isValid = validateSoundSettings(data);
      error = "Invalid Sound.ini file. Missing required fields: OverallVolume, VoipEnabled, or MusicVolume";
      break;
    case "postfx":
      isValid = validatePostFxSettings(data);
      error = "Invalid PostFx.ini file. Missing required fields: EnablePostFx, Brightness, Clarity, or LumaSharpen";
      break;
    case "graphics":
      isValid = validateGraphicsSettings(data);
      error = "Invalid Graphics.ini file. Missing required fields: Version, DisplaySettings, TextureQuality, VSync, or AntiAliasing";
      break;
    case "control":
      isValid = validateControlSettings(data);
      error = "Invalid Control.ini file. Missing required fields: Version, MouseSensitivity, axisBindings, or keyBindings";
      break;
  }

  if (!isValid) {
    return { isValid: false, error };
  }

  return { isValid: true, fileType };
}

/**
 * Validate complete settings file (filename + content)
 */
export function validateSettingsFile(
  fileName: string,
  data: any
): ValidationResult {
  // First validate filename
  const nameValidation = validateFileName(fileName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  // Then validate content
  return validateFileContent(data, nameValidation.fileType!);
}

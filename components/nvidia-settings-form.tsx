"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface NvidiaSettings {
  brightness: number;
  contrast: number;
  gamma: number;
  digitalVibrance: number;
  hue: number;
}

interface NvidiaSettingsFormProps {
  settings: NvidiaSettings;
  onChange: (settings: NvidiaSettings) => void;
}

export function NvidiaSettingsForm({
  settings,
  onChange,
}: NvidiaSettingsFormProps) {
  const updateSetting = (key: keyof NvidiaSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Brightness</Label>
          <span className="text-sm text-muted-foreground">
            {settings.brightness}%
          </span>
        </div>
        <Slider
          value={[settings.brightness]}
          onValueChange={([value]) => updateSetting("brightness", value)}
          min={0}
          max={100}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Contrast</Label>
          <span className="text-sm text-muted-foreground">
            {settings.contrast}%
          </span>
        </div>
        <Slider
          value={[settings.contrast]}
          onValueChange={([value]) => updateSetting("contrast", value)}
          min={0}
          max={100}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Gamma</Label>
          <span className="text-sm text-muted-foreground">
            {settings.gamma}
          </span>
        </div>
        <Slider
          value={[settings.gamma]}
          onValueChange={([value]) => updateSetting("gamma", value)}
          min={0.4}
          max={2.8}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Digital Vibrance</Label>
          <span className="text-sm text-muted-foreground">
            {settings.digitalVibrance}%
          </span>
        </div>
        <Slider
          value={[settings.digitalVibrance]}
          onValueChange={([value]) => updateSetting("digitalVibrance", value)}
          min={0}
          max={100}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Hue</Label>
          <span className="text-sm text-muted-foreground">{settings.hue}°</span>
        </div>
        <Slider
          value={[settings.hue]}
          onValueChange={([value]) => updateSetting("hue", value)}
          min={0}
          max={359}
          step={0.1}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Note: These are typical NVIDIA Control Panel ranges. Adjust according to
        your actual settings.
      </p>
    </div>
  );
}

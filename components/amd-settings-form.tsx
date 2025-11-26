"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AmdSettings {
  colorTempControl: boolean;
  brightness: number;
  hue: number;
  contrast: number;
  saturation: number;
  displayColorEnhancement:
    | "DynamicContrast"
    | "VividGaming"
    | "UseGlobalSettings"
    | "Disabled";
  dynamicContrastValue: number;
}

interface AmdSettingsFormProps {
  settings: AmdSettings;
  onChange: (settings: AmdSettings) => void;
}

export function AmdSettingsForm({ settings, onChange }: AmdSettingsFormProps) {
  const updateSetting = (key: keyof AmdSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="color-temp">Color Temperature Control</Label>
        <Switch
          id="color-temp"
          checked={settings.colorTempControl}
          onCheckedChange={(checked) =>
            updateSetting("colorTempControl", checked)
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Brightness</Label>
          <span className="text-sm text-muted-foreground">
            {settings.brightness}
          </span>
        </div>
        <Slider
          value={[settings.brightness]}
          onValueChange={([value]) => updateSetting("brightness", value)}
          min={-100}
          max={100}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Hue</Label>
          <span className="text-sm text-muted-foreground">
            {settings.hue}°
          </span>
        </div>
        <Slider
          value={[settings.hue]}
          onValueChange={([value]) => updateSetting("hue", value)}
          min={-30}
          max={30}
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
          max={200}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Saturation</Label>
          <span className="text-sm text-muted-foreground">
            {settings.saturation}%
          </span>
        </div>
        <Slider
          value={[settings.saturation]}
          onValueChange={([value]) => updateSetting("saturation", value)}
          min={0}
          max={200}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Display Color Enhancement</Label>
        <Select
          value={settings.displayColorEnhancement}
          onValueChange={(value) =>
            updateSetting("displayColorEnhancement", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Disabled">Disabled</SelectItem>
            <SelectItem value="VividGaming">Vivid Gaming</SelectItem>
            <SelectItem value="DynamicContrast">Dynamic Contrast</SelectItem>
            <SelectItem value="UseGlobalSettings">
              Use Global Settings
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {settings.displayColorEnhancement === "DynamicContrast" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Dynamic Contrast Value</Label>
            <span className="text-sm text-muted-foreground">
              {settings.dynamicContrastValue}
            </span>
          </div>
          <Slider
            value={[settings.dynamicContrastValue]}
            onValueChange={([value]) =>
              updateSetting("dynamicContrastValue", value)
            }
            min={0}
            max={10}
            step={1}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Note: These are typical AMD Radeon Settings ranges. Adjust according to
        your actual settings.
      </p>
    </div>
  );
}

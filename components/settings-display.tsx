"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface KeySettings {
  fov?: number;
  headBobbing?: number;
  language?: string;
  overallVolume?: number;
  voipEnabled?: boolean;
  voiceChatVolume?: number;
  postFxEnabled?: boolean;
  brightness?: number;
  saturation?: number;
  clarity?: number;
  lumaSharpen?: number;
  resolution?: string;
  textureQuality?: number;
  shadowsQuality?: number;
  antiAliasing?: string;
  vsync?: boolean;
  mouseSensitivity?: number;
  aimSensitivity?: number;
  opticSensitivity?: number;
}

interface SettingsDisplayProps {
  keySettings: KeySettings;
  keybinds: { [key: string]: string };
  allSettings: {
    game: { [key: string]: any };
    sound: { [key: string]: any };
    postFx: { [key: string]: any };
    graphics: { [key: string]: any };
    control: { [key: string]: any };
  };
}

function formatValue(value: any): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function SettingRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{formatValue(value)}</span>
    </div>
  );
}

function NestedSettings({ settings }: { settings: { [key: string]: any } }) {
  return (
    <div className="space-y-1 text-sm">
      {Object.entries(settings).map(([key, value]) => {
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return (
            <div key={key} className="mt-3">
              <h5 className="mb-1 font-semibold text-foreground">{key}</h5>
              <div className="ml-4 space-y-1">
                <NestedSettings settings={value} />
              </div>
            </div>
          );
        }
        return <SettingRow key={key} label={key} value={value} />;
      })}
    </div>
  );
}

export function SettingsDisplay({
  keySettings,
  keybinds,
  allSettings,
}: SettingsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="key-settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="key-settings">Key Settings</TabsTrigger>
            {/*<TabsTrigger value="keybinds">Keybinds</TabsTrigger>*/}
            <TabsTrigger value="all-settings">All Settings</TabsTrigger>
          </TabsList>

          {/* Key Settings Tab */}
          <TabsContent value="key-settings" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">Display</h4>
                <div className="space-y-1 text-sm">
                  <SettingRow label="FOV" value={keySettings.fov} />
                  <SettingRow
                    label="Head Bobbing"
                    value={keySettings.headBobbing}
                  />
                  <SettingRow
                    label="Resolution"
                    value={keySettings.resolution}
                  />
                  <SettingRow label="VSync" value={keySettings.vsync} />
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Graphics</h4>
                <div className="space-y-1 text-sm">
                  <SettingRow
                    label="Texture Quality"
                    value={keySettings.textureQuality}
                  />
                  <SettingRow
                    label="Shadows Quality"
                    value={keySettings.shadowsQuality}
                  />
                  <SettingRow
                    label="Anti-Aliasing"
                    value={keySettings.antiAliasing}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">PostFX</h4>
                <div className="space-y-1 text-sm">
                  <SettingRow
                    label="PostFX Enabled"
                    value={keySettings.postFxEnabled}
                  />
                  <SettingRow
                    label="Brightness"
                    value={keySettings.brightness}
                  />
                  <SettingRow
                    label="Saturation"
                    value={keySettings.saturation}
                  />
                  <SettingRow label="Clarity" value={keySettings.clarity} />
                  <SettingRow
                    label="Luma Sharpen"
                    value={keySettings.lumaSharpen}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Audio</h4>
                <div className="space-y-1 text-sm">
                  <SettingRow
                    label="Overall Volume"
                    value={keySettings.overallVolume}
                  />
                  <SettingRow
                    label="VOIP Enabled"
                    value={keySettings.voipEnabled}
                  />
                  <SettingRow
                    label="Voice Chat Volume"
                    value={keySettings.voiceChatVolume}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Controls</h4>
                <div className="space-y-1 text-sm">
                  <SettingRow
                    label="Mouse Sensitivity"
                    value={keySettings.mouseSensitivity}
                  />
                  <SettingRow
                    label="Aim Sensitivity"
                    value={keySettings.aimSensitivity}
                  />
                  <SettingRow
                    label="Optic Sensitivity"
                    value={keySettings.opticSensitivity}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Keybinds Tab */}
          {/*<TabsContent value="keybinds" className="mt-4">*/}
          {/*  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">*/}
          {/*    {Object.entries(keybinds).length > 0 ? (*/}
          {/*      Object.entries(keybinds).map(([action, key]) => (*/}
          {/*        <div*/}
          {/*          key={action}*/}
          {/*          className="flex items-center justify-between rounded-lg border border-border p-3"*/}
          {/*        >*/}
          {/*          <span className="text-sm text-muted-foreground">*/}
          {/*            {action}*/}
          {/*          </span>*/}
          {/*          <Badge variant="secondary" className="font-mono">*/}
          {/*            {key}*/}
          {/*          </Badge>*/}
          {/*        </div>*/}
          {/*      ))*/}
          {/*    ) : (*/}
          {/*      <p className="col-span-full text-sm text-muted-foreground">*/}
          {/*        No keybinds found*/}
          {/*      </p>*/}
          {/*    )}*/}
          {/*  </div>*/}
          {/*</TabsContent>*/}

          {/* All Settings Tab */}
          <TabsContent value="all-settings" className="mt-4">
            <div className="space-y-6">
              {/* Game Settings */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Game Settings</h3>
                <NestedSettings settings={allSettings.game} />
              </div>

              {/* Graphics Settings */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Graphics Settings
                </h3>
                <NestedSettings settings={allSettings.graphics} />
              </div>

              {/* PostFX Settings */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">PostFX Settings</h3>
                <NestedSettings settings={allSettings.postFx} />
              </div>

              {/* Sound Settings */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Sound Settings</h3>
                <NestedSettings settings={allSettings.sound} />
              </div>

              {/* Control Settings */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Control Settings</h3>
                <NestedSettings settings={allSettings.control} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

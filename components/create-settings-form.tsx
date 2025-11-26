"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, AlertCircle, FolderOpen, Info } from "lucide-react";
import { createSettingsProfile } from "@/lib/actions/settings-profiles";
import { NvidiaSettingsForm } from "@/components/nvidia-settings-form";
import { AmdSettingsForm } from "@/components/amd-settings-form";
import { validateSettingsFile } from "@/lib/settings-validator";
import { Toast } from "next/dist/next-devtools/dev-overlay/components/toast";
import { toast } from "sonner";

interface CreateSettingsFormProps {
  userId: string;
  twitchUsername: string;
}

export function CreateSettingsForm({
  userId,
  twitchUsername,
}: CreateSettingsFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showNvidia, setShowNvidia] = useState(true);
  const [showAmd, setShowAmd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Settings files
  const [gameSettings, setGameSettings] = useState<any>(null);
  const [soundSettings, setSoundSettings] = useState<any>(null);
  const [postFxSettings, setPostFxSettings] = useState<any>(null);
  const [graphicsSettings, setGraphicsSettings] = useState<any>(null);
  const [controlSettings, setControlSettings] = useState<any>(null);

  // GPU Settings
  const [nvidiaSettings, setNvidiaSettings] = useState({
    brightness: 50,
    contrast: 50,
    gamma: 100,
    digitalVibrance: 50,
    hue: 0,
  });

  const [amdSettings, setAmdSettings] = useState({
    colorTempControl: false,
    brightness: 0,
    hue: 0,
    contrast: 100,
    saturation: 100,
    displayColorEnhancement: "Disabled" as
      | "DynamicContrast"
      | "VividGaming"
      | "UseGlobalSettings"
      | "Disabled",
    dynamicContrastValue: 5,
  });

  const handleFileUpload = async (file: File, setter: (data: any) => void) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Validate the file
      const validation = validateSettingsFile(file.name, json);
      if (!validation.isValid) {
        triggerErrorToast(validation.error || "Invalid settings file");
        return;
      }

      setter(json);
    } catch (err) {
      triggerErrorToast(
        `Failed to parse ${file.name}. Make sure it's a valid JSON file.`,
      );
    }
  };

  const handleMultipleFilesUpload = async (files: FileList | File[] | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    let hasErrors = false;
    let uploadedCount = 0;

    for (const file of filesArray) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);

        // Validate the file
        const validation = validateSettingsFile(file.name, json);
        if (!validation.isValid) {
          triggerErrorToast(validation.error || "Invalid settings file");
          hasErrors = true;
          continue;
        }

        // Set the appropriate state based on validated file type
        switch (validation.fileType) {
          case "game":
            setGameSettings(json);
            uploadedCount++;
            break;
          case "sound":
            setSoundSettings(json);
            uploadedCount++;
            break;
          case "postfx":
            setPostFxSettings(json);
            uploadedCount++;
            break;
          case "graphics":
            setGraphicsSettings(json);
            uploadedCount++;
            break;
          case "control":
            setControlSettings(json);
            uploadedCount++;
            break;
        }
      } catch (err) {
        triggerErrorToast(
          `Failed to parse ${file.name}. Make sure it's a valid JSON file.`,
        );
        hasErrors = true;
      }
    }

    if (!hasErrors && uploadedCount > 0) {
      triggerSuccessToast(
        `Successfully validated and uploaded ${uploadedCount} file${uploadedCount > 1 ? "s" : ""}`,
      );
    }
  };

  const openDirectoryPicker = async () => {
    try {
      // Check if File System Access API is supported
      if ("showDirectoryPicker" in window) {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: "read",
          startIn: "documents",
        });

        // Read all files in the directory
        const files: File[] = [];
        for await (const entry of (dirHandle as any).values()) {
          if (
            entry.kind === "file" &&
            (entry.name.endsWith(".ini") || entry.name.endsWith(".json"))
          ) {
            const file = await entry.getFile();
            files.push(file);
          }
        }

        if (files.length > 0) {
          handleMultipleFilesUpload(files);
        } else {
          triggerErrorToast(
            "No .ini or .json files found in the selected directory",
          );
        }
      } else {
        triggerErrorToast(
          "Directory picker not supported in this browser. Please use Chrome, Edge, or Opera.",
        );
      }
    } catch (err: any) {
      // User cancelled or error occurred
      if (err.name !== "AbortError") {
        console.error("Error opening directory:", err);
        triggerErrorToast("Failed to open directory picker");
      }
    }
  };

  const triggerErrorToast = (message: string) => {
    toast.warning("An error occurred", {
      description: message,
      position: "bottom-right",
    });
  };

  const triggerSuccessToast = (message: string) => {
    toast.success("Success", {
      description: message,
      position: "bottom-right",
    });
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      triggerErrorToast("Please enter a profile name");
      return;
    }

    if (
      !gameSettings ||
      !soundSettings ||
      !postFxSettings ||
      !graphicsSettings ||
      !controlSettings
    ) {
      triggerErrorToast("Please upload all 5 settings files");
      return;
    }

    if (!showNvidia && !showAmd) {
      triggerErrorToast("Please select at least one GPU brand");
      return;
    }

    startTransition(async () => {
      try {
        // Determine GPU brand configuration
        const gpuBrand =
          showNvidia && showAmd ? "BOTH" : showNvidia ? "NVIDIA" : "AMD";

        const profile = await createSettingsProfile(userId, {
          name: name.trim(),
          description: description.trim() || undefined,
          gpuBrand,
          nvidiaSettings: showNvidia ? nvidiaSettings : undefined,
          amdSettings: showAmd ? amdSettings : undefined,
          gameSettings,
          soundSettings,
          postFxSettings,
          graphicsSettings,
          controlSettings,
          published: publish,
        });

        // Redirect to the profile page
        router.push(`/${twitchUsername}/settings/${profile.id}`);
      } catch (err) {
        triggerErrorToast(
          "Failed to create settings profile. Please try again.",
        );
      }
    });
  };

  const allFilesUploaded =
    gameSettings &&
    soundSettings &&
    postFxSettings &&
    graphicsSettings &&
    controlSettings;

  return (
    <form className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Profile Name *</Label>
            <Input
              id="name"
              placeholder="e.g., My Competitive Settings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your settings setup..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings Files Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Settings Files *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload all 5 Tarkov settings files (Game.ini, Sound.ini, PostFx.ini,
            Graphics.ini, Control.ini). These are JSON files located in your
            Tarkov settings folder.
          </p>

          {/* File Location Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Settings files location:</strong>
              <br />
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                %LOCALAPPDATA%\Battlestate Games\EscapeFromTarkov\
              </code>
              <br />
              Or press{" "}
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                Win + R
              </kbd>{" "}
              and paste:{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                %LOCALAPPDATA%\Battlestate Games\EscapeFromTarkov
              </code>
            </AlertDescription>
          </Alert>

          {/* Directory Picker Button */}
          <Button
            type="button"
            variant="outline"
            onClick={openDirectoryPicker}
            className="w-full"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Open Settings Folder
          </Button>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or select files manually
              </span>
            </div>
          </div>

          {/* Bulk Upload */}
          <div className="relative">
            <input
              type="file"
              accept=".ini,.json"
              multiple
              onChange={(e) => handleMultipleFilesUpload(e.target.files)}
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
            />
            <div className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  Select all 5 files at once
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We'll automatically detect which file is which
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FileUploadBox
              label="Game.ini"
              fileName="Game.ini"
              uploaded={!!gameSettings}
              onUpload={(file) => handleFileUpload(file, setGameSettings)}
            />
            <FileUploadBox
              label="Sound.ini"
              fileName="Sound.ini"
              uploaded={!!soundSettings}
              onUpload={(file) => handleFileUpload(file, setSoundSettings)}
            />
            <FileUploadBox
              label="PostFx.ini"
              fileName="PostFx.ini"
              uploaded={!!postFxSettings}
              onUpload={(file) => handleFileUpload(file, setPostFxSettings)}
            />
            <FileUploadBox
              label="Graphics.ini"
              fileName="Graphics.ini"
              uploaded={!!graphicsSettings}
              onUpload={(file) => handleFileUpload(file, setGraphicsSettings)}
            />
            <FileUploadBox
              label="Control.ini"
              fileName="Control.ini"
              uploaded={!!controlSettings}
              onUpload={(file) => handleFileUpload(file, setControlSettings)}
            />
          </div>
        </CardContent>
      </Card>

      {/* GPU Settings */}
      <Card>
        <CardHeader>
          <CardTitle>GPU Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select which GPU brand(s) you want to provide settings for
            </p>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nvidia"
                  checked={showNvidia}
                  onCheckedChange={(checked) =>
                    setShowNvidia(checked as boolean)
                  }
                />
                <Label htmlFor="nvidia" className="cursor-pointer">
                  NVIDIA
                </Label>
              </div>
              {/*<div className="flex items-center space-x-2">*/}
              {/*  <Checkbox*/}
              {/*    id="amd"*/}
              {/*    checked={showAmd}*/}
              {/*    onCheckedChange={(checked) => setShowAmd(checked as boolean)}*/}
              {/*  />*/}
              {/*  <Label htmlFor="amd" className="cursor-pointer">*/}
              {/*    AMD*/}
              {/*  </Label>*/}
              {/*</div>*/}
            </div>
          </div>

          {showNvidia && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">NVIDIA Settings</h3>
              <NvidiaSettingsForm
                settings={nvidiaSettings}
                onChange={setNvidiaSettings}
              />
            </div>
          )}

          {/*{showAmd && (*/}
          {/*  <div className="space-y-4">*/}
          {/*    <h3 className="text-lg font-semibold">AMD Settings</h3>*/}
          {/*    <AmdSettingsForm*/}
          {/*      settings={amdSettings}*/}
          {/*      onChange={setAmdSettings}*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*)}*/}

          {!showNvidia && !showAmd && (
            <p className="text-sm text-muted-foreground">
              Please select at least one GPU brand
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, false)}
          disabled={isPending || !allFilesUploaded}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isPending || !allFilesUploaded}
        >
          {isPending ? "Creating..." : "Publish Profile"}
        </Button>
      </div>
    </form>
  );
}

interface FileUploadBoxProps {
  label: string;
  fileName: string;
  uploaded: boolean;
  onUpload: (file: File) => void;
}

function FileUploadBox({
  label,
  fileName,
  uploaded,
  onUpload,
}: FileUploadBoxProps) {
  return (
    <div className="relative">
      <input
        type="file"
        accept=".json,.ini"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
      />
      <div
        className={`flex cursor-pointer items-center justify-between rounded-lg border-2 border-dashed p-4 transition-colors ${
          uploaded
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary"
        }`}
      >
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{fileName}</p>
        </div>
        {uploaded ? (
          <Badge variant="default">Uploaded</Badge>
        ) : (
          <Upload className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

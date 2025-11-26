import archiver from "archiver";

/**
 * Create ZIP stream from settings JSON objects (on-the-fly)
 */
export function createSettingsZipStream(settings: {
  gameSettings: any;
  soundSettings: any;
  postFxSettings: any;
  graphicsSettings: any;
  controlSettings: any;
}) {
  const archive = archiver("zip", { zlib: { level: 9 } });

  // Add JSON files to zip
  archive.append(JSON.stringify(settings.gameSettings, null, 2), {
    name: "Game.ini",
  });
  archive.append(JSON.stringify(settings.soundSettings, null, 2), {
    name: "Sound.ini",
  });
  archive.append(JSON.stringify(settings.postFxSettings, null, 2), {
    name: "PostFx.ini",
  });
  archive.append(JSON.stringify(settings.graphicsSettings, null, 2), {
    name: "Graphics.ini",
  });
  archive.append(JSON.stringify(settings.controlSettings, null, 2), {
    name: "Control.ini",
  });

  archive.finalize();

  return archive;
}

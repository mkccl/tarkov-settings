import { NextRequest, NextResponse } from "next/server";
import { getSettingsProfileById, incrementDownloadCount } from "@/lib/actions/settings-profiles";
import { createSettingsZipStream } from "@/lib/download-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getSettingsProfileById(id);

    if (!profile) {
      return NextResponse.json(
        { error: "Settings profile not found" },
        { status: 404 }
      );
    }

    // Increment download count asynchronously (don't await)
    incrementDownloadCount(id).catch((err) =>
      console.error("Error incrementing download count:", err)
    );

    // Create ZIP stream
    const archive = createSettingsZipStream({
      gameSettings: profile.gameSettings,
      soundSettings: profile.soundSettings,
      postFxSettings: profile.postFxSettings,
      graphicsSettings: profile.graphicsSettings,
      controlSettings: profile.controlSettings,
    });

    // Convert archive stream to web stream
    const stream = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk) => {
          controller.enqueue(chunk);
        });

        archive.on("end", () => {
          controller.close();
        });

        archive.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${profile.name.replace(/[^a-z0-9]/gi, "_")}_settings.zip"`,
      },
    });
  } catch (error) {
    console.error("Error downloading settings:", error);
    return NextResponse.json(
      { error: "Failed to download settings" },
      { status: 500 }
    );
  }
}

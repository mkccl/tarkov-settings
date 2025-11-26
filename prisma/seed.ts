import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Configuration: Change these numbers as needed
const NUM_USERS = 20;
const MIN_PROFILES_PER_USER = 2;
const MAX_PROFILES_PER_USER = 3;

// Helper functions to generate random data
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateUsername(index: number): string {
  const adjectives = [
    "Pro",
    "Epic",
    "Mega",
    "Ultra",
    "Super",
    "Hyper",
    "Alpha",
    "Beta",
    "Omega",
    "Prime",
  ];
  const nouns = [
    "Gamer",
    "Raider",
    "Sniper",
    "Warrior",
    "Hunter",
    "Tactical",
    "Shadow",
    "Ghost",
    "Viper",
    "Eagle",
  ];
  const suffix = [
    "YT",
    "TTV",
    "Live",
    "TV",
    "Gaming",
    "Official",
    "Main",
    "Pro",
    "Elite",
    "X",
  ];

  if (Math.random() > 0.5) {
    return `${randomChoice(adjectives)}${randomChoice(nouns)}${randomInt(1, 999)}`;
  } else {
    return `${randomChoice(nouns)}${randomChoice(suffix)}${randomInt(1, 999)}`;
  }
}

function generateSettingsName(): string {
  const types = [
    "Main Settings",
    "Competitive Setup",
    "PVP Config",
    "Balanced Settings",
    "Ultra Settings",
    "Performance Mode",
    "Quality Setup",
    "Sniper Config",
    "CQB Settings",
    "Tournament Ready",
    "Stream Setup",
    "Low Spec Config",
    "High FPS Mode",
    "4K Settings",
    "Night Raid Setup",
    "Day Raid Config",
  ];
  return randomChoice(types);
}

function generateDescription(): string {
  const descriptions = [
    "Optimized for maximum performance and competitive play.",
    "Balanced settings for great visuals and smooth gameplay.",
    "Perfect for streaming with high quality graphics.",
    "Low resource usage, high FPS configuration.",
    "Ultra quality settings for powerful PCs.",
    "Competitive setup with enhanced visibility.",
    "Great for long-range engagements and sniping.",
    "Close quarters combat optimized.",
    "Tournament-ready competitive configuration.",
    "My personal settings after 1000+ hours.",
    "Tested and refined over multiple wipes.",
    "Best settings for spotting enemies.",
  ];
  return randomChoice(descriptions);
}

async function main() {
  console.log(`🌱 Starting seed with ${NUM_USERS} users...`);

  const resolutions = ["1920x1080", "2560x1440", "3840x2160", "1920x1200"];
  const textureQualities = ["low", "medium", "high", "ultra"];
  const shadowQualities = ["low", "medium", "high"];
  const antiAliasing = ["TAA", "TAA High", "FXAA", "Off"];
  const colorGrading = ["None", "Cognac", "Filmic", "Natural"];
  const gpuBrands = ["NVIDIA", "AMD"];

  let totalProfiles = 0;

  for (let i = 0; i < NUM_USERS; i++) {
    const username = generateUsername(i);
    console.log(`Creating user ${i + 1}/${NUM_USERS}: ${username}`);

    // Create user
    const user = await prisma.user.create({
      data: {
        clerkId: `seed_user_${i}_${Date.now()}`,
        email: `${username.toLowerCase()}@example.com`,
        twitchUsername: username,
        avatarUrl: `https://i.pravatar.cc/300?u=${username}`,
      },
    });

    // Create random number of settings profiles for this user
    const numProfiles = randomInt(MIN_PROFILES_PER_USER, MAX_PROFILES_PER_USER);

    for (let j = 0; j < numProfiles; j++) {
      const gpuBrand = randomChoice(gpuBrands);
      const isNvidia = gpuBrand === "NVIDIA";

      const profile = await prisma.settingsProfile.create({
        data: {
          userId: user.id,
          name: generateSettingsName(),
          description: generateDescription(),
          published: Math.random() > 0.1, // 90% published
          gpuBrand: gpuBrand,

          // NVIDIA settings (only if NVIDIA)
          nvidiaBrightness: isNvidia ? randomInt(40, 60) : null,
          nvidiaContrast: isNvidia ? randomInt(40, 60) : null,
          nvidiaGamma: isNvidia ? randomInt(50, 70) : null,
          nvidiaDigitalVibrance: isNvidia ? randomInt(50, 100) : null,
          nvidiaHue: isNvidia ? 0 : null,

          // AMD settings (only if AMD)
          amdColorTempControl: !isNvidia ? randomChoice([true, false]) : null,
          amdBrightness: !isNvidia ? randomInt(-20, 20) : null,
          amdHue: !isNvidia ? randomInt(-10, 10) : null,
          amdContrast: !isNvidia ? randomInt(90, 130) : null,
          amdSaturation: !isNvidia ? randomInt(90, 130) : null,
          amdDisplayColorEnhancement: !isNvidia
            ? randomChoice([
                "DynamicContrast",
                "VividGaming",
                "UseGlobalSettings",
                "Disabled",
              ])
            : null,
          amdDynamicContrastValue:
            !isNvidia && Math.random() > 0.5 ? randomInt(0, 10) : null,

          gameSettings: {
            fov: randomInt(65, 75),
            headBobbing: randomFloat(0.1, 0.5, 1),
            overallVisibility: randomChoice([2000, 2500, 3000]),
            shadowVisibility: randomInt(40, 60),
          },

          soundSettings: {
            masterVolume: randomFloat(0.4, 0.7, 2),
            musicVolume: randomFloat(0, 0.3, 2),
            effectsVolume: randomFloat(0.7, 1.0, 2),
            dialogueVolume: randomFloat(0.5, 0.8, 2),
            interfaceVolume: randomFloat(0.3, 0.6, 2),
          },

          postFxSettings: {
            brightness: randomInt(40, 55),
            saturation: randomInt(40, 60),
            clarity: randomInt(10, 25),
            colorfulness: randomInt(40, 60),
            lumaSharpen: randomInt(60, 100),
            adaptiveSharpen: 0,
            colorGrading: randomChoice(colorGrading),
          },

          graphicsSettings: {
            resolution: randomChoice(resolutions),
            fullscreen: true,
            vsync: false,
            textureQuality: randomChoice(textureQualities),
            shadowQuality: randomChoice(shadowQualities),
            objectLOD: randomFloat(2, 3, 1),
            overallVisibility: randomChoice([2000, 2500, 3000]),
            antiAliasing: randomChoice(antiAliasing),
            resampling: "1x off",
            hbao: randomChoice(["off", "medium", "high"]),
            ssr: randomChoice(["off", "medium", "high"]),
            anisotropicFiltering: "per texture",
            nvidiaDLSS: isNvidia ? randomChoice([true, false]) : false,
            nvidiaReflex: isNvidia ? randomChoice([true, false]) : false,
          },

          controlSettings: {
            mouseSensitivity: randomFloat(0.3, 0.6, 2),
            aimingSensitivity: randomFloat(0.3, 0.6, 2),
            invertY: false,
            invertX: false,
          },

          // Random analytics
          viewCount: randomInt(50, 5000),
          downloadCount: randomInt(10, 2000),
        },
      });

      // Create random number of stars for this profile
      const numStars = randomInt(0, 15);
      for (let k = 0; k < numStars; k++) {
        try {
          // Create a temporary user for starring (if not already exists)
          const starUserId = `seed_star_${k}_${Date.now()}_${Math.random()}`;
          const starUser = await prisma.user.create({
            data: {
              clerkId: starUserId,
              email: `star_${k}_${i}_${j}@example.com`,
              twitchUsername: `StarUser${k}_${i}_${j}`,
            },
          });

          await prisma.star.create({
            data: {
              settingsProfileId: profile.id,
              userId: starUser.id,
              rating: randomInt(3, 5),
            },
          });
        } catch (e) {
          // Skip if duplicate
        }
      }

      // Create random number of comments for this profile
      const numComments = randomInt(0, 5);
      const commentTexts = [
        "These settings are amazing!",
        "Great for PVP, thanks!",
        "Helped me improve my FPS a lot.",
        "Perfect settings, highly recommend.",
        "Good balance between quality and performance.",
        "Works great on my mid-range PC.",
        "Tried these and got way more kills!",
        "Visibility is so much better now.",
      ];

      for (let k = 0; k < numComments; k++) {
        try {
          const commentUserId = `seed_comment_${k}_${Date.now()}_${Math.random()}`;
          const commentUser = await prisma.user.create({
            data: {
              clerkId: commentUserId,
              email: `comment_${k}_${i}_${j}@example.com`,
              twitchUsername: `CommentUser${k}_${i}_${j}`,
            },
          });

          await prisma.comment.create({
            data: {
              settingsProfileId: profile.id,
              userId: commentUser.id,
              content: randomChoice(commentTexts),
            },
          });
        } catch (e) {
          // Skip if duplicate
        }
      }

      totalProfiles++;
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Created ${NUM_USERS} users`);
  console.log(`   Created ${totalProfiles} settings profiles`);
  console.log(`   With random stars and comments`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

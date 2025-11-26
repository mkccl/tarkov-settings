import { Star, Download, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface SettingsCardProps {
  twitchName: string;
  settingsName: string;
  stars: number;
  downloads: number;
  views: number;
  comments: number;
  avatarUrl?: string;
  gpuBrand: "NVIDIA" | "AMD";
}

export function SettingsCard({
  twitchName,
  settingsName,
  stars,
  downloads,
  views,
  comments,
  avatarUrl,
  gpuBrand,
}: SettingsCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const displayName = twitchName || "User";

  return (
    <Card className="group relative cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Image
            src="/escape_from_tarkov_PNG8.png"
            alt="Operator"
            className="h-40 w-auto object-contain opacity-20 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            width={160}
            height={160}
          />
          <div className="absolute inset-0 shadow-[inset_0_0_30px_15px_hsl(var(--card))]" />
        </div>
      </div>
      <CardContent className="relative z-10 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage
                src={avatarUrl || "/placeholder.svg"}
                alt={displayName}
              />
              <AvatarFallback className="bg-secondary text-foreground">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">{displayName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium text-foreground">{stars}</span>
          </div>
        </div>

        <div className="mb-4 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {settingsName}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {gpuBrand}
          </Badge>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{formatNumber(downloads)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{formatNumber(views)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{comments}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

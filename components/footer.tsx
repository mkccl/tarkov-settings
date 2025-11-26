import Link from "next/link";

import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-16">
      <div className="mx-auto max-w-5xl px-6">
        <Alert>
          <AlertDescription className="flex flex-col gap-4 text-center">
            <p className="flex gap-2 justify-center">
              Also check out the{" "}
              <Image
                src={"/kappa-container.png"}
                width={20}
                height={10}
                alt={"Image of a Kappa container"}
                className=""
              />
              <Link
                className="font-bold underline cursor-pointer text-muted-foreground"
                href={"https://www.obs-kappa-tracker.com/"}
              >
                OBS Kappa Tracker
              </Link>
            </p>
          </AlertDescription>
        </Alert>

        <Link
          href="/"
          aria-label="go home"
          className="mx-auto block size-fit"
        ></Link>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          <Link
            href="https://github.com/mkccl/tarkov-settings"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Social Link 6"
            className="text-muted-foreground hover:text-primary block"
          >
            <Image
              src="/github.png"
              alt="GitHub"
              width={24}
              height={24}
              className="text-white"
            />
            {/* Generic "Feather" (post/write) icon */}
          </Link>
        </div>
        <span className="text-muted-foreground block text-center text-sm">
          {" "}
          © {new Date().getFullYear()} Made by{" "}
          <a
            href={"https://twitch.tv/derccl"}
            className="font-bold underline"
            target="_blank"
          >
            ccl
          </a>{" "}
          with ❤️ | Open source on{" "}
          <a
            className="font-bold underline"
            target="_blank"
            href={"https://github.com/mkccl/tarkov-settings"}
          >
            GitHub
          </a>{" "}
        </span>
      </div>
    </footer>
  );
}

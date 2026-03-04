import { blog } from "@repo/cms";
import { Feed } from "@repo/cms/components/feed";
import { Button } from "@repo/design-system/components/ui/button";
import type { Dictionary } from "@repo/internationalization";
import { MoveRight, PhoneCall } from "lucide-react";
import Link from "next/link";
import { env } from "@/env";
import ColorBends from "@/components/color-bends";

type HeroProps = {
  dictionary: Dictionary;
};

export const Hero = async ({ dictionary }: HeroProps) => (
  <div className="relative w-full overflow-hidden">
    {/* WebGL animated background */}
    <div className="absolute inset-0 z-0">
      <ColorBends
        colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
        rotation={0}
        speed={0.2}
        scale={1}
        frequency={1}
        warpStrength={1}
        mouseInfluence={1}
        parallax={0.5}
        noise={0.1}
        transparent={false}
        autoRotate={0}
      />
    </div>

    {/* Gradient overlay for text readability + smooth bottom fade */}
    <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-background/50 to-background" />
    {/* Bottom blur band for extra-smooth transition */}
    <div className="absolute bottom-0 left-0 right-0 z-[1] h-24 backdrop-blur-md [mask-image:linear-gradient(to_top,black,transparent)]" />

    {/* Hero content */}
    <div className="relative z-[2] container mx-auto">
      <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
        <div>
          <Feed queries={[blog.latestPostQuery]}>
            {/* biome-ignore lint/suspicious/useAwait: "Server Actions must be async" */}
            {async ([data]) => {
              "use server";

              return (
                <Button asChild className="gap-4" size="sm" variant="secondary">
                  <Link href={`/blog/${data.blog.posts.item?._slug}`}>
                    {dictionary.web.home.hero.announcement}{" "}
                    <MoveRight className="h-4 w-4" />
                  </Link>
                </Button>
              );
            }}
          </Feed>
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="max-w-2xl text-center font-regular text-5xl tracking-tighter md:text-7xl text-foreground drop-shadow-lg">
            {dictionary.web.home.meta.title}
          </h1>
          <p className="max-w-2xl text-center text-lg leading-relaxed tracking-tight md:text-xl text-muted-foreground drop-shadow-md">
            {dictionary.web.home.meta.description}
          </p>
        </div>
        <div className="flex flex-row gap-3">
          <Button asChild className="gap-4" size="lg" variant="outline">
            <Link href="/contact">
              Get in touch <PhoneCall className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="gap-4" size="lg">
            <Link href={env.NEXT_PUBLIC_APP_URL}>
              Sign up <MoveRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
);

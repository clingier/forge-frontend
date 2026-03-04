import { blog } from "@repo/cms";
import { Feed } from "@repo/cms/components/feed";
import { Button } from "@repo/design-system/components/ui/button";
import type { Dictionary } from "@repo/internationalization";
import { MoveRight, PhoneCall } from "lucide-react";
import Link from "next/link";
import { env } from "@/env";
import { HeroInteractive } from "./hero-interactive";

type HeroProps = {
  dictionary: Dictionary;
};

export const Hero = async ({ dictionary }: HeroProps) => (
  <HeroInteractive
    description={dictionary.web.home.meta.description}
    announcement={
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
    }
    actions={
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
    }
  />
);

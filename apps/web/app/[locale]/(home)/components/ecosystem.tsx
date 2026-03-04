"use client";

import {
  SiPolars,
  SiApachekafka,
  SiKubernetes,
  SiPostgresql,
  SiOpentelemetry,
} from "react-icons/si";
import type { Dictionary } from "@repo/internationalization";
import { LogoLoop } from "../../../../components/logo-loop/LogoLoop";
import type { LogoItem } from "../../../../components/logo-loop/LogoLoop";
import { ApacheArrowIcon } from "./icons/apache-arrow-icon";
import { DataFusionIcon } from "./icons/datafusion-icon";
import { TokioIcon } from "./icons/tokio-icon";

type EcosystemProps = {
  dictionary: Dictionary;
};

const TechChip = ({
  icon,
  name,
}: {
  icon: React.ReactNode;
  name: string;
}) => (
  <div className="flex items-center gap-2 border border-border rounded-lg px-4 py-2">
    {icon}
    <span className="text-sm font-medium whitespace-nowrap">{name}</span>
  </div>
);

const lane1: LogoItem[] = [
  {
    node: <TechChip icon={<ApacheArrowIcon className="w-5 h-5" />} name="Apache Arrow" />,
    title: "Apache Arrow",
    href: "https://arrow.apache.org",
  },
  {
    node: <TechChip icon={<SiPolars className="w-5 h-5" />} name="Polars" />,
    title: "Polars",
    href: "https://pola.rs",
  },
  {
    node: <TechChip icon={<DataFusionIcon className="w-5 h-5" />} name="DataFusion" />,
    title: "DataFusion",
    href: "https://datafusion.apache.org",
  },
];

const lane2: LogoItem[] = [
  {
    node: <TechChip icon={<SiApachekafka className="w-5 h-5" />} name="Apache Kafka" />,
    title: "Apache Kafka",
    href: "https://kafka.apache.org",
  },
  {
    node: <TechChip icon={<SiKubernetes className="w-5 h-5" />} name="Kubernetes" />,
    title: "Kubernetes",
    href: "https://kubernetes.io",
  },
  {
    node: <TechChip icon={<SiPostgresql className="w-5 h-5" />} name="PostgreSQL" />,
    title: "PostgreSQL",
    href: "https://postgresql.org",
  },
];

const lane3: LogoItem[] = [
  {
    node: <TechChip icon={<SiOpentelemetry className="w-5 h-5" />} name="OpenTelemetry" />,
    title: "OpenTelemetry",
    href: "https://opentelemetry.io",
  },
  {
    node: <TechChip icon={<TokioIcon className="w-5 h-5" />} name="Tokio" />,
    title: "Tokio",
    href: "https://tokio.rs",
  },
];

export const Ecosystem = ({ dictionary }: EcosystemProps) => {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-left font-regular text-xl tracking-tighter md:text-5xl lg:max-w-xl">
              {dictionary.web.home.ecosystem.title}
            </h2>
            <p className="text-left text-lg text-muted-foreground lg:max-w-xl">
              {dictionary.web.home.ecosystem.description}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <LogoLoop
              logos={lane1}
              direction="left"
              speed={40}
              gap={16}
              logoHeight={40}
              fadeOut
              hoverSpeed={0}
              ariaLabel="Rust data ecosystem technologies - lane 1"
            />
            <LogoLoop
              logos={lane2}
              direction="right"
              speed={40}
              gap={16}
              logoHeight={40}
              fadeOut
              hoverSpeed={0}
              ariaLabel="Rust data ecosystem technologies - lane 2"
            />
            <LogoLoop
              logos={lane3}
              direction="left"
              speed={40}
              gap={16}
              logoHeight={40}
              fadeOut
              hoverSpeed={0}
              ariaLabel="Rust data ecosystem technologies - lane 3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

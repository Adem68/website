import type { Props } from "astro";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconRss from "@/assets/icons/IconRss.svg";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/Adem68",
    linkTitle: `GitHub`,
    icon: IconGitHub,
  },
  {
    name: "X",
    href: "https://x.com/AdemOzcanTR",
    linkTitle: `X`,
    icon: IconBrandX,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/ademozcan/",
    linkTitle: `LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "RSS",
    href: "/rss.xml",
    linkTitle: `RSS`,
    icon: IconRss,
  },
] as const;
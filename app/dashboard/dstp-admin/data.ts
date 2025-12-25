export interface LinkItem {
  label: string;
  url: string;
  description?: string;
}

export interface LinkSection {
  title: string;
  links: LinkItem[];
}

export const dstpAdminLinks: LinkSection[] = [
  {
    title: "Company Links",
    links: [
      {
        label: "DSTP Website",
        url: "https://www.dontsurrendertopain.com",
      },
      {
        label: "DSTP YouTube",
        url: "https://www.youtube.com/@dontsurrendertopain",
      },
    ],
  },
  {
    title: "Development",
    links: [
      {
        label: "DSTP App Github",
        url: "https://github.com/DontSurrenderToPain/dstp-app",
      },
      {
        label: "DSTP App Board",
        url: "https://github.com/users/DontSurrenderToPain/projects/5",
      },
      {
        label: "DontSurrenderToPain Github",
        url: "https://github.com/DontSurrenderToPain",
      },
    ],
  },
  {
    title: "Inspiring Stoic Content",
    links: [
      {
        label: "Stoic joy",
        url: "https://en.wikiversity.org/wiki/Stoic_joy",
      },
      {
        label: "Modern re-interpretation of stoicism",
        url: "https://supermemo.guru/wiki/Modern_re-interpretation_of_stoicism",
      },
    ],
  },
  {
    title: "Other Stoicism Websites",
    links: [
      {
        label: "The Stoic Fellowship",
        url: "https://www.stoicfellowship.com/",
      },
      {
        label: "Daily Stoic",
        url: "https://www.dailystoic.com/",
      },
      {
        label: "Modern Stoicism",
        url: "https://www.modernstoicism.com/",
      },
      {
        label: "Stoic Philosophy",
        url: "https://www.stoicphilosophy.com/",
      },
      {
        label: "Mindful Stoic",
        url: "https://www.mindfulstoic.net/",
      },
    ],
  },
];


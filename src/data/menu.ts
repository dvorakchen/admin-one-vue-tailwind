import { mdiEmoticonLol, mdiFaceManProfile, mdiMonitor } from "@mdi/js";

export const menuList = [
  {
    label: "Dashboard",
    route: "dashboard",
    icon: mdiMonitor,
  },
  {
    label: "Meme",
    route: "meme",
    icon: mdiEmoticonLol,
  },
  {
    label: "Profile",
    route: "profile",
    icon: mdiFaceManProfile,
  },
] as MenuItem[];

export type MenuItem = {
  label: string;
  route: string;
  icon: string;
};

import { IconType } from "react-icons/lib";
import {
  LuLayoutDashboard,
  LuAtom,
  LuShieldCheck,
} from "react-icons/lu";

type NavListType = {
  id: number;
  name: string;
  icon: IconType;
  route: string;
};

export const navList: NavListType[] = [
  {
    id: 1,
    name: "course-dashboard",
    icon: LuLayoutDashboard,
    route: "/course-dashboard",
  },
  {
    id: 2,
    name: "Explore",
    icon: LuAtom,
    route: "/course-dashboard/explore",
  },
  {
    id: 3,
    name: "Upgrade",
    icon: LuShieldCheck,
    route: "/course-dashboard/upgrade",
  },
  {
    id: 4,
    name: "Events",
    icon: LuLayoutDashboard,
    route: "/events",
  },
  {
    id: 5,
    name: "Pathway",
    icon: LuAtom,
    route: "/path",
  }
];

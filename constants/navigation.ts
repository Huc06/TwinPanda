import { 
  Home, 
  Camera, 
  ShoppingCart, 
  Store, 
  TrendingUp,
  type LucideIcon 
} from "lucide-react";
import { UserRole } from "@/contexts/auth-context";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "AR Scan",
    href: "/ar-scan",
    icon: Camera,
  },
  {
    label: "My Assets",
    href: "/assets",
    icon: ShoppingCart,
  },
  {
    label: "Shop Management",
    href: "/shop",
    icon: Store,
    roles: ["shop", "admin"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    roles: ["shop", "admin"],
  },
];

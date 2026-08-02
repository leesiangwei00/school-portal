import { GraduationCap } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const links = [
  { to: "/classes", label: "Classes" },
  { to: "/teachers", label: "Teachers" },
];

export function NavBar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-4xl items-center gap-8 px-6 py-3.5">
        <span className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary">
          <GraduationCap className="size-5" />
          School Portal
        </span>
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="gap-1">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.to);
              return (
                <NavigationMenuItem key={link.to}>
                  <NavigationMenuLink asChild active={isActive}>
                    <NavLink
                      to={link.to}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        isActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      {link.label}
                    </NavLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}

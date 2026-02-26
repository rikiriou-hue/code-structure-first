import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, LogOut, Menu, X } from "lucide-react";
import CoupleMembers from "@/components/CoupleMembers";
import NotificationBell from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/login");
  };

  const links = [
    { to: "/dashboard", label: "Home" },
    { to: "/timeline", label: "Timeline" },
    { to: "/notes", label: "Notes" },
    { to: "/future-letters", label: "Letters" },
    { to: "/memory-map", label: "Map" },
    { to: "/profile", label: "Profil" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <Heart className="w-5 h-5 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="font-serif text-lg text-foreground">Our Story</span>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-sans transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <NotificationBell />
            <CoupleMembers />
            <button
              onClick={handleLogout}
              className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-sans transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-3 py-2.5">
            <CoupleMembers />
          </div>
          <button
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="px-3 py-2.5 rounded-lg text-sm font-sans text-muted-foreground hover:text-foreground transition-colors text-left flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

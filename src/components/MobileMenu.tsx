import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Settings, Play, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const MobileMenu: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-10 h-10">
            <Menu className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => navigate("/player")}>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" /> Player
            </div>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onSelect={() => navigate("/dashboard")}>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Dashboard
              </div>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => navigate("/settings")}>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/chat")}>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Chat
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleLogout}>
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileMenu;

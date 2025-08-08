import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun, Menu, X, Bot, User, Settings, History, CreditCard, LogOut, ChevronDown } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "الرئيسية", href: "/", id: "home" },
    { name: "المميزات", href: "#features", id: "features" },
    { name: "الأسعار", href: "#pricing", id: "pricing" },
    { name: "الدعم", href: "/support", id: "support" },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-primary ml-2" />
              <h1 className="text-2xl font-bold text-foreground font-arabic">نباهة</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 space-x-reverse">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={`text-foreground hover:text-primary transition-colors font-arabic ${
                  location === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* User Menu or Login Button */}
            {isLoading ? (
              <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 space-x-reverse">
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={user.profileImageUrl || undefined} 
                        alt={`${user.firstName || ''} ${user.lastName || ''}`.trim()}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block font-arabic">
                      {user.firstName || user.email?.split('@')[0] || 'المستخدم'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-48" dir="rtl">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center space-x-2 space-x-reverse">
                      <User className="h-4 w-4" />
                      <span className="font-arabic">الملف الشخصي</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/subscribe" className="flex items-center space-x-2 space-x-reverse">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-arabic">اشتراكي</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/chat" className="flex items-center space-x-2 space-x-reverse">
                      <History className="h-4 w-4" />
                      <span className="font-arabic">سجل المحادثات</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a 
                      href="/api/logout" 
                      className="flex items-center space-x-2 space-x-reverse text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-arabic">تسجيل الخروج</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="font-arabic">
                <a href="/api/login">تسجيل الدخول</a>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-right font-arabic transition-colors ${
                    location === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

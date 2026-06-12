import React, { useState } from "react";
import { Link } from "react-router-dom";
// import useTheme from "./Pages/themeContext";
// import { useAuth } from "../context/AuthContext";
// import { useChat } from "../hooks/useChat";
// import ChatPopup from "./chat/ChatPopup";

const Navbar = () => {
  const { themeMode, darkTheme, lightTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const { currentUser } = useAuth();

  const {
    conversations,
    messages,
    activeConversation,
    typingUsers,
    openConversation,
    sendMessage,
    startTyping,
    stopTyping,
  } = useChat();

  return (
    <nav
      className={`h-24 w-full flex items-center fixed top-0 z-50 backdrop-blur-2xl transition-all duration-500 border-b
      ${
        themeMode === "light"
          ? "bg-white/80 border-black/[0.05] text-black shadow-sm"
          : "bg-[#050505]/70 border-white/[0.05] text-white shadow-2xl"
      }`}
    >
      <div className="flex w-full max-w-[1400px] mx-auto items-center justify-between px-6 md:px-12 h-full">

        {/* Left Nav Items & Mobile Hamburger */}
        <div className="flex items-center gap-8">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1 focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>

          {/* Desktop Left Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-300 ${
                themeMode === "light" ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/profile"
              className={`text-sm font-medium transition-all duration-300 ${
                themeMode === "light" ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Profile Builder
            </Link>
          </div>
        </div>

        {/* Center Logo */}
        <Link
          to="/"
          className="flex-shrink-0 relative group cursor-pointer flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none"
        >
          <div className={`w-9 h-9 flex items-center justify-center rounded-xl font-black text-xl shadow-lg transition-transform group-hover:scale-105 duration-300 ${
            themeMode === "light" ? "bg-[#9DFF13] text-black" : "bg-[#9DFF13] text-[#050505] shadow-[0_0_15px_rgba(157,255,19,0.3)]"
          }`}>
            C
          </div>
          <span
            className={`font-bold text-xl tracking-tight hidden lg:block transition-colors ${
              themeMode === "dark" ? "text-white" : "text-black"
            }`}
          >
            CampusOS.
          </span>
        </Link>

        {/* Right Nav Items */}
        <div className="flex items-center gap-4">
          <Link
            to="/marketplace"
            className={`text-sm font-medium transition-all duration-300 hidden md:block ${
              themeMode === "light" ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Marketplace
          </Link>

          <Link
            to="/login"
            className={`px-6 py-2.5 rounded-full transition-all duration-300 hidden sm:block font-semibold text-sm shadow-md hover:-translate-y-0.5 ${
              themeMode === "dark"
                ? "bg-white/10 text-white hover:bg-[#9DFF13] hover:text-[#050505] hover:shadow-[0_0_20px_rgba(157,255,19,0.3)]"
                : "bg-black/5 text-black hover:bg-[#9DFF13] hover:text-[#050505]"
            }`}
          >
            Sign In
          </Link>

          {/* Vertical Divider */}
          <div
            className={`w-[1px] h-5 mx-1 hidden sm:block ${themeMode === "dark" ? "bg-white/10" : "bg-black/10"}`}
          />

          {/* Chat Button — only when logged in */}
          {currentUser && (
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300
                ${chatOpen
                  ? "border-[#9DFF13] text-[#9DFF13] bg-[#9DFF13]/10"
                  : themeMode === "dark"
                    ? "border-white/10 bg-white/5 hover:border-[#9DFF13] hover:text-[#9DFF13]"
                    : "border-black/10 bg-black/5 hover:border-[#9DFF13]"
                }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {/* Unread dot */}
              {conversations?.some(c =>
                c.unreadCount?.[currentUser?.id] > 0
              ) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#9DFF13] rounded-full animate-pulse" />
              )}
            </button>
          )}

          {/* Theme Toggle */}
          {themeMode === "dark" ? (
            <button
              onClick={lightTheme}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:border-[#9DFF13] hover:text-[#9DFF13] transition-all duration-300"
              aria-label="Switch to Light Mode"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          ) : (
            <button
              onClick={darkTheme}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-black/10 bg-black/5 hover:border-[#9DFF13] hover:text-black hover:bg-[#9DFF13]/10 transition-all duration-300"
              aria-label="Switch to Dark Mode"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className={`absolute top-24 left-0 w-full border-b backdrop-blur-3xl transition-all duration-300 md:hidden flex flex-col shadow-xl ${
            themeMode === "light"
              ? "bg-white/95 border-black/[0.05]"
              : "bg-[#050505]/95 border-white/[0.05]"
          }`}
        >
          <div className="flex flex-col px-6 py-6 gap-6">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-medium transition-colors ${
                themeMode === "light" ? "text-black/80 hover:text-black" : "text-white/80 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-medium transition-colors ${
                themeMode === "light" ? "text-black/80 hover:text-black" : "text-white/80 hover:text-white"
              }`}
            >
              Profile Builder
            </Link>
            <Link
              to="/chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-medium transition-colors ${
                themeMode === "light" ? "text-black/80 hover:text-black" : "text-white/80 hover:text-white"
              }`}
            >
              Message
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full py-3 rounded-xl text-center transition-all duration-300 font-semibold text-sm shadow-md sm:hidden ${
                themeMode === "dark"
                  ? "bg-white/10 text-white hover:bg-[#9DFF13] hover:text-[#050505]"
                  : "bg-black/5 text-black hover:bg-[#9DFF13] hover:text-[#050505]"
              }`}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Chat Popup */}
      {currentUser && (
        <ChatPopup
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          conversations={conversations}
          messages={messages}
          activeConversation={activeConversation}
          currentUser={currentUser}
          typingUsers={typingUsers}
          onOpenConversation={openConversation}
          onSend={sendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
          themeMode={themeMode}
        />
      )}
    </nav>
  );
};

export default Navbar;
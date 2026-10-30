import React, { useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import PullToRefresh from './PullToRefresh';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { mobileTabRoutes, allNavRoutes } from './NavData';
import { queryClientInstance } from '@/lib/query-client';

export default function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isTabSwitch = allNavRoutes.includes(location.pathname);

  const tabHistories = useRef({});
  const currentTab = useRef('/');

  useEffect(() => {
    const path = location.pathname;
    if (mobileTabRoutes.includes(path)) {
      currentTab.current = path;
    } else if (allNavRoutes.includes(path)) {
      currentTab.current = path;
    } else {
      const tab = currentTab.current;
      if (!tabHistories.current[tab]) tabHistories.current[tab] = [];
      tabHistories.current[tab] = [path];
    }
  }, [location.pathname]);

  function handleTabClick(e, targetTab) {
    if (targetTab === currentTab.current) {
      e.preventDefault();
      tabHistories.current[targetTab] = [];
      navigate(targetTab);
    } else {
      const saved = tabHistories.current[targetTab];
      if (saved && saved.length > 0) {
        e.preventDefault();
        navigate(saved[saved.length - 1]);
      }
    }
  }

  const activeTabRoute = mobileTabRoutes.includes(location.pathname)
    ? location.pathname
    : currentTab.current;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="md:hidden sticky top-0 z-30 bg-card border-b border-border"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="px-5 h-14 flex items-center justify-between">
            <Link to="/" className="select-none flex items-center gap-2 text-lg font-black tracking-tight">
              <span className="w-8 h-8 bg-study-lime rounded-lg flex items-center justify-center">
                <GraduationCap size={20} className="select-none" />
              </span>
              StudyStreak<span className="text-study-accent">.</span>
            </Link>
          </div>
        </header>
        <main
          className="flex-1 w-full max-w-5xl mx-auto px-5 py-6 md:py-8 pb-24 md:pb-8"
          style={{ overscrollBehavior: 'none' }}
        >
          <PullToRefresh onRefresh={() => queryClientInstance.invalidateQueries()}>
            <motion.div
              key={location.pathname}
              initial={isTabSwitch ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </PullToRefresh>
        </main>
      </div>
      <MobileNav activeTabRoute={activeTabRoute} onTabClick={handleTabClick} />
    </div>
  );
}
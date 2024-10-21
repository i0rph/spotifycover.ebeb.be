import { cloneElement } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

function AnimatedOutlet() {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={true}>
      {element && cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
}

export function LayoutWrapper() {
  return (
    <div className="relative flex h-full flex-col overflow-x-hidden">
      <AnimatedOutlet />
    </div>
  );
}

import { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.main
      // initial={{ x: 300, opacity: 0 }}
      // animate={{ x: 0, opacity: 1 }}
      // exit={{ x: -300, opacity: 0 }}
      className="flex-auto"
    >
      {children}
    </motion.main>
  );
}

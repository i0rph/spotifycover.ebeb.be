import { AnimatePresence } from 'framer-motion';

import TypeSelect from '@/components/typeSelect';
import SizeSelect from '@/components/sizeSelect';
import ResolutionSelect from '@/components/resolutionSelect';
import UrlForm from '@/components/urlForm';

export default function Home() {
  return (
    <div
      id="container"
      className="grid max-h-dvh w-full snap-y snap-mandatory grid-cols-1 items-center justify-center overflow-y-hidden scroll-smooth px-4 sm:px-0"
    >
      <AnimatePresence>
        <TypeSelect key="type" />
        <SizeSelect key="size" />
        <ResolutionSelect key="resolution" />
        <UrlForm key="url" />
      </AnimatePresence>
    </div>
  );
}

import { motion } from 'framer-motion';
import { ListMusic, Music } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores';

type Props = {
  type: 'playlist' | 'track' | null;
};

export default function TypeSelect() {
  const type = useStore(state => state.type);
  const setType = useStore(state => state.setType as (_type: 'playlist' | 'track' | null) => void);

  const handleBtnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLElement) {
      const buttonEl = event.target.closest('button');

      const { type } = buttonEl?.dataset as Props;

      if (type && ['playlist', 'track'].includes(type)) {
        setType(type);

        const container = document.getElementById('container');
        container?.scrollTo({ top: container.scrollTop + window.innerHeight, behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.8 }}
      onClick={handleBtnClick}
      className="flex h-dvh w-full snap-center snap-always flex-col items-center justify-center"
    >
      <div className="flex w-full justify-center gap-x-4 sm:gap-x-8">
        <Button
          data-type="playlist"
          className={cn(
            'inline-flex aspect-square size-full max-w-xs flex-col gap-y-2 rounded-none bg-white/5 shadow-lg ring-1 ring-black/5 hover:bg-white/[0.07]',
            type === 'playlist' && 'border border-white/50 bg-white/10',
          )}
        >
          <ListMusic className="size-10" />
          <span className="text-2xl">플레이리스트</span>
        </Button>
        <Button
          data-type="track"
          className={cn(
            'inline-flex aspect-square size-full max-w-xs flex-col gap-y-2 rounded-none bg-white/5 shadow-lg ring-1 ring-black/5 hover:bg-white/[0.07]',
            type === 'track' && 'border border-white/50 bg-white/10',
          )}
        >
          <Music className="size-10" />
          <span className="text-2xl">트랙</span>
        </Button>
      </div>
    </motion.section>
  );
}

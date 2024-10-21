import { useMemo } from 'react';
import { motion } from 'framer-motion';

import BackButton from '@/components/backButton';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores';

export default function ResolutionSelect() {
  const { size, resolution, setResolution } = useStore();

  const resolutions = useMemo(() => {
    const resolutions = [1000];

    if (size) {
      const minResolution = 300;
      const maxResolution = Math.floor((640 * size) / 100) * 100;

      for (let i = minResolution; i <= maxResolution; i += 300) {
        resolutions.push(i);
      }
    }

    resolutions.sort((a, b) => a - b);

    return resolutions;
  }, [size]);

  const onClickResolution = (event: React.MouseEvent<HTMLLIElement>) => {
    if (event.target instanceof HTMLLIElement) {
      const resolution = Number(event.target.dataset.resolution);

      if (resolution) {
        setResolution(resolution);

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
      className="relative flex h-dvh w-full snap-center snap-always flex-col items-center justify-center gap-y-8"
    >
      <BackButton />

      <h1 className="text-4xl font-bold text-white">해상도 선택</h1>

      <ul className={cn('grid gap-2 sm:gap-4', (size ?? 0) < 3 ? 'grid-cols-3' : 'grid-cols-4')}>
        {resolutions.map(res => (
          <li
            key={res}
            data-resolution={res}
            className={cn(
              'flex size-24 cursor-pointer items-center justify-center bg-white/5 text-lg font-medium text-white shadow-lg hover:bg-white/[0.07] sm:size-28 sm:text-2xl',
              res === resolution && 'border border-white/50 bg-white/10',
            )}
            onClick={onClickResolution}
          >
            {res}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

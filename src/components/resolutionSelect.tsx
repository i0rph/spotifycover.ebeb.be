import { useMemo } from 'react';
import { Monitor } from 'lucide-react';

import { type CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores';

export default function ResolutionSelect({ carouselApi }: { carouselApi: CarouselApi | null }) {
  const { size, resolution, setResolution } = useStore();

  const resolutions = useMemo(() => {
    const resolutions = [];

    if (size) {
      const minResolution = 500;
      const maxResolution = Math.floor((640 * size) / 100) * 100;

      for (let i = minResolution; i <= maxResolution; i += 500) {
        resolutions.push(i);
      }
    }

    resolutions.sort((a, b) => a - b);

    return resolutions;
  }, [size]);

  const onClickResolution = (event: React.MouseEvent<HTMLUListElement>) => {
    const target = event.target as HTMLElement;
    const li = target.closest('li');

    if (li) {
      const resolution = Number(li.dataset.resolution);

      if (resolution) {
        setResolution(resolution);
        carouselApi?.scrollNext();
      }
    }
  };

  return (
    <section className="relative flex h-dvh w-full snap-center snap-always flex-col items-center justify-center gap-y-8 px-12 sm:px-0">
      <h1 className="text-4xl font-bold text-white">해상도 선택</h1>

      <ul className="grid w-full max-w-md grid-cols-2 gap-2 sm:gap-4" onClick={onClickResolution}>
        {resolutions.map(res => (
          <li
            key={res}
            data-resolution={res}
            className={cn(
              'flex h-24 cursor-pointer flex-col justify-between bg-white/5 p-4 text-lg font-medium text-white shadow-lg hover:bg-white/[0.07] sm:text-2xl',
              res === resolution && 'border border-white/50 bg-white/10',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-white sm:text-3xl">{res}</span>
              <Monitor className="h-6 w-6 text-gray-400 transition-colors group-hover:text-white" />
            </div>
            <p className="text-base text-gray-400">{`${res}x${res}`}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { motion } from 'framer-motion';

import BackButton from '@/components/backButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStore } from '@/stores';

export default function SizeSelect() {
  const { size, setSize } = useStore();

  const handleHighlight = (event: React.MouseEvent<HTMLLIElement>) => {
    if (event.target instanceof HTMLLIElement) {
      const parent = event.target.closest('ul');

      // hover된 셀의 index, row, col
      const index = parent ? Array.from(parent.children).indexOf(event.target) : -1;
      const row = Math.floor(index / 5) + 1;
      const col = (index % 5) + 1;

      if (row >= 2 && row === col) {
        // hover된 셀을 기준으로 상단과 왼쪽 셀들 하이라이트
        for (let i = 0; i < 25; i++) {
          const r = Math.floor(i / 5) + 1;
          const c = (i % 5) + 1;

          if (r <= row && c <= col) {
            const innerDiv = event.target.parentElement?.children[i];
            innerDiv?.classList.add('border-white/50', 'bg-white/10');
          }
        }
      }
    }
  };

  const handleClickCell = (event: React.MouseEvent<HTMLLIElement>) => {
    if (event.target instanceof HTMLLIElement) {
      const row = Number(event.target.dataset.row);
      const col = Number(event.target.dataset.col);

      if (!row || !col) return;

      if (row >= 2 && row === col) {
        setSize(row);
      }
    }
  };

  const onMouseLeave = (event: React.MouseEvent<HTMLLIElement>) => {
    if (event.target instanceof HTMLLIElement) {
      const parent = event.target.closest('ul');

      if (size) {
        // 선택된 사이즈보다 큰 셀의 하이라이트 제거
        for (let i = 0; i < 25; i++) {
          const r = Math.floor(i / 5) + 1;
          const c = (i % 5) + 1;

          if (r > size || c > size) {
            const innerDiv = event.target.parentElement?.children[i];
            innerDiv?.classList.remove('border-white/50', 'bg-white/10');
          }
        }
      } else {
        // 모든 셀의 하이라이트 제거
        for (let i = 0; i < 25; i++) {
          parent?.children[i].classList.remove('border-white/50', 'bg-white/10');
        }
      }
    }
  };

  const onClickConfirm = () => {
    const container = document.getElementById('container');
    container?.scrollTo({ top: container.scrollTop + window.innerHeight, behavior: 'smooth' });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.8 }}
      className="flex h-dvh w-full snap-center snap-always flex-col items-center justify-center gap-y-8"
    >
      <BackButton />

      <h1 className="text-4xl font-bold text-white">그리드 크기 선택</h1>

      <div className="flex w-full justify-center">
        <ul className="grid aspect-square w-full max-w-sm grid-cols-5 gap-1">
          {Array(25)
            .fill(null)
            .map((_, index) => {
              const row = Math.floor(index / 5) + 1;
              const col = (index % 5) + 1;
              return (
                <li
                  key={index}
                  data-row={row}
                  data-col={col}
                  onMouseEnter={handleHighlight}
                  onMouseLeave={onMouseLeave}
                  onClick={handleClickCell}
                  className={cn(
                    'border text-white transition-colors duration-200 ease-in-out',
                    row >= 2 && row === col
                      ? 'cursor-pointer border-white/10 hover:border-white/50 hover:bg-white/10'
                      : 'cursor-not-allowed border-white/10',
                    size && row <= size && col <= size && 'border-white/50 bg-white/10',
                  )}
                />
              );
            })}
        </ul>
      </div>

      <Button disabled={!size} onClick={onClickConfirm} variant="secondary" className="w-full max-w-sm rounded-none">
        확인
      </Button>
    </motion.section>
  );
}

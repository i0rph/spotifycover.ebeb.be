import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link2, FileImage } from 'lucide-react';

import BackButton from '@/components/backButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/stores';

export default function UrlForm() {
  const { type, size, resolution, url, setUrl } = useStore();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.8 }}
      className="flex h-dvh w-full snap-center snap-always flex-col items-center justify-center"
    >
      <BackButton />

      <div>
        <h1 className="text-4xl font-bold text-white">작업중, 수정예정</h1>
        {!!size && type === 'track' && (
          <ul className="grid w-full gap-4" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
            {Array.from({ length: size * size })
              .fill(null)
              .map((_, i) => (
                <li key={i} className="flex aspect-square flex-col justify-between gap-y-2 bg-white/5 p-2">
                  <Input className="flex-auto rounded-none" placeholder="URL을 입력해주세요" />
                  <div className="flex">
                    <Button variant="secondary" className="w-full rounded-none p-0">
                      <Link2 />
                    </Button>
                    <Button variant="secondary" className="w-full rounded-none p-0">
                      <FileImage />
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}

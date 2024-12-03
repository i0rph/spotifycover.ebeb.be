import { useState, useEffect, useRef } from 'react';
import ky, { HTTPError } from 'ky';

import { type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useStore } from '@/stores';

interface APIResponse {
  status: number;
  message: string;
  urls?: string[];
}

export default function GenerateCover({ carouselApi }: { carouselApi: CarouselApi | null }) {
  const { type, size, resolution, urls, reset } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!type || !size || !resolution || !urls) {
      return;
    }

    setIsLoading(true);
    setIsInitialized(false);

    try {
      const baseUrl = 'https://zxrmbmuklh.execute-api.ap-northeast-1.amazonaws.com/getimage';

      const refinedUrls = urls.flatMap(row =>
        row.filter(cell => cell.type === 'url' && cell.value).map(cell => cell.value),
      );

      const response = await ky.post(baseUrl, {
        json: {
          type,
          size,
          urls: refinedUrls,
        },
      });

      const { urls: imgUrls } = await response.json<APIResponse>();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx || !imgUrls) {
        return;
      }

      const refinedImgUrls = urls.reduce((acc, row, rowIndex) => {
        const fileCnt = urls.flatMap(row => row.filter(cell => cell.type === 'file')).length;

        return [
          ...acc,
          ...row.map((cell, colIndex) => {
            const urlIndex = rowIndex * size + colIndex - fileCnt;
            const index = urlIndex >= 0 ? urlIndex : 0;
            return cell.type === 'url' ? imgUrls[index] : cell.value;
          }),
        ];
      }, [] as string[]);

      const cellSize = resolution / size;

      canvas.width = resolution;
      canvas.height = resolution;

      refinedImgUrls.forEach((image: string, index: number) => {
        const x = index % size;
        const y = Math.floor(index / size);

        const img = new Image();
        img.src = image;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const scale = Math.max(cellSize / img.width, cellSize / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const dx = x * cellSize + (cellSize - scaledWidth) / 2;
          const dy = y * cellSize + (cellSize - scaledHeight) / 2;
          ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);
        };
      });

      canvas.scrollIntoView({ behavior: 'smooth' });
      setIsInitialized(true);
    } catch (e: unknown) {
      if (e instanceof HTTPError) {
        const json = await e.response.json<APIResponse>();
        toast({ variant: 'destructive', title: '이미지 생성에 실패했습니다.', description: json.message });
      } else if (e instanceof Error) {
        toast({ variant: 'destructive', title: '이미지 생성에 실패했습니다', description: e.message });
      } else {
        toast({ variant: 'destructive', title: '이미지 생성에 실패했습니다' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyImage = async () => {
    if (!isInitialized) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // https://stackoverflow.com/a/12300351
    function dataURItoBlob(dataURI: string) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      const byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to an ArrayBuffer
      const ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      const ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      const blob = new Blob([ab], { type: mimeString });
      return blob;
    }

    try {
      const data = canvas.toDataURL('image/png');
      const blob = dataURItoBlob(data);
      const dataItem = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([dataItem]);
      toast({ variant: 'success', title: '이미지가 클립보드에 복사되었습니다' });
    } catch {
      toast({ variant: 'destructive', title: '클립보드 복사에 실패했습니다' });
    }
  };

  const downloadImage = () => {
    if (!isInitialized) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    try {
      const a = document.createElement('a');
      a.href = canvas.toDataURL();
      a.download = `spotify-cover-${type}-${size}-${resolution}px-${+new Date()}.png`;
      a.click();

      a.remove();
    } catch {
      toast({ variant: 'destructive', title: '이미지 다운로드에 실패했습니다' });
    }
  };

  const onClickReset = () => {
    carouselApi?.scrollTo(0);
    reset();
    setIsInitialized(false);
  };

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const canScrollNext = carouselApi.canScrollNext() ?? false;

    if (!canvasRef.current || !type || !size || !resolution || !urls) {
      setIsInitialized(false);
    } else if (!canScrollNext) {
      void fetchData();
    }

    return () => {
      setIsInitialized(false);
    };
  }, [type, size, resolution, urls, carouselApi]);

  return (
    <section className="flex h-dvh w-full flex-col items-center justify-center px-8 sm:px-0">
      <div className="grid w-full max-w-2xl grid-cols-1 gap-4">
        <canvas
          ref={canvasRef}
          onClick={() => void copyImage()}
          className={cn(
            'aspect-square w-full bg-white/5 object-cover',
            isInitialized || isLoading ? 'block cursor-pointer' : 'hidden',
            isLoading && 'animate-pulse',
          )}
        />

        <Button type="button" variant="secondary" className="w-full rounded-none" onClick={downloadImage}>
          다운로드
        </Button>

        <Button type="button" variant="secondary" className="w-full rounded-none" onClick={onClickReset}>
          다시생성
        </Button>
      </div>
    </section>
  );
}

import { useState, useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { set, useForm } from 'react-hook-form';
import { z } from 'zod';
import ky, { HTTPError } from 'ky';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useScreenDetector } from '@/hooks/useScreenDetector';
import { cn } from '@/lib/utils';

interface APIResponse {
  status: number;
  message: string;
  urls: string[];
}

const FormSchema = z.object({
  type: z.enum(['track', 'playlist'], { message: '분류를 선택해주세요' }),
  size: z.coerce.number({ message: '그리드 크기를 선택해주세요' }).min(2).max(5),
  urls: z.array(z.string().url({ message: '올바른 URL을 입력해주세요' })).optional(),
  resolution: z.coerce.number({ message: '해상도를 선택해주세요' }).min(300).max(3200),
});

export default function HomePage() {
  const { isMobile } = useScreenDetector();

  const canvasRef = useRef<HTMLCanvasElement>(null); // 이미지 렌더링을 위한 캔버스

  const [debugCount, setDebugCount] = useState(0); // 디버깅용 카운트
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [isInitialized, setIsInitialized] = useState(false); // 이미지 초기화 상태

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange', // 입력값이 변경될 때마다 유효성 검사
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setIsInitialized(false);

    try {
      const { type, size, urls, resolution } = data;

      const baseUrl = 'https://b4cwvvuc9j.execute-api.ap-northeast-1.amazonaws.com/getimage';

      const response = await ky.post(baseUrl, {
        json: {
          type,
          size,
          urls,
        },
      });

      const { urls: imgUrls } = (await response.json()) as APIResponse;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx || !imgUrls) {
        return;
      }

      const cellSize = resolution / size;

      canvas.width = resolution;
      canvas.height = resolution;

      imgUrls.forEach((image: string, index: number) => {
        const x = index % size;
        const y = Math.floor(index / size);

        const img = new Image();
        img.src = image;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, x * cellSize, y * cellSize, cellSize, cellSize);
        };
      });

      canvas.scrollIntoView({ behavior: 'smooth' });
      setIsInitialized(true);
    } catch (e: unknown) {
      if (e instanceof HTTPError) {
        const json = (await e.response.json()) as APIResponse;
        toast({ variant: 'destructive', title: '이미지 생성에 실패했습니다.', description: json.message });
      } else if (e instanceof Error) {
        toast({ variant: 'destructive', title: '이미지 생성에 실패했습니다', description: e.message });
      } else {
        toast({ variant: 'destructive', title: '이미지 생성에 실패했습니다' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const copyImage = async () => {
    if (!isInitialized) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.toBlob(blob => {
      if (!blob) {
        return;
      }

      try {
        const data = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([data]);

        toast({ variant: 'success', title: '이미지가 클립보드에 복사되었습니다' });
      } catch {
        toast({ variant: 'destructive', title: '클립보드 복사에 실패했습니다' });
      }
    });
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
      const { type, size, resolution } = form.watch();

      const a = document.createElement('a');
      a.href = canvas.toDataURL();
      a.download = `spotify-cover-${type}-${size}-${resolution}px-${+new Date()}.png`;
      a.click();

      a.remove();
    } catch {
      toast({ variant: 'destructive', title: '이미지 다운로드에 실패했습니다' });
    }
  };

  const onClickDebug = () => {
    setDebugCount(prev => prev + 1);
  };

  // 그리드 크기에 따른 해상도 목록
  const resolutions = useMemo(() => {
    const { size } = form.watch();

    if (!size) {
      return [];
    }

    const minResolution = 300;
    const maxResolution = size ? Math.floor((640 * size) / 100) * 100 : 600;

    return Array.from({ length: (maxResolution - minResolution) / 100 + 1 }, (_, index) => minResolution + index * 100);
  }, [form.watch('size')]);

  // 트랙 그리드 크기 변경 시 URL 초기화
  useEffect(() => {
    const { size, type } = form.watch();
    if (!!size && type === 'track') {
      form.clearErrors('urls');
      form.resetField('urls');
    }
  }, [form.watch('size')]);

  // 분류 변경 시 URL 초기화
  useEffect(() => {
    form.clearErrors('urls');
    form.resetField('urls');
  }, [form.watch('type')]);

  // 해상도 변경 시 캔버스 초기화
  useEffect(() => {
    setIsInitialized(false);
    canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [form.watch('resolution')]);

  return (
    <section className="mx-auto max-w-7xl p-4">
      <div className="relative flex flex-col items-start gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full items-start gap-6">
            <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-3">
              <legend className="-ml-1 select-none whitespace-nowrap px-1 text-sm font-bold" onClick={onClickDebug}>
                설정
              </legend>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>분류</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="분류를 선택해주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="track">곡</SelectItem>
                          <SelectItem value="playlist">플레이리스트</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>그리드 크기</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="그리드 크기를 선택해주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">2x2</SelectItem>
                          <SelectItem value="3">3x3</SelectItem>
                          <SelectItem value="4">4x4</SelectItem>
                          <SelectItem value="5">5x5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="resolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>해상도</FormLabel>
                      <Select onValueChange={field.onChange} disabled={!resolutions.length}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="해상도를 선택해주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resolutions.map(resolution => (
                            <SelectItem key={`res_${resolution}`} value={`${resolution}`}>
                              {resolution}x{resolution}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>

            {!!form.watch('type') && !!form.watch('size') && (
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 whitespace-nowrap px-1 text-sm font-bold">링크</legend>
                <div className="grid gap-3">
                  {form.watch('type') === 'track' ? (
                    <ul
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: isMobile
                          ? 'repeat(1, minmax(0, 1fr))'
                          : `repeat(${form.watch('size')}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array(form.watch('size') * form.watch('size'))
                        .fill(null)
                        .map((_, index) => (
                          <FormField
                            key={`url_track_${index}`}
                            control={form.control}
                            name={`urls.${index}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="url"
                                    placeholder="곡 공유 링크를 입력해주세요"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                    </ul>
                  ) : (
                    <FormField
                      control={form.control}
                      name="urls.0"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="플레이리스트 공유 링크를 입력해주세요"
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </fieldset>
            )}

            <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full">
              생성
            </Button>
          </form>
        </Form>

        {debugCount > 10 && (
          <code className="w-full whitespace-pre-wrap bg-gray-200">{JSON.stringify(form.watch(), null, 2)}</code>
        )}
      </div>

      <div className="space-y-2 py-10">
        <canvas
          className={cn(
            'mx-auto aspect-square w-full bg-gray-100 object-cover',
            isInitialized || isLoading ? 'block cursor-pointer' : 'hidden',
            isLoading && 'animate-pulse',
          )}
          style={{ maxWidth: `${form.watch('resolution')}px` }}
          ref={canvasRef}
          onClick={copyImage}
        />

        {isInitialized && (
          <div className="grid grid-cols-1 justify-items-center">
            <Button
              type="button"
              onClick={downloadImage}
              className="w-full"
              style={{ maxWidth: `${form.watch('resolution')}px` }}
            >
              다운로드
            </Button>
            <p className="mt-2 text-center text-sm text-gray-400">이미지를 클릭하면 클립보드에 복사됩니다</p>
          </div>
        )}
      </div>
    </section>
  );
}

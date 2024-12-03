import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';

import { type CarouselApi } from '@/components/ui/carousel';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useStore } from '@/stores';

const formSchema = z.object({
  type: z.enum(['playlist', 'track']),
  size: z.number(),
  urls: z.array(
    z.array(
      z.object({
        type: z.enum(['url', 'file']),
        value: z.string().url().or(z.string().startsWith('data:image/')),
        fileName: z.string().optional(),
      }),
    ),
  ),
});

export default function UrlForm({ carouselApi }: { carouselApi: CarouselApi | null }) {
  const { type, size, urls, setUrls } = useStore();

  const fileInputRefs = useRef<HTMLInputElement[][]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: type ?? undefined,
      size: size ?? undefined,
      urls: urls ?? undefined,
    },
  });

  // eslint-disable-next-line @typescript-eslint/require-await
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setUrls(data.urls);
    carouselApi?.scrollNext();
  };

  const triggerFileInput = (rowIndex: number, colIndex: number) => {
    fileInputRefs.current[rowIndex][colIndex]?.click();
  };

  const handleFileUpload = (rowIndex: number, colIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const newGrid = form
        .watch('urls')
        .map((row, rIndex) =>
          row.map((cell, cIndex) =>
            rIndex === rowIndex && cIndex === colIndex
              ? { type: 'file' as const, value: e.target?.result as string, fileName: file.name }
              : cell,
          ),
        );
      form.setValue('urls', newGrid);
    };
    reader.readAsDataURL(file);
  };

  const clearCell = (rowIndex: number, colIndex: number) => {
    const newGrid = form
      .watch('urls')
      .map((row, rIndex) =>
        row.map((cell, cIndex) =>
          rIndex === rowIndex && cIndex === colIndex ? { type: 'url' as const, value: '' } : cell,
        ),
      );

    fileInputRefs.current[rowIndex][colIndex].value = '';
    form.setValue('urls', newGrid);
  };

  useEffect(() => {
    if (!size || !form) return;

    const initialGrid = Array.from({ length: size }).map(() =>
      Array.from({ length: size }).map(() => ({
        type: 'url' as 'url' | 'file',
        value: '',
      })),
    );

    if (form.watch('urls').length !== size) {
      form.setValue('urls', initialGrid);

      fileInputRefs.current = Array.from({ length: size }).map(() => []);
    }
  }, [size, form]);

  useEffect(() => {
    if (type) {
      form.setValue('type', type);
    }

    if (size) {
      form.setValue('size', size);
    }
  }, [type, size]);

  useEffect(() => {
    if (urls && urls.length) {
      form.setValue('urls', urls);
    } else if (form.watch('urls').length !== urls?.length) {
      form.setValue('urls', urls);
    }
  }, [urls]);

  return (
    <section className="h-dvh w-full px-12 sm:px-0">
      <Form {...form}>
        <form
          onSubmit={e => {
            e.preventDefault();
            void form.handleSubmit(onSubmit)(e);
          }}
          className="flex h-full flex-col items-center justify-center gap-y-10 sm:p-4"
        >
          {!!size && type === 'track' && (
            <ul
              className="grid w-full max-w-2xl gap-4"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {form.watch('urls').map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <li
                    key={`${rowIndex}-${colIndex}`}
                    className="flex size-full flex-col justify-between gap-y-2 bg-white/5 p-2"
                  >
                    <FormField
                      control={form.control}
                      name={`urls.${rowIndex}.${colIndex}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            {cell.type === 'url' ? (
                              <Input
                                className="aspect-square size-full rounded-none text-black"
                                placeholder="URL을 입력해주세요."
                                {...field}
                              />
                            ) : (
                              <div className="group relative aspect-square">
                                <img src={cell.value} className="aspect-square object-cover" />
                                <div className="size-</div>full absolute inset-0 flex items-center justify-center group-hover:bg-black/70">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => clearCell(rowIndex, colIndex)}
                                    className="size-full rounded-none group-hover:bg-black/70 group-hover:text-white"
                                  >
                                    <X className="hidden size-20 stroke-1 group-hover:block" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="w-full rounded-none"
                        onClick={() => triggerFileInput(rowIndex, colIndex)}
                      >
                        <Upload />
                      </Button>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files && handleFileUpload(rowIndex, colIndex, e.target.files[0])}
                      ref={el => {
                        if (fileInputRefs.current[rowIndex] && el) {
                          fileInputRefs.current[rowIndex][colIndex] = el;
                        }
                      }}
                    />
                  </li>
                )),
              )}
            </ul>
          )}

          <Button type="submit" variant="secondary" className="w-full max-w-2xl rounded-none">
            확인
          </Button>
        </form>
      </Form>
    </section>
  );
}

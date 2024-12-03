import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import TypeSelect from '@/components/typeSelect';
import SizeSelect from '@/components/sizeSelect';
import ResolutionSelect from '@/components/resolutionSelect';
import UrlForm from '@/components/urlForm';
import GenerateCover from '@/components/generateCover';

export default function Home() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [isPrevScrollable, setIsPrevScrollable] = useState(false);
  const [isNextScrollable, setIsNextScrollable] = useState(false);

  const handlePrev = () => {
    carouselApi?.scrollPrev();
  };

  // const handleNext = () => {
  //   carouselApi?.scrollNext();
  // };

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', () => {
      setIsPrevScrollable(carouselApi.canScrollPrev ?? false);
      setIsNextScrollable(carouselApi.canScrollNext ?? false);
    });
  }, [carouselApi]);

  return (
    <div id="container" className="relative h-full w-full sm:px-0">
      {isPrevScrollable && isNextScrollable && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10 h-full hover:bg-white/5 hover:text-white"
          onClick={handlePrev}
        >
          <ChevronLeft />
        </Button>
      )}
      {/* <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 z-10 h-full hover:bg-white/5 hover:text-white"
        onClick={handleNext}
      >
        <ChevronRight />
      </Button> */}

      <Carousel opts={{ watchDrag: false }} setApi={setCarouselApi}>
        <CarouselContent>
          <CarouselItem>
            <TypeSelect carouselApi={carouselApi} />
          </CarouselItem>
          <CarouselItem>
            <SizeSelect carouselApi={carouselApi} />
          </CarouselItem>
          <CarouselItem>
            <ResolutionSelect carouselApi={carouselApi} />
          </CarouselItem>
          <CarouselItem>
            <UrlForm carouselApi={carouselApi} />
          </CarouselItem>
          <CarouselItem>
            <GenerateCover carouselApi={carouselApi} />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}

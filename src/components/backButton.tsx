import { ChevronsUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function BackButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute left-1/2 top-4 -mx-4 text-white hover:bg-transparent hover:text-white sm:mx-0"
      onClick={() => {
        const container = document.getElementById('container');
        container?.scrollTo({ top: container.scrollTop - window.innerHeight, behavior: 'smooth' });
      }}
    >
      <ChevronsUp className="size-10" />
    </Button>
  );
}

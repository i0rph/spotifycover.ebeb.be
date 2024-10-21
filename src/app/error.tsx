import { useState, useEffect } from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

interface ErrorState {
  status?: number;
  message?: string;
}

export default function ErrorBoundary() {
  const error = useRouteError();

  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  useEffect(() => {
    if (isRouteErrorResponse(error)) {
      setErrorState({
        status: (error as { status: number }).status,
        message: (error as { data?: string; statusText: string }).data || (error as { statusText: string }).statusText,
      });
    } else if (error instanceof Error) {
      setErrorState({ message: error.message });
    } else if (typeof error === 'string') {
      setErrorState({ message: error });
    } else {
      setErrorState({ message: 'An unknown error occurred.' });
    }
  }, [error]);

  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        {!!errorState?.status && <p className="text-base font-semibold text-gray-600">{errorState.status}</p>}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">오류가 발생했습니다</h1>
        {!!errorState?.message && <p className="mt-6 text-base leading-7 text-gray-600">{errorState.message}</p>}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button variant="default" size="lg" asChild>
            <Link to="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

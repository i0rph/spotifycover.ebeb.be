import { Suspense, lazy } from 'react';
import { RouterProvider, createBrowserRouter, ScrollRestoration } from 'react-router-dom';

interface IRoute {
  path: string;
  Element: React.ComponentType;
}
interface Pages {
  [key: string]: () => Promise<{ default: React.ComponentType }>;
}

import { LayoutWrapper, PageTransition } from '@/app/layout';
import ErrorBoundary from '@/app/error';

const pages = import.meta.glob('../pages/**/*.tsx') as Pages;

const routes: IRoute[] = [];

for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.tsx$/)?.[1];
  if (!fileName) {
    continue;
  }

  const normalizedPathName = fileName.includes('$') ? fileName.replace('$', ':') : fileName.replace(/\/index/, '');

  routes.push({
    path: fileName === 'index' ? '/' : `/${normalizedPathName.toLowerCase()}`,
    Element: lazy(pages[path]),
  });
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutWrapper />,
    errorElement: <ErrorBoundary />,
    children: routes.map(({ Element, ...rest }) => ({
      ...rest,
      element: (
        <PageTransition>
          <Element />
          <ScrollRestoration />
        </PageTransition>
      ),
    })),
  },
]);

export default function App() {
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

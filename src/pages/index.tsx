import { Suspense, lazy } from 'react';
import {
  RouterProvider,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  ScrollRestoration,
} from 'react-router-dom';

import DefaultLayout from '@/components/layout';

const Home = lazy(() => import('@/pages/home'));
const Error = lazy(() => import('@/app/error'));

const routes = [{ path: '/', element: <Home /> }];

const router = createBrowserRouter(
  createRoutesFromElements(
    routes.map(route => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <>
            <DefaultLayout>{route.element}</DefaultLayout>
            <ScrollRestoration />
          </>
        }
        errorElement={<Error />}
      />
    )),
  ),
);

export default function Routes() {
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

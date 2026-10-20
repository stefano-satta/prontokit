import { createBrowserRouter, RouterProvider } from 'react-router';
import { FOOTER_LINKS } from './config/footerLinks';
import { UTILITIES } from './config/utilities';
import { RootLayout } from './components/layouts/RootLayout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      ...[...UTILITIES, ...FOOTER_LINKS].flatMap(({ path, loadPage }) =>
        loadPage ? [{ path, lazy: async () => ({ Component: (await loadPage()).default }) }] : [],
      ),
    ],
  },
  // Fuori dal layout: pagina intera senza navbar né footer
  { path: '*', element: <NotFoundPage /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}

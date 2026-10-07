import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout.jsx';
import { UsersListPage } from './pages/UsersListPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// URL -> page mapping. Every page renders inside <Layout /> (header + nav).
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<UsersListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

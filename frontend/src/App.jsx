import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout.jsx';
import { UsersListPage } from './pages/UsersListPage.jsx';
import { CreateUserPage } from './pages/CreateUserPage.jsx';
import { EditUserPage } from './pages/EditUserPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// URL -> page mapping. Every page renders inside <Layout /> (header + nav).
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<UsersListPage />} />
        <Route path="users/new" element={<CreateUserPage />} />
        <Route path="users/:id/edit" element={<EditUserPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

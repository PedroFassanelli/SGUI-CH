import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

// Renders a page inside an in-memory router (no real browser URL needed).
// The "/" route is replaced by a probe that shows the flash message received,
// so tests can assert where the page navigated to and with which message.
export function renderPage(element, { path, route = path }) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="/" element={<ListPageProbe />} />
      </Routes>
    </MemoryRouter>,
  );
  return { user };
}

function ListPageProbe() {
  const location = useLocation();
  return (
    <div>
      <h1>Listado</h1>
      <p>{location.state?.flash?.message}</p>
    </div>
  );
}

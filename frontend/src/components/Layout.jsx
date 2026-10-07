import { NavLink, Outlet } from 'react-router';

// Shared frame for every page. <Outlet /> renders the page that matches the URL.
export function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header__content">
          <span className="header__brand">Panel RRHH</span>
          <nav className="nav" aria-label="Principal">
            <NavLink to="/" end className="nav__link">
              Usuarios
            </NavLink>
            <NavLink to="/users/new" className="nav__link">
              Nuevo usuario
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

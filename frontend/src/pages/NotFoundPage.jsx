import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="placeholder">
      <h1 className="page-header__title">Página no encontrada</h1>
      <p>La dirección que buscás no existe.</p>
      <Link to="/" className="button button--primary">
        Volver al listado
      </Link>
    </section>
  );
}

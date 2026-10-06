import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@calcom/atoms/globals.min.css';
import './stylo-booker.css';

const services = [
  { slug: 'peinados', name: 'Peinados de Gala & Eventos' },
  { slug: 'tratamiento', name: 'Tratamiento de Brillo Capilar' },
  { slug: 'corte', name: 'Corte & Styling Visajista' },
  { slug: 'color', name: 'Coloración Editorial & Balayage' },
];

function StyloBooker() {
  const [serviceSlug, setServiceSlug] = useState('');
  const [BookerEmbedComponent, setBookerEmbedComponent] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const service = services.find(({ slug }) => slug === serviceSlug);

  useEffect(() => {
    let isCurrent = true;
    setBookerEmbedComponent(null);
    setLoadFailed(false);
    if (service) {
      import('@calcom/atoms').then(({ BookerEmbed: Component }) => {
        if (isCurrent) setBookerEmbedComponent(() => Component);
      }).catch(() => {
        if (isCurrent) setLoadFailed(true);
      });
    }
    return () => { isCurrent = false; };
  }, [serviceSlug]);

  return (
    <div className="stylo-booker">
      <label className="stylo-booker__label" htmlFor="stylo-service-select">Elige un servicio</label>
      <select
        className="stylo-booker__select"
        id="stylo-service-select"
        value={serviceSlug}
        onChange={(event) => setServiceSlug(event.target.value)}
      >
        <option value="">Selecciona un servicio</option>
        {services.map(({ slug, name }) => <option key={slug} value={slug}>{name}</option>)}
      </select>
      {service ? (
        <div className="stylo-booker__calendar">
          {BookerEmbedComponent ? (
            <BookerEmbedComponent
              username="peluqueriaa"
              eventSlug={service.slug}
              defaultPhoneCountry="ad"
              view="MONTH_VIEW"
            />
          ) : (
            <p className="stylo-booker__hint" role="status">
              {loadFailed ? 'No se pudo cargar el calendario. Recarga la página e inténtalo de nuevo.' : 'Cargando horarios…'}
            </p>
          )}
        </div>
      ) : (
        <p className="stylo-booker__hint">Selecciona el servicio para ver los horarios disponibles.</p>
      )}
    </div>
  );
}

const root = document.getElementById('cal-booker-root');
if (root) createRoot(root).render(<StyloBooker />);

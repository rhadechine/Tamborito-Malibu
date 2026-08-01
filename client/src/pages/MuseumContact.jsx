import { useState } from 'react';
import MuseumFooter from '../components/MuseumFooter';
import PageShell from '../components/PageShell';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  inquiryType: 'Consulta general',
  visitors: '',
  proposedDate: '',
  message: '',
};

export default function MuseumContact() {
  const [formData, setFormData] =
    useState(initialForm);

  const [message, setMessage] =
    useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    setMessage(
      'La solicitud fue preparada correctamente. La conexión con el backend se añadirá en la siguiente fase.',
    );

    setFormData(initialForm);
  }

  return (
    <PageShell variant="museum">
      <main>
        <section className="page-banner museo-banner">
          <div className="container center">
            <p className="section-tag museo-tag">
              Contáctanos
            </p>

            <h1 className="page-title">
              Visitas, consultas y colaboración cultural.
            </h1>

            <p className="lead center-text max-text">
              Comunícate con el Museo para solicitar
              información, consultar sobre las colecciones o
              coordinar una visita individual, grupal o
              educativa.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container form-layout">
            <article className="form-info museo-card">
              <p className="section-tag museo-tag">
                Información del Museo
              </p>

              <h2>
                Planea tu contacto o visita.
              </h2>

              <p>
                Los datos oficiales de dirección, horarios,
                teléfono, WhatsApp y correo deberán
                reemplazarse cuando el Museo los confirme.
              </p>

              <div className="info-points">
                <div className="info-point museo-box">
                  <strong>Horario</strong>

                  <p>
                    Por confirmar con la administración del
                    Museo.
                  </p>
                </div>

                <div className="info-point museo-box">
                  <strong>Ubicación</strong>

                  <p>
                    Zambrano, Bolívar. Dirección exacta por
                    confirmar.
                  </p>
                </div>

                <div className="info-point museo-box">
                  <strong>Reservas</strong>

                  <p>
                    Atención para visitantes, grupos
                    escolares, investigadores y aliados
                    culturales.
                  </p>
                </div>

                <div className="info-point museo-box">
                  <strong>Tipos de solicitud</strong>

                  <p>
                    Visitas, consultas sobre piezas,
                    actividades educativas, investigación y
                    colaboración.
                  </p>
                </div>
              </div>
            </article>

            <form
              className="styled-form"
              onSubmit={handleSubmit}
            >
              <p className="section-tag museo-tag">
                Formulario de contacto
              </p>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="museum-contact-name">
                    Nombre completo
                  </label>

                  <input
                    id="museum-contact-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="museum-contact-email">
                    Correo electrónico
                  </label>

                  <input
                    id="museum-contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="museum-contact-phone">
                    Teléfono
                  </label>

                  <input
                    id="museum-contact-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="museum-contact-type">
                    Tipo de consulta
                  </label>

                  <select
                    id="museum-contact-type"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                  >
                    <option>
                      Consulta general
                    </option>

                    <option>
                      Solicitud de visita
                    </option>

                    <option>
                      Visita educativa
                    </option>

                    <option>
                      Información sobre una pieza
                    </option>

                    <option>
                      Investigación o colaboración
                    </option>

                    <option>
                      Donación de objetos o documentos
                    </option>

                    <option>
                      Otro
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="museum-contact-visitors">
                    Número de visitantes
                  </label>

                  <input
                    id="museum-contact-visitors"
                    name="visitors"
                    type="number"
                    min="1"
                    value={formData.visitors}
                    onChange={handleChange}
                    placeholder="Solo para visitas"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="museum-contact-date">
                    Fecha propuesta
                  </label>

                  <input
                    id="museum-contact-date"
                    name="proposedDate"
                    type="date"
                    value={formData.proposedDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group full">
                  <label htmlFor="museum-contact-message">
                    Mensaje
                  </label>

                  <textarea
                    id="museum-contact-message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className="bank-box museo-box"
                  role="status"
                >
                  <p>{message}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-museo full-btn"
              >
                Enviar solicitud
              </button>
            </form>
          </div>
        </section>

        <section className="section museo-soft">
          <div className="container cards-grid three">
            <article className="future-card museo-card">
              <h3>Visitas individuales</h3>

              <p>
                Consulta la disponibilidad del Museo y las
                recomendaciones necesarias antes de asistir.
              </p>
            </article>

            <article className="future-card museo-card">
              <h3>Grupos y colegios</h3>

              <p>
                Solicita recorridos para estudiantes,
                docentes, instituciones y organizaciones
                comunitarias.
              </p>
            </article>

            <article className="future-card museo-card">
              <h3>Investigación</h3>

              <p>
                Presenta consultas académicas o propuestas de
                colaboración relacionadas con las
                colecciones.
              </p>
            </article>
          </div>
        </section>
      </main>

      <MuseumFooter />
    </PageShell>
  );
}
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import FoundationFooter from '../components/FoundationFooter';
import MuseumFooter from '../components/MuseumFooter';
import PageShell from '../components/PageShell';
import PlatformIcon from '../components/PlatformIcon';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

const DONATIONS_STORAGE_KEY =
  'tamborito.donations.demo.v1';

const MINIMUM_DONATION = 10000;

const SUGGESTED_AMOUNTS = [
  20000,
  50000,
  100000,
  200000,
];

const DESTINATIONS = [
  {
    id: 'foundation',
    name: 'Fundación Tamborito',
    shortName: 'Fundación',
    description:
      'Formación musical, instrumentos, materiales pedagógicos y actividades comunitarias.',
  },
  {
    id: 'museum',
    name: 'Museo Arqueológico Malibú',
    shortName: 'Museo',
    description:
      'Conservación, catalogación y divulgación de las colecciones patrimoniales.',
  },
  {
    id: 'ecosystem',
    name: 'Ecosistema cultural',
    shortName: 'Ecosistema',
    description:
      'Apoyo general para las necesidades compartidas de las dos organizaciones.',
  },
];

const PAYMENT_METHODS = [
  {
    id: 'pse',
    name: 'PSE',
    description:
      'Débito desde una cuenta bancaria colombiana.',
    badge: 'PSE',
  },
  {
    id: 'bancolombia',
    name: 'Botón Bancolombia',
    description:
      'Autorización desde los canales seguros de Bancolombia.',
    badge: 'B',
  },
  {
    id: 'nequi',
    name: 'Nequi',
    description:
      'Confirmación del aporte desde la aplicación Nequi.',
    badge: 'N',
  },
  {
    id: 'transfer',
    name: 'Transferencia bancaria',
    description:
      'Transferencia a la cuenta institucional compartida.',
    badge: 'TR',
  },
];

const BANKS = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Banco AV Villas',
  'Banco Caja Social',
  'Banco Agrario',
  'Scotiabank Colpatria',
  'Itaú Colombia',
  'Otro banco',
];

/*
 * Sustituye estos valores por los datos oficiales
 * antes de publicar el sitio.
 */
const SHARED_BANK_ACCOUNT = {
  bank: 'Bancolombia',
  accountType: 'Cuenta de ahorros',
  accountNumber: 'Pendiente por configurar',
  holder: 'Fundación Tamborito',
  identification: 'Pendiente por configurar',
};

const PAGE_CONTENT = {
  foundation: {
    eyebrow: 'Donaciones Fundación Tamborito',
    title:
      'Tu aporte mantiene viva la formación cultural.',
    description:
      'Apoya los procesos musicales, educativos y comunitarios desarrollados por la Fundación Tamborito.',
    impactTitle: 'El aporte fortalece',
    impactItems: [
      'Compra y mantenimiento de instrumentos.',
      'Procesos formativos para niños y jóvenes.',
      'Producción de materiales pedagógicos.',
      'Actividades culturales y comunitarias.',
    ],
  },

  museum: {
    eyebrow:
      'Donaciones Museo Arqueológico Malibú',
    title:
      'Tu aporte ayuda a conservar la memoria del territorio.',
    description:
      'Apoya la conservación, documentación y divulgación de las colecciones del Museo Arqueológico Malibú.',
    impactTitle: 'El aporte fortalece',
    impactItems: [
      'Conservación preventiva de piezas.',
      'Catalogación y archivo de las colecciones.',
      'Producción de materiales educativos.',
      'Mantenimiento de los espacios del Museo.',
    ],
  },
};

const INITIAL_DONOR = {
  fullName: '',
  email: '',
  phone: '',
  documentType: 'CC',
  documentNumber: '',
  message: '',
  anonymous: false,
};

const INITIAL_PAYMENT_DETAILS = {
  personType: 'natural',
  bank: '',
  nequiPhone: '',
};

function digitsOnly(value = '') {
  return value.replace(/\D/g, '');
}

function readStoredDonations() {
  try {
    return JSON.parse(
      localStorage.getItem(
        DONATIONS_STORAGE_KEY,
      ) || '[]',
    );
  } catch {
    return [];
  }
}

function persistDemoDonation(donation) {
  const currentDonations =
    readStoredDonations();

  localStorage.setItem(
    DONATIONS_STORAGE_KEY,
    JSON.stringify([
      donation,
      ...currentDonations,
    ]),
  );
}

export default function Donations() {
  const location = useLocation();
  const { user } = useAuth();

  const isMuseumRoute =
    location.pathname.startsWith('/museo');

  const pageContext = isMuseumRoute
    ? 'museum'
    : 'foundation';

  const pageContent =
    PAGE_CONTENT[pageContext];

  const accentTextClass = isMuseumRoute
    ? 'text-museoClay'
    : 'text-accent';

  const accentBackgroundClass =
    isMuseumRoute
      ? 'bg-museoClay hover:bg-[#7f4a2f]'
      : 'bg-accent hover:bg-[#bd6241]';

  const selectedBorderClass =
    isMuseumRoute
      ? 'border-museoClay bg-museoStone shadow-[0_0_0_3px_rgba(155,95,61,0.12)]'
      : 'border-accent bg-[#fff1e9] shadow-[0_0_0_3px_rgba(213,122,82,0.12)]';

  const selectedBadgeClass =
    isMuseumRoute
      ? 'border-museoClay bg-museoClay text-white'
      : 'border-accent bg-accent text-white';

  const focusClass = isMuseumRoute
    ? 'focus:border-museoClay focus:shadow-[0_0_0_3px_rgba(155,95,61,0.12)]'
    : 'focus:border-accent focus:shadow-[0_0_0_3px_rgba(213,122,82,0.12)]';

  const focusWithinClass =
    isMuseumRoute
      ? 'focus-within:border-museoClay focus-within:shadow-[0_0_0_3px_rgba(155,95,61,0.12)]'
      : 'focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(213,122,82,0.12)]';

  const [destination, setDestination] =
    useState(pageContext);

  const [
    suggestedAmount,
    setSuggestedAmount,
  ] = useState(50000);

  const [
    customAmount,
    setCustomAmount,
  ] = useState('');

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('pse');

  const [donor, setDonor] =
    useState(INITIAL_DONOR);

  const [
    paymentDetails,
    setPaymentDetails,
  ] = useState(
    INITIAL_PAYMENT_DETAILS,
  );

  const [
    acceptedDataPolicy,
    setAcceptedDataPolicy,
  ] = useState(false);

  const [
    acceptedDonationTerms,
    setAcceptedDonationTerms,
  ] = useState(false);

  const [errors, setErrors] =
    useState({});

  const [processing, setProcessing] =
    useState(false);

  const [receipt, setReceipt] =
    useState(null);

  useEffect(() => {
    setDestination(pageContext);
  }, [pageContext]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setDonor((current) => ({
      ...current,
      fullName:
        current.fullName ||
        user.name ||
        '',
      email:
        current.email ||
        user.email ||
        '',
      phone:
        current.phone ||
        user.phone ||
        '',
    }));

    setPaymentDetails((current) => ({
      ...current,
      nequiPhone:
        current.nequiPhone ||
        user.phone ||
        '',
    }));
  }, [user]);

  const donationAmount = useMemo(
    () =>
      Number(
        customAmount ||
        suggestedAmount ||
        0,
      ),
    [
      customAmount,
      suggestedAmount,
    ],
  );

  const selectedDestination =
    DESTINATIONS.find(
      (item) =>
        item.id === destination,
    );

  const selectedPaymentMethod =
    PAYMENT_METHODS.find(
      (item) =>
        item.id === paymentMethod,
    );

  function clearError(fieldName) {
    setErrors((current) => {
      if (!current[fieldName]) {
        return current;
      }

      const nextErrors = {
        ...current,
      };

      delete nextErrors[fieldName];

      return nextErrors;
    });
  }

  function updateDonor(event) {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setDonor((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    clearError(name);
  }

  function updatePaymentDetails(
    event,
  ) {
    const {
      name,
      value,
    } = event.target;

    setPaymentDetails((current) => ({
      ...current,
      [name]:
        name === 'nequiPhone'
          ? digitsOnly(value)
          : value,
    }));

    clearError(name);
  }

  function selectSuggestedAmount(
    amount,
  ) {
    setSuggestedAmount(amount);
    setCustomAmount('');
    clearError('amount');
  }

  function validateDonation() {
    const nextErrors = {};

    const normalizedPhone =
      digitsOnly(donor.phone);

    const normalizedNequiPhone =
      digitsOnly(
        paymentDetails.nequiPhone,
      );

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        donor.email.trim(),
      );

    if (!destination) {
      nextErrors.destination =
        'Selecciona el destino del aporte.';
    }

    if (
      !donationAmount ||
      donationAmount <
        MINIMUM_DONATION
    ) {
      nextErrors.amount =
        `El aporte mínimo es ${formatCurrency(
          MINIMUM_DONATION,
        )}.`;
    }

    if (!donor.fullName.trim()) {
      nextErrors.fullName =
        'Ingresa el nombre completo.';
    }

    if (!validEmail) {
      nextErrors.email =
        'Ingresa un correo electrónico válido.';
    }

    if (
      normalizedPhone.length !== 10
    ) {
      nextErrors.phone =
        'Ingresa un teléfono de 10 dígitos.';
    }

    if (
      [
        'pse',
        'bancolombia',
      ].includes(paymentMethod) &&
      !donor.documentNumber.trim()
    ) {
      nextErrors.documentNumber =
        'Ingresa el número de documento.';
    }

    if (
      paymentMethod === 'pse' &&
      !paymentDetails.bank
    ) {
      nextErrors.bank =
        'Selecciona una entidad financiera.';
    }

    if (
      paymentMethod === 'nequi' &&
      normalizedNequiPhone.length !==
        10
    ) {
      nextErrors.nequiPhone =
        'Ingresa el número Nequi de 10 dígitos.';
    }

    if (!acceptedDataPolicy) {
      nextErrors.dataPolicy =
        'Debes autorizar el tratamiento de datos.';
    }

    if (!acceptedDonationTerms) {
      nextErrors.donationTerms =
        'Debes aceptar las condiciones de la donación.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
    );
  }

  function submitDonation(event) {
    event.preventDefault();

    if (!validateDonation()) {
      return;
    }

    setProcessing(true);

    /*
     * Esta simulación deberá sustituirse
     * posteriormente por una petición al
     * backend de Django REST Framework.
     */
    window.setTimeout(() => {
      const createdAt =
        new Date().toISOString();

      const reference =
        `DON-${Date.now()
          .toString()
          .slice(-10)}`;

      const donation = {
        id: `don-${Date.now()}`,
        reference,
        userId: user?.id || null,
        sourcePortal: pageContext,
        destination,
        destinationName:
          selectedDestination?.name,
        amount: donationAmount,
        currency: 'COP',
        paymentMethod,
        paymentMethodName:
          selectedPaymentMethod?.name,

        donor: {
          fullName:
            donor.fullName.trim(),
          email:
            donor.email
              .trim()
              .toLowerCase(),
          phone:
            digitsOnly(
              donor.phone,
            ),
          documentType:
            donor.documentType,
          documentNumber:
            donor.documentNumber.trim(),
          message:
            donor.message.trim(),
          anonymous:
            donor.anonymous,
        },

        status: 'demo_prepared',
        createdAt,
      };

      persistDemoDonation(
        donation,
      );

      setReceipt(donation);
      setProcessing(false);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 1100);
  }

  function resetDonation() {
    setSuggestedAmount(50000);
    setCustomAmount('');
    setPaymentMethod('pse');

    setPaymentDetails({
      ...INITIAL_PAYMENT_DETAILS,
      nequiPhone:
        user?.phone || '',
    });

    setAcceptedDataPolicy(false);
    setAcceptedDonationTerms(false);
    setErrors({});
    setReceipt(null);
  }

  return (
    <PageShell variant={pageContext}>
      <main className="bg-bgSoft">
        <section
          className={[
            'relative overflow-hidden text-white',
            isMuseumRoute
              ? 'bg-[radial-gradient(circle_at_80%_20%,rgba(216,185,130,0.28),transparent_28%),linear-gradient(135deg,#2f241d_0%,#5b402f_55%,#8b5a3b_100%)]'
              : 'bg-[radial-gradient(circle_at_80%_20%,rgba(213,122,82,0.35),transparent_28%),linear-gradient(135deg,#0d3b36_0%,#244a41_55%,#6c4a2f_100%)]',
          ].join(' ')}
        >
          <div className="container grid min-h-[540px] grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[1.15fr_.85fr] lg:py-20">
            <div>
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#f2cf93]">
                {pageContent.eyebrow}
              </p>

              <h1 className="mb-6 max-w-[820px] text-[clamp(3rem,7vw,5.7rem)] leading-[0.96]">
                {pageContent.title}
              </h1>

              <p className="max-w-[700px] text-[1.08rem] text-white/85">
                {pageContent.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  'Canal institucional compartido',
                  'Aportes en pesos colombianos',
                  'Comprobante digital',
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-[30px] border border-white/20 bg-white/10 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-md sm:p-9">
              <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#f2cf93]">
                {pageContent.impactTitle}
              </p>

              <ul className="grid gap-4">
                {pageContent.impactItems.map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-white/90"
                    >
                      <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-white/15 text-white">
                        <PlatformIcon
                          name="check"
                          size={14}
                        />
                      </span>

                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </aside>
          </div>
        </section>

        <section className="py-12 lg:py-20">
          <div className="container">
            <div className="mb-6 flex items-start gap-3 rounded-[18px] border border-[#efd9a8] bg-[#fff8e5] p-4 text-[#6b521d]">
              <PlatformIcon
                name="settings"
                size={21}
                className="mt-0.5 flex-none"
              />

              <p className="m-0 text-sm leading-relaxed">
                <strong>
                  Modo demostración:
                </strong>{' '}
                este flujo permite probar la
                experiencia completa del
                frontend, pero todavía no
                realiza cobros ni se conecta
                con una entidad financiera.
              </p>
            </div>

            {receipt ? (
              <section className="mx-auto max-w-[850px] rounded-[30px] border border-line bg-white p-7 text-center shadow-card sm:p-12">
                <div className="mx-auto mb-6 grid h-[76px] w-[76px] place-items-center rounded-full bg-[#e5f6ed] text-[#1d7b50]">
                  <PlatformIcon
                    name="check"
                    size={38}
                  />
                </div>

                <p
                  className={[
                    'mb-3 text-xs font-extrabold uppercase tracking-[0.16em]',
                    accentTextClass,
                  ].join(' ')}
                >
                  Simulación completada
                </p>

                <h2 className="mb-4 text-[clamp(2.4rem,5vw,4rem)]">
                  La donación quedó
                  preparada.
                </h2>

                <p className="mx-auto max-w-[650px] text-muted">
                  No se debitó dinero. Este
                  comprobante corresponde al
                  prototipo del frontend y
                  permite validar la
                  información que
                  posteriormente recibirá el
                  backend.
                </p>

                <div className="my-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
                  {[
                    [
                      'Referencia',
                      receipt.reference,
                    ],
                    [
                      'Valor',
                      formatCurrency(
                        receipt.amount,
                      ),
                    ],
                    [
                      'Destino',
                      receipt.destinationName,
                    ],
                    [
                      'Medio de pago',
                      receipt.paymentMethodName,
                    ],
                  ].map(
                    ([
                      label,
                      value,
                    ]) => (
                      <div
                        key={label}
                        className="rounded-[18px] border border-line bg-bgSoft p-5"
                      >
                        <span className="mb-1 block text-xs font-extrabold uppercase tracking-[0.1em] text-muted">
                          {label}
                        </span>

                        <strong className="text-dark">
                          {value}
                        </strong>
                      </div>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  className={[
                    'inline-flex min-h-[50px] items-center justify-center rounded-full px-7 font-bold text-white transition hover:-translate-y-0.5',
                    accentBackgroundClass,
                  ].join(' ')}
                  onClick={resetDonation}
                >
                  Preparar otra donación
                </button>
              </section>
            ) : (
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
                <form
                  className="overflow-hidden rounded-[30px] border border-line bg-white shadow-card"
                  onSubmit={submitDonation}
                  noValidate
                >
                  <section className="border-b border-line p-6 sm:p-8">
                    <div className="mb-8 grid grid-cols-[44px_1fr] gap-4">
                      <span
                        className={[
                          'grid h-11 w-11 place-items-center rounded-full text-sm font-extrabold text-white',
                          accentBackgroundClass,
                        ].join(' ')}
                      >
                        01
                      </span>

                      <div>
                        <h2 className="mb-1 text-[clamp(2rem,4vw,3rem)]">
                          Destino y monto
                        </h2>

                        <p className="text-muted">
                          Las dos organizaciones
                          reciben los aportes
                          mediante la misma
                          cuenta institucional.
                        </p>
                      </div>
                    </div>

                    <fieldset className="mb-8 border-0 p-0">
                      <legend className="mb-4 font-extrabold text-dark">
                        Destino del aporte
                      </legend>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        {DESTINATIONS.map(
                          (option) => {
                            const selected =
                              destination ===
                              option.id;

                            return (
                              <label
                                key={
                                  option.id
                                }
                                className={[
                                  'relative cursor-pointer rounded-[20px] border p-5 transition hover:-translate-y-0.5',
                                  selected
                                    ? selectedBorderClass
                                    : 'border-line bg-white hover:border-black/20',
                                ].join(' ')}
                              >
                                <input
                                  type="radio"
                                  name="destination"
                                  value={
                                    option.id
                                  }
                                  checked={
                                    selected
                                  }
                                  onChange={(
                                    event,
                                  ) => {
                                    setDestination(
                                      event
                                        .target
                                        .value,
                                    );

                                    clearError(
                                      'destination',
                                    );
                                  }}
                                  className="sr-only"
                                />

                                <span
                                  className={[
                                    'absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border text-transparent',
                                    selected
                                      ? selectedBadgeClass
                                      : 'border-line bg-white',
                                  ].join(
                                    ' ',
                                  )}
                                >
                                  <PlatformIcon
                                    name="check"
                                    size={13}
                                  />
                                </span>

                                <strong className="mb-2 block pr-8 text-dark">
                                  {option.name}
                                </strong>

                                <small className="block leading-relaxed text-muted">
                                  {
                                    option.description
                                  }
                                </small>
                              </label>
                            );
                          },
                        )}
                      </div>

                      {errors.destination && (
                        <p className="mt-2 text-sm font-semibold text-[#b42318]">
                          {
                            errors.destination
                          }
                        </p>
                      )}
                    </fieldset>

                    <fieldset className="border-0 p-0">
                      <legend className="mb-4 font-extrabold text-dark">
                        Valor del aporte
                      </legend>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {SUGGESTED_AMOUNTS.map(
                          (amount) => {
                            const selected =
                              suggestedAmount ===
                                amount &&
                              !customAmount;

                            return (
                              <button
                                key={amount}
                                type="button"
                                className={[
                                  'min-h-[52px] rounded-[16px] border px-3 font-extrabold transition hover:-translate-y-0.5',
                                  selected
                                    ? `${accentBackgroundClass} border-transparent text-white`
                                    : 'border-line bg-white text-dark hover:border-black/20',
                                ].join(
                                  ' ',
                                )}
                                onClick={() =>
                                  selectSuggestedAmount(
                                    amount,
                                  )
                                }
                              >
                                {formatCurrency(
                                  amount,
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <label className="mt-5 block">
                        <span className="mb-2 block font-extrabold text-dark">
                          Otro valor
                        </span>

                        <div
                          className={[
                            'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[16px] border border-line bg-white px-4 transition',
                            focusWithinClass,
                          ].join(' ')}
                        >
                          <strong className="text-muted">
                            $
                          </strong>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={
                              customAmount
                            }
                            onChange={(
                              event,
                            ) => {
                              setCustomAmount(
                                digitsOnly(
                                  event
                                    .target
                                    .value,
                                ),
                              );

                              clearError(
                                'amount',
                              );
                            }}
                            className="min-h-[50px] w-full border-0 bg-transparent font-bold text-dark outline-none"
                            placeholder="Ingresa el valor"
                          />

                          <span className="text-sm font-bold text-muted">
                            COP
                          </span>
                        </div>
                      </label>

                      <p className="mt-2 text-sm text-muted">
                        Aporte mínimo:{' '}
                        {formatCurrency(
                          MINIMUM_DONATION,
                        )}
                        .
                      </p>

                      {errors.amount && (
                        <p className="mt-2 text-sm font-semibold text-[#b42318]">
                          {errors.amount}
                        </p>
                      )}
                    </fieldset>
                  </section>

                  <section className="border-b border-line p-6 sm:p-8">
                    <div className="mb-8 grid grid-cols-[44px_1fr] gap-4">
                      <span
                        className={[
                          'grid h-11 w-11 place-items-center rounded-full text-sm font-extrabold text-white',
                          accentBackgroundClass,
                        ].join(' ')}
                      >
                        02
                      </span>

                      <div>
                        <h2 className="mb-1 text-[clamp(2rem,4vw,3rem)]">
                          Datos del donante
                        </h2>

                        <p className="text-muted">
                          Información necesaria
                          para identificar el
                          aporte y generar el
                          comprobante.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-bold text-dark">
                          Nombre completo
                        </span>

                        <input
                          type="text"
                          name="fullName"
                          value={
                            donor.fullName
                          }
                          onChange={
                            updateDonor
                          }
                          autoComplete="name"
                          className={[
                            'w-full rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                            focusClass,
                          ].join(' ')}
                        />

                        {errors.fullName && (
                          <small className="mt-1 block font-semibold text-[#b42318]">
                            {
                              errors.fullName
                            }
                          </small>
                        )}
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-bold text-dark">
                          Correo electrónico
                        </span>

                        <input
                          type="email"
                          name="email"
                          value={
                            donor.email
                          }
                          onChange={
                            updateDonor
                          }
                          autoComplete="email"
                          className={[
                            'w-full rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                            focusClass,
                          ].join(' ')}
                        />

                        {errors.email && (
                          <small className="mt-1 block font-semibold text-[#b42318]">
                            {errors.email}
                          </small>
                        )}
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-bold text-dark">
                          Teléfono
                        </span>

                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength="10"
                          value={donor.phone}
                          onChange={(
                            event,
                          ) => {
                            setDonor(
                              (current) => ({
                                ...current,
                                phone:
                                  digitsOnly(
                                    event
                                      .target
                                      .value,
                                  ),
                              }),
                            );

                            clearError(
                              'phone',
                            );
                          }}
                          autoComplete="tel"
                          className={[
                            'w-full rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                            focusClass,
                          ].join(' ')}
                        />

                        {errors.phone && (
                          <small className="mt-1 block font-semibold text-[#b42318]">
                            {errors.phone}
                          </small>
                        )}
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-bold text-dark">
                          Tipo de documento
                        </span>

                        <select
                          name="documentType"
                          value={
                            donor.documentType
                          }
                          onChange={
                            updateDonor
                          }
                          className={[
                            'w-full rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                            focusClass,
                          ].join(' ')}
                        >
                          <option value="CC">
                            Cédula de
                            ciudadanía
                          </option>

                          <option value="CE">
                            Cédula de
                            extranjería
                          </option>

                          <option value="NIT">
                            NIT
                          </option>

                          <option value="PAS">
                            Pasaporte
                          </option>
                        </select>
                      </label>

                      <label>
                        <span className="mb-2 block text-sm font-bold text-dark">
                          Número de documento
                        </span>

                        <input
                          type="text"
                          name="documentNumber"
                          value={
                            donor.documentNumber
                          }
                          onChange={
                            updateDonor
                          }
                          className={[
                            'w-full rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                            focusClass,
                          ].join(' ')}
                        />

                        {errors.documentNumber && (
                          <small className="mt-1 block font-semibold text-[#b42318]">
                            {
                              errors.documentNumber
                            }
                          </small>
                        )}
                      </label>

                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-bold text-dark">
                          Mensaje opcional
                        </span>

                        <textarea
                          name="message"
                          rows="4"
                          value={
                            donor.message
                          }
                          onChange={
                            updateDonor
                          }
                          className={[
                            'w-full resize-y rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                            focusClass,
                          ].join(' ')}
                          placeholder="Escribe un mensaje para la organización"
                        />
                      </label>

                      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted sm:col-span-2">
                        <input
                          type="checkbox"
                          name="anonymous"
                          checked={
                            donor.anonymous
                          }
                          onChange={
                            updateDonor
                          }
                          className="mt-0.5 h-5 w-5 flex-none accent-accent"
                        />

                        <span>
                          Mostrar mi aporte como
                          anónimo en publicaciones
                          o reconocimientos
                          institucionales.
                        </span>
                      </label>
                    </div>
                  </section>

                  <section className="border-b border-line p-6 sm:p-8">
                    <div className="mb-8 grid grid-cols-[44px_1fr] gap-4">
                      <span
                        className={[
                          'grid h-11 w-11 place-items-center rounded-full text-sm font-extrabold text-white',
                          accentBackgroundClass,
                        ].join(' ')}
                      >
                        03
                      </span>

                      <div>
                        <h2 className="mb-1 text-[clamp(2rem,4vw,3rem)]">
                          Medio de pago
                        </h2>

                        <p className="text-muted">
                          Selecciona el canal
                          desde el cual deseas
                          preparar la
                          transacción.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {PAYMENT_METHODS.map(
                        (method) => {
                          const selected =
                            paymentMethod ===
                            method.id;

                          return (
                            <label
                              key={
                                method.id
                              }
                              className={[
                                'relative grid cursor-pointer grid-cols-[50px_1fr] items-center gap-4 rounded-[18px] border p-4 transition hover:-translate-y-0.5',
                                selected
                                  ? selectedBorderClass
                                  : 'border-line bg-white hover:border-black/20',
                              ].join(' ')}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={
                                  method.id
                                }
                                checked={
                                  selected
                                }
                                onChange={(
                                  event,
                                ) => {
                                  setPaymentMethod(
                                    event
                                      .target
                                      .value,
                                  );

                                  setErrors(
                                    {},
                                  );
                                }}
                                className="sr-only"
                              />

                              <span
                                className={[
                                  'grid h-[50px] w-[50px] place-items-center rounded-[14px] text-sm font-black',
                                  method.id ===
                                  'pse'
                                    ? 'bg-[#e5f2ff] text-[#0059a8]'
                                    : '',
                                  method.id ===
                                  'bancolombia'
                                    ? 'bg-[#ffe56b] text-black'
                                    : '',
                                  method.id ===
                                  'nequi'
                                    ? 'bg-[#f0e2ff] text-[#5f1679]'
                                    : '',
                                  method.id ===
                                  'transfer'
                                    ? 'bg-[#f4eee5] text-[#70452f]'
                                    : '',
                                ]
                                  .filter(
                                    Boolean,
                                  )
                                  .join(' ')}
                              >
                                {
                                  method.badge
                                }
                              </span>

                              <span>
                                <strong className="block text-dark">
                                  {
                                    method.name
                                  }
                                </strong>

                                <small className="mt-1 block leading-relaxed text-muted">
                                  {
                                    method.description
                                  }
                                </small>
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>

                    {paymentMethod ===
                      'pse' && (
                      <div className="mt-5 rounded-[20px] border border-line bg-bgSoft p-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <label>
                            <span className="mb-2 block text-sm font-bold text-dark">
                              Tipo de persona
                            </span>

                            <select
                              name="personType"
                              value={
                                paymentDetails.personType
                              }
                              onChange={
                                updatePaymentDetails
                              }
                              className={[
                                'w-full rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                                focusClass,
                              ].join(
                                ' ',
                              )}
                            >
                              <option value="natural">
                                Persona natural
                              </option>

                              <option value="legal">
                                Persona jurídica
                              </option>
                            </select>
                          </label>

                          <label>
                            <span className="mb-2 block text-sm font-bold text-dark">
                              Entidad financiera
                            </span>

                            <select
                              name="bank"
                              value={
                                paymentDetails.bank
                              }
                              onChange={
                                updatePaymentDetails
                              }
                              className={[
                                'w-full rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                                focusClass,
                              ].join(
                                ' ',
                              )}
                            >
                              <option value="">
                                Selecciona un
                                banco
                              </option>

                              {BANKS.map(
                                (bank) => (
                                  <option
                                    key={
                                      bank
                                    }
                                    value={
                                      bank
                                    }
                                  >
                                    {bank}
                                  </option>
                                ),
                              )}
                            </select>

                            {errors.bank && (
                              <small className="mt-1 block font-semibold text-[#b42318]">
                                {
                                  errors.bank
                                }
                              </small>
                            )}
                          </label>
                        </div>

                        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
                          <PlatformIcon
                            name="external"
                            size={18}
                            className="mt-0.5 flex-none"
                          />

                          <span>
                            En la integración
                            real, el usuario será
                            redirigido al entorno
                            seguro de PSE para
                            autorizar el aporte.
                          </span>
                        </p>
                      </div>
                    )}

                    {paymentMethod ===
                      'bancolombia' && (
                      <div className="mt-5 flex items-start gap-3 rounded-[20px] border border-line bg-bgSoft p-5 text-muted">
                        <PlatformIcon
                          name="lock"
                          size={22}
                          className="mt-0.5 flex-none text-dark"
                        />

                        <p className="m-0">
                          El sitio no solicitará
                          usuario, contraseña ni
                          clave dinámica. La
                          autorización real se
                          realizará dentro del
                          canal seguro de
                          Bancolombia.
                        </p>
                      </div>
                    )}

                    {paymentMethod ===
                      'nequi' && (
                      <div className="mt-5 rounded-[20px] border border-line bg-bgSoft p-5">
                        <label className="block max-w-[460px]">
                          <span className="mb-2 block text-sm font-bold text-dark">
                            Número asociado a
                            Nequi
                          </span>

                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength="10"
                            name="nequiPhone"
                            value={
                              paymentDetails.nequiPhone
                            }
                            onChange={
                              updatePaymentDetails
                            }
                            placeholder="3001234567"
                            className={[
                              'w-full rounded-[14px] border border-line bg-white px-4 py-3 text-dark outline-none transition',
                              focusClass,
                            ].join(
                              ' ',
                            )}
                          />

                          {errors.nequiPhone && (
                            <small className="mt-1 block font-semibold text-[#b42318]">
                              {
                                errors.nequiPhone
                              }
                            </small>
                          )}
                        </label>

                        <p className="mt-4 text-sm text-muted">
                          La confirmación real
                          deberá realizarse desde
                          la aplicación Nequi
                          mediante la pasarela
                          seleccionada.
                        </p>
                      </div>
                    )}

                    {paymentMethod ===
                      'transfer' && (
                      <div className="mt-5 rounded-[20px] border border-line bg-bgSoft p-5">
                        <div className="mb-5 flex items-center gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-dark shadow-sm">
                            <PlatformIcon
                              name="orders"
                              size={21}
                            />
                          </span>

                          <div>
                            <strong className="block text-dark">
                              Cuenta institucional
                              compartida
                            </strong>

                            <small className="text-muted">
                              Fundación Tamborito
                              y Museo Malibú
                            </small>
                          </div>
                        </div>

                        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {[
                            [
                              'Banco',
                              SHARED_BANK_ACCOUNT.bank,
                            ],
                            [
                              'Tipo',
                              SHARED_BANK_ACCOUNT.accountType,
                            ],
                            [
                              'Número',
                              SHARED_BANK_ACCOUNT.accountNumber,
                            ],
                            [
                              'Titular',
                              SHARED_BANK_ACCOUNT.holder,
                            ],
                            [
                              'Identificación',
                              SHARED_BANK_ACCOUNT.identification,
                            ],
                          ].map(
                            ([
                              label,
                              value,
                            ]) => (
                              <div
                                key={
                                  label
                                }
                                className="rounded-[15px] border border-line bg-white p-4"
                              >
                                <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
                                  {label}
                                </dt>

                                <dd className="mt-1 font-bold text-dark">
                                  {value}
                                </dd>
                              </div>
                            ),
                          )}
                        </dl>

                        <p className="mt-4 text-sm font-semibold text-[#8a5a14]">
                          Sustituye los datos
                          pendientes por la
                          información bancaria
                          oficial antes de
                          publicar el sitio.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="p-6 sm:p-8">
                    <div className="mb-7 grid grid-cols-[44px_1fr] gap-4">
                      <span
                        className={[
                          'grid h-11 w-11 place-items-center rounded-full text-sm font-extrabold text-white',
                          accentBackgroundClass,
                        ].join(' ')}
                      >
                        04
                      </span>

                      <div>
                        <h2 className="mb-1 text-[clamp(2rem,4vw,3rem)]">
                          Confirmación
                        </h2>

                        <p className="text-muted">
                          Revisa el resumen y
                          acepta las condiciones
                          del proceso.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={
                            acceptedDataPolicy
                          }
                          onChange={(
                            event,
                          ) => {
                            setAcceptedDataPolicy(
                              event
                                .target
                                .checked,
                            );

                            clearError(
                              'dataPolicy',
                            );
                          }}
                          className="mt-0.5 h-5 w-5 flex-none accent-accent"
                        />

                        <span>
                          Autorizo el tratamiento
                          de mis datos para
                          gestionar la donación y
                          enviar el comprobante.
                        </span>
                      </label>

                      {errors.dataPolicy && (
                        <p className="text-sm font-semibold text-[#b42318]">
                          {
                            errors.dataPolicy
                          }
                        </p>
                      )}

                      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={
                            acceptedDonationTerms
                          }
                          onChange={(
                            event,
                          ) => {
                            setAcceptedDonationTerms(
                              event
                                .target
                                .checked,
                            );

                            clearError(
                              'donationTerms',
                            );
                          }}
                          className="mt-0.5 h-5 w-5 flex-none accent-accent"
                        />

                        <span>
                          Confirmo que el valor y
                          el destino son correctos
                          y acepto las condiciones
                          de la donación.
                        </span>
                      </label>

                      {errors.donationTerms && (
                        <p className="text-sm font-semibold text-[#b42318]">
                          {
                            errors.donationTerms
                          }
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className={[
                        'mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[16px] px-6 font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0',
                        accentBackgroundClass,
                      ].join(' ')}
                    >
                      {processing ? (
                        <>
                          <PlatformIcon
                            name="settings"
                            size={20}
                          />

                          Preparando
                          transacción...
                        </>
                      ) : (
                        <>
                          <PlatformIcon
                            name="lock"
                            size={19}
                          />

                          Donar{' '}
                          {formatCurrency(
                            donationAmount,
                          )}
                        </>
                      )}
                    </button>
                  </section>
                </form>

                <aside className="rounded-[28px] border border-line bg-white p-6 shadow-card lg:sticky lg:top-[104px]">
                  <p
                    className={[
                      'mb-3 text-xs font-extrabold uppercase tracking-[0.14em]',
                      accentTextClass,
                    ].join(' ')}
                  >
                    Resumen del aporte
                  </p>

                  <h2 className="mb-3 text-[2.7rem] text-dark">
                    {formatCurrency(
                      donationAmount,
                    )}
                  </h2>

                  <span
                    className={[
                      'inline-flex rounded-full px-3 py-2 text-xs font-extrabold',
                      isMuseumRoute
                        ? 'bg-museoStone text-museoClay'
                        : 'bg-[#fff1e9] text-[#a64f31]',
                    ].join(' ')}
                  >
                    {selectedDestination
                      ?.shortName ||
                      'Pendiente'}
                  </span>

                  <dl className="my-7 grid gap-4">
                    {[
                      [
                        'Destino',
                        selectedDestination
                          ?.name ||
                          'Pendiente',
                      ],
                      [
                        'Medio',
                        selectedPaymentMethod
                          ?.name ||
                          'Pendiente',
                      ],
                      [
                        'Cuenta receptora',
                        'Canal institucional compartido',
                      ],
                    ].map(
                      ([
                        label,
                        value,
                      ]) => (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-4 border-b border-line pb-4"
                        >
                          <dt className="text-muted">
                            {label}
                          </dt>

                          <dd className="max-w-[180px] text-right font-bold text-dark">
                            {value}
                          </dd>
                        </div>
                      ),
                    )}

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <dt className="font-extrabold text-dark">
                        Total
                      </dt>

                      <dd className="text-xl font-extrabold text-dark">
                        {formatCurrency(
                          donationAmount,
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="rounded-[18px] bg-[#eaf3f0] p-5 text-[#31514a]">
                    <div className="mb-2 flex items-center gap-2 font-extrabold">
                      <PlatformIcon
                        name="lock"
                        size={18}
                      />

                      Pago seguro
                    </div>

                    <p className="m-0 text-sm leading-relaxed">
                      Las credenciales bancarias
                      nunca deben escribirse en
                      este sitio. La
                      autorización real ocurrirá
                      dentro del entorno seguro
                      del proveedor de pagos.
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </section>
      </main>

      {isMuseumRoute ? (
        <MuseumFooter />
      ) : (
        <FoundationFooter />
      )}
    </PageShell>
  );
}
"use client";

import { useEffect, useState } from "react";

const servicios = [
  { id: 1, title: "Cuidador", desc: "Asistencia y acompañamiento diario", image: "/cuidado.1.jpg" },
  { id: 2, title: "Limpieza", desc: "Higiene integral del hogar", image: "/limpieza.3.png" },
  { id: 3, title: "Kinesiología", desc: "Rehabilitación y movilidad", image: "/kinesiologo.1.jpg" },
  { id: 4, title: "Enfermería", desc: "Atención profesional domiciliaria", image: "/enfermeria.1.jpg" },
  { id: 5, title: "Nutrición", desc: "Planes alimentarios personalizados", image: "/nutricionista.1.jpg" },
  { id: 6, title: "Terapia Ocupacional", desc: "Autonomía en actividades diarias", image: "/terapiaocupacional.2.jpg" },
  { id: 7, title: "Psicología", desc: "Acompañamiento emocional", image: "/psicologo.2.webp" },
  { id: 8, title: "Radiología", desc: "Estudios por imágenes a domicilio", image: "/radiologo.2.jpg" },
  { id: 9, title: "Análisis Clínicos", desc: "Extracciones y estudios", image: "/analisis-clinico.2.jpg" },
  { id: 10, title: "Acompañante Terapéutico", desc: "Contención profesional", image: "/acompanante-terapeutico.2.png" },
];

export default function Servicios() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-12 items-center">

        {/* TEXTO – CARD BLANCA (1/3) */}
        <div className="w-full md:w-1/3 z-25">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-[#1D4A74]">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Nuestros servicios
            </h2>

            <p className="mt-4 text-base leading-relaxed">
              Brindamos atención profesional de la salud <strong>a domicilio</strong>,
              con un equipo interdisciplinario comprometido con el bienestar integral
              de cada paciente.
            </p>

            <p className="mt-3 text-sm text-[#1D4A74]/80">
              Todos nuestros servicios son realizados por profesionales matriculados,
              garantizando confianza, calidad y continuidad en el cuidado.
            </p>
          </div>
        </div>

        {/* CARRUSEL – 2/3 */}
        <div className="w-full md:w-2/3 relative flex justify-center">
          <ServiciosCarousel />
        </div>

      </div>
    </section>
  );
}

/* ===================== */
/* CARRUSEL (sin cambios) */
/* ===================== */

function ServiciosCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  // Autoplay
  useEffect(() => {
    if (isInteracting) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % servicios.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isInteracting]);

  // Reanudar autoplay
  useEffect(() => {
    if (!isInteracting) return;

    const timeout = setTimeout(() => {
      setIsInteracting(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [isInteracting]);

  const getPosition = (index) => {
    const diff = index - activeIndex;

    if (diff === 0) return "center";
    if (diff === -1 || diff === servicios.length - 1) return "left";
    if (diff === 1 || diff === -(servicios.length - 1)) return "right";

    return "hidden";
  };

  return (
    <div className="relative flex justify-center px-4 min-h-[320px] md:h-[480px]">

      {/* Controles mobile */}
      <div className="md:hidden absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-12 z-30">
        <button
          onClick={() =>
            setActiveIndex((prev) =>
              prev === 0 ? servicios.length - 1 : prev - 1
            )
          }
          className="bg-[#1D4A74] text-[#04BF8A] text-4xl px-3 rounded-full shadow-lg"
        >
          ‹
        </button>

        <button
          onClick={() =>
            setActiveIndex((prev) => (prev + 1) % servicios.length)
          }
          className="bg-[#1D4A74] text-[#04BF8A] text-4xl px-3 rounded-full shadow-lg"
        >
          ›
        </button>
      </div>

      {servicios.map((servicio, index) => {
        const position = getPosition(index);

        return (
          <div
            key={servicio.id}
            onClick={() => {
              setActiveIndex(index);
              setIsInteracting(true);
            }}
            className={`
              absolute transition-all duration-500 ease-out
              ${position === "center" && "z-20 scale-100 opacity-100"}
              ${
                position === "left" &&
                "hidden md:block -translate-x-[20%] z-10 scale-90 opacity-60 cursor-pointer"
              }
              ${
                position === "right" &&
                "hidden md:block translate-x-[20%] z-10 scale-90 opacity-60 cursor-pointer"
              }
              ${position === "hidden" && "opacity-0 pointer-events-none"}
            `}
          >
            <div
              className={`
                w-[300px] sm:w-[420px] md:w-[640px]
                rounded-2xl overflow-hidden shadow-lg transition-all
                ${position === "center" ? "bg-white" : "bg-transparent"}
              `}
            >
              {/* Imagen */}
              <div className="h-[220px] sm:h-[300px] md:h-[380px] w-full">
                <img
                  src={servicio.image}
                  alt={servicio.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Texto SOLO card central */}
              {position === "center" && (
                <div className="p-4 text-[#1D4A74]">
                  <h3 className="font-semibold text-xl">{servicio.title}</h3>
                  <p className="mt-2 text-sm">{servicio.desc}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

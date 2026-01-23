"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

/**
 * MOCK – luego viene del backend
 */
const PROFESIONALES = [
  {
    id: 1,
    nombre: "María Gómez",
    especialidad: "Enfermería domiciliaria",
    descripcion:
      "Más de 10 años de experiencia en cuidados clínicos y acompañamiento.",
    fotoUrl: "/acompanante-terapeutico1.jpg",
  },
  {
    id: 2,
    nombre: "Juan Pérez",
    especialidad: "Kinesiología",
    descripcion: "Rehabilitación física personalizada en domicilio.",
    fotoUrl: "/analisis-clinico3.jpg",
  },
  {
    id: 3,
    nombre: "Laura Fernández",
    especialidad: "Acompañamiento terapéutico",
    descripcion: "Especialista en adultos mayores y salud mental.",
    fotoUrl: "/cuidado1.jpg",
  },
  {
    id: 4,
    nombre: "Carlos Díaz",
    especialidad: "Cuidados domiciliarios",
    descripcion: "Asistencia diaria y acompañamiento integral.",
    fotoUrl: "/enfermeria.jpg",
  },
  {
    id: 5,
    nombre: "Ana López",
    especialidad: "Psicología",
    descripcion: "Atención y contención emocional en domicilio.",
    fotoUrl: "/kinesiologo2.jpg",
  },
  {
    id: 6,
    nombre: "Sofía Martínez",
    especialidad: "Terapia ocupacional",
    descripcion: "Estimulación y autonomía funcional.",
    fotoUrl: "/limpieza1.jpg",
  },
];

export default function ProfesionalesGrid() {
  const containerRef = useRef(null);
  const velocityRef = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      container.scrollLeft += velocityRef.current;

      const maxScroll = container.scrollWidth / 2;

      if (container.scrollLeft >= maxScroll) {
        container.scrollLeft -= maxScroll;
      }

      if (container.scrollLeft <= 0) {
        container.scrollLeft += maxScroll;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const center = rect.width / 2;
    const distance = x - center;

    const deadZone = 80;

    if (Math.abs(distance) < deadZone) {
      velocityRef.current = 0;
    } else {
      velocityRef.current = distance * 0.0025;
    }
  };

  return (
    <section
      id="profesionales"
      className="bg-[#04BF8A] text-white py-8 md:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 w-full">
        <h2
          className={`text-2xl md:text-3xl font-semibold ${montserrat.className}`}
        >
          Profesionales verificados
        </h2>

        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          //onMouseLeave={() => (velocityRef.current = 0)}
          className="mt-12 overflow-x-hidden"
        >
          <div className="flex gap-8 w-max">
            {[...PROFESIONALES, ...PROFESIONALES].map((p, index) => (
              <article
                key={index}
                className="w-[340px] bg-white rounded-2xl shadow-lg overflow-hidden
                           text-[#1D4A74] flex-shrink-0"
              >
                <div className="relative h-40">
                  <Image
                    src={p.fotoUrl}
                    alt={p.nombre}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3
                    className={`font-semibold text-lg ${montserrat.className}`}
                  >
                    {p.nombre}
                  </h3>

                  <p className="text-sm font-medium text-[#04BF8A]">
                    {p.especialidad}
                  </p>

                  <p className="mt-2 text-sm text-[#1D4A74]/80">
                    {p.descripcion}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

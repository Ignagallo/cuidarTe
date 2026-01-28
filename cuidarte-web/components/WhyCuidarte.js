"use client";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { useEffect, useRef, useState } from "react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const MOTIVOS = [
  {
    id: 1,
    title: "Atención profesional en tu hogar",
    desc: "Brindamos servicios de cuidado y salud directamente en tu casa, evitando traslados innecesarios y priorizando tu comodidad.",
  },
  {
    id: 2,
    title: "Gestión clara y organizada",
    desc: "Agenda digital, seguimiento del servicio y comunicación centralizada desde una sola plataforma.",
  },
  {
    id: 3,
    title: "Acompañamiento humano",
    desc: "Priorizamos el vínculo, la confianza y el trato personalizado para cada familia.",
  },
  {
    id: 4,
    title: "Flexibilidad horaria",
    desc: "Adaptamos el servicio a tus tiempos, necesidades y rutinas diarias.",
  },
  {
    id: 5,
    title: "Seguimiento y control del servicio",
    desc: "Supervisamos cada prestación para garantizar calidad y continuidad.",
  },
  {
    id: 6,
    title: "Soporte y asesoramiento",
    desc: "Nuestro equipo te acompaña antes, durante y después de contratar el servicio.",
  },
];

export default function WhyCuidarte() {
  const [openId, setOpenId] = useState(null);
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.35,
      }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);
  return (
    <section
      ref={sectionRef}
      id="whyCuidarte"
      className={`bg-[#1D4A74] text-white border-t border-white/20 py-4 md:py-8 flex items-center
    transition-all duration-700 ease-out
    ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
  `}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 w-full">
        <div className="grid gap-12 md:grid-cols-5 items-center">
          {/* IZQUIERDA */}
          <div className="md:col-span-2">
            <h2
              className={`text-2xl md:text-3xl font-semibold text-[#04BF8A] ${montserrat.className}`}
            >
              ¿Por qué elegir Cuidarte?
            </h2>
            <p className="mt-4 text-white/90">
              Combinamos tecnología, profesionales confiables y un enfoque
              humano para ofrecer cuidados de calidad en tu hogar.
            </p>

            <div className="mt-8 relative h-64 md:h-80 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
              <Image
                src="/porquecuidarte2.jpg" // imagen desde public
                alt="Cuidado profesional en el hogar"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

          {/* DERECHA */}
          <div className="md:col-span-3">
            <ul className="space-y-1">
              {MOTIVOS.map((item, index) => {
                const isOpen = openId === item.id;
                return (
                  <li
                    key={item.id}
                    style={{ transitionDelay: `${index * 80}ms` }}
                    className={`
                            rounded-2xl overflow-hidden transition-all duration-300
                            border
                            ${
                              isOpen
                                ? "bg-[#04BF8A] border-[#04BF8A]"
                                : "bg-white/5 border-white/20"
                            }
                            ${
                              visible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-6"
                            }
                        `}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className={`
                            w-full flex justify-between items-center p-5 text-left
                            focus-visible:ring-2 focus-visible:ring-[#04BF8A]
                            transition-colors cursor-pointer
                            ${isOpen ? "text-[#1D4A74]" : "text-white"}
                        `}
                      aria-expanded={isOpen}
                    >
                      <span className={`font-medium ${montserrat.className}`}>
                        {item.title}
                      </span>
                      <span
                        className={`
                            transition-transform transition-colors duration-300
                            ${
                              isOpen
                                ? "rotate-180 text-[#1D4A74]"
                                : "text-white"
                            }
                        `}
                      >
                        ▾
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div
                        className={`
                            overflow-hidden px-5 pb-5 text-sm
                            ${isOpen ? "text-[#1D4A74]" : "text-white/90"}
                        `}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

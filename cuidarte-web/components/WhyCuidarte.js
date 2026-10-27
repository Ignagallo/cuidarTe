"use client";
import Image from "next/image";
import { useState } from "react";
import Reveal from "./Reveal";

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
  return (
    <Reveal
      as="section"
      id="whyCuidarte"
      className="scroll-mt-24 flex items-center border-t border-white/20 bg-[#1D4A74] py-4 text-white md:py-8"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 w-full">
        <div className="grid gap-12 md:grid-cols-5 items-center">
          {/* IZQUIERDA */}
          <div className="md:col-span-2">
            <h2
              className="text-2xl font-semibold text-[#04BF8A] md:text-3xl"
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
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
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
                      <span className="font-medium">
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
    </Reveal>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

/* =========================
   DATA
========================= */

const testimonials = [
  {
    name: 'María G.',
    role: 'Familiar de paciente',
    text: 'El acompañamiento fue excelente. Nos sentimos contenidos desde el primer día.',
  },
  {
    name: 'Lic. Juan P.',
    role: 'Profesional de la salud',
    text: 'Pude organizar mejor mis horarios y mejorar la atención a mis pacientes.',
  },
  {
    name: 'Carlos R.',
    role: 'Paciente',
    text: 'La tranquilidad de saber que mi mamá estaba bien cuidada no tiene precio.',
  },
];

/* =========================
   CARD
========================= */

function TestimonialCard({ item, index }) {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  // Animación tipo campanita
  const startBell = () => {
    controls.start({
      rotateZ: [0, -2, 2, -2, 0],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: index * 0.4,
      },
    });
  };

  const stopBell = () => {
    controls.stop();
    controls.set({ rotateZ: 0 });
  };

  useEffect(() => {
    startBell();
  }, []);

  return (
    <motion.div
      className="h-80"
      animate={controls}
      onMouseEnter={() => {
        stopBell();
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        startBell();
      }}
    >
      {/* CONTENEDOR 3D */}
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateY: isHovered ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1200,
        }}
      >
        {/* FRONT */}
        <div
          className="
            absolute inset-0
            rounded-2xl
            border border-[#1D4A74]/20
            bg-white
            shadow-sm
            p-6
            flex flex-col justify-end
          "
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1D4A74]/10 to-transparent" />

          <div className="relative">
            <div className="font-medium text-[#1D4A74] text-lg">
              {item.name}
            </div>
            <div className="text-sm text-[#1D4A74]/70">
              {item.role}
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="
            absolute inset-0
            rounded-2xl
            bg-[#1D4A74]
            p-6
            flex flex-col justify-center
          "
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          <p className="text-[#04BF8A] leading-relaxed">
            “{item.text}”
          </p>

          <div className="mt-6 text-sm text-[#04BF8A]/80">
            {item.name}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================
   SECTION
========================= */

export default function TestimonialsSection() {
  return (
    <section
      id="testimonios"
      className="bg-white py-28 border-t border-[#1D4A74]/20"
    >
      <div className="mx-auto max-w-7xl px-4">

        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#1D4A74]">
            Testimonios reales
          </h2>
          <p className="mt-3 text-[#1D4A74]/80">
            La experiencia de quienes ya confían en cuidarTE.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <TestimonialCard
              key={index}
              item={item}
              index={index}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal';

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
  const [isActive, setIsActive] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? true;

  useEffect(() => {
    if (prefersReducedMotion || isActive) {
      controls.stop();
      controls.start({ rotateZ: 0, transition: { duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' } });
      return () => controls.stop();
    }

    controls.start({
      rotateZ: [0, -0.6, 0.6, 0],
      transition: {
        duration: 5,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: index * 0.3,
      },
    });
    return () => controls.stop();
  }, [controls, index, isActive, prefersReducedMotion]);

  return (
    <motion.div
      tabIndex={0}
      role="group"
      aria-label={`Testimonio de ${item.name}, ${item.role}: ${item.text}`}
      animate={controls}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement)) setIsActive(false);
      }}
      onFocus={() => setIsActive(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsActive(false);
      }}
      className="h-80 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] focus-visible:ring-offset-4"
    >
      {/* CONTENEDOR 3D */}
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateY: isActive && !prefersReducedMotion ? 180 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
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
          aria-hidden={isActive}
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
          aria-hidden={!isActive}
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
      className="scroll-mt-24 border-t border-[#1D4A74]/20 bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4">

        <Reveal className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#1D4A74]">
            Testimonios reales
          </h2>
          <p className="mt-3 text-[#1D4A74]/80">
            La experiencia de quienes ya confían en cuidarTE.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-8 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal as="li" key={item.name} delay={index * 0.08}>
              <TestimonialCard item={item} index={index} />
            </Reveal>
          ))}
        </ul>

      </div>
    </section>
  );
}

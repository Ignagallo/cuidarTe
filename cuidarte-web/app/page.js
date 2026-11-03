// cuidarte-web/app/page.js
"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MotionConfig, motion, useAnimation, useReducedMotion } from "framer-motion";
import Servicios from "../components/Servicios";
import WhyCuidarte from "../components/WhyCuidarte";
import ProfesionalesGrid from "../components/ProfesionalesGrid";
import ContactSection from "../components/ContactSection";
import TestimonialsSection from "../components/TestimonialsSection";
import AnimatedFooter from "../components/AnimatedFooter";
import Link from "next/link";

const NAV_LINKS = [
  ["Servicios", "#servicios"],
  ["Profesionales", "#profesionales"],
  ["Por qué Cuidarte", "#whyCuidarte"],
  ["Contacto", "#contacto"],
  ["Testimonios", "#testimonios"],
];

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const heroControls = useAnimation();
  const heroImageControls = useAnimation();
  const ambientControls = useAnimation();
  const menuButtonRef = useRef(null);
  const headerRef = useRef(null);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    mobileNavRef.current?.querySelector("a")?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const sections = NAV_LINKS
      .map(([, href]) => document.getElementById(href.slice(1)))
      .filter(Boolean);
    if (!sections.length) return undefined;

    let frame = 0;
    const updateActiveSection = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const atPageEnd =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2;
        if (atPageEnd) {
          setActiveSection(sections[sections.length - 1].id);
          return;
        }

        const activationLine = (headerRef.current?.getBoundingClientRect().bottom || 0) + 24;
        const current = sections.find((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= activationLine && rect.bottom > activationLine;
        });
        const previous = sections
          .filter((section) => section.getBoundingClientRect().top <= activationLine)
          .at(-1);
        setActiveSection((current || previous)?.id || null);
      });
    };

    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(updateActiveSection, {
          rootMargin: "-80px 0px -60% 0px",
          threshold: 0,
        });
    sections.forEach((section) => observer?.observe(section));
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    updateActiveSection();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      heroControls.set("visible");
      heroImageControls.set("visible");
      ambientControls.set("rest");
    } else {
      heroControls.set("hidden");
      heroImageControls.set("hidden");
      const frame = requestAnimationFrame(() => {
        heroControls.start("visible");
        heroImageControls.start("visible");
        ambientControls.start("float");
      });
      return () => {
        cancelAnimationFrame(frame);
        heroControls.stop();
        heroImageControls.stop();
        ambientControls.stop();
      };
    }

    return () => {
      heroControls.stop();
      heroImageControls.stop();
      ambientControls.stop();
    };
  }, [ambientControls, heroControls, heroImageControls, prefersReducedMotion]);

  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen scroll-smooth bg-[#F8FAF9] text-[#1D4A74]">
      <header ref={headerRef} className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Cuidarte, inicio" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">
            <Image src="/nuevologoSinFondo.png" alt="Cuidarte" width={240} height={72} priority className="h-12 w-auto object-contain sm:h-14" />
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-4 lg:flex">
            {NAV_LINKS.map(([label, href]) => {
              const active = activeSection === href.slice(1);
              return <a key={href} href={href} aria-current={active ? "location" : undefined} className={`rounded-md border-b-2 px-1 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] ${active ? "border-[#04BF8A] text-[#1D4A74]" : "border-transparent text-slate-700 hover:border-emerald-300 hover:text-emerald-700"}`}>{label}</a>;
            })}
            <Link href="/login" className="rounded-xl bg-[#1D4A74] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#163a5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] focus-visible:ring-offset-2">Iniciar sesión</Link>
          </nav>

          <button ref={menuButtonRef} type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-300 text-[#1D4A74] transition-colors hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] lg:hidden" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            <span aria-hidden="true" className="text-xl">{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>
        {menuOpen && (
          <nav ref={mobileNavRef} id="mobile-navigation" aria-label="Navegación móvil" className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <ul className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
              {NAV_LINKS.map(([label, href]) => {
                const active = activeSection === href.slice(1);
                return <li key={href}><a href={href} aria-current={active ? "location" : undefined} onClick={() => setMenuOpen(false)} className={`block rounded-lg border-l-4 px-3 py-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] ${active ? "border-[#04BF8A] bg-emerald-50 text-[#1D4A74]" : "border-transparent text-slate-700 hover:bg-slate-50"}`}>{label}{active && <span className="sr-only">, sección actual</span>}</a></li>;
              })}
              <li className="sm:col-span-2"><Link href="/login" onClick={() => setMenuOpen(false)} className="mt-2 block rounded-xl bg-[#1D4A74] px-4 py-3 text-center font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Iniciar sesión</Link></li>
            </ul>
          </nav>
        )}
      </header>

      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:px-8 lg:py-20">
          <motion.div
            className="max-w-2xl"
            initial={false}
            animate={heroControls}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.12 } },
            }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700"
            >
              Cuidado cercano, en casa
            </motion.p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-[#1D4A74] sm:text-5xl lg:text-6xl"
            >Atención integral en la comodidad de tu hogar.</motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8"
            >Cuidarte conecta pacientes con terapeutas, cuidadores y profesionales de la salud para una atención personalizada a domicilio.</motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col gap-3 min-[420px]:flex-row"
            >
              <a href="#servicios" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#04BF8A] px-5 py-3 font-semibold text-[#103d38] transition-[transform,background-color,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-[#00A884] hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4A74] focus-visible:ring-offset-2">Conocer servicios</a>
              <a href="https://wa.link/v2l67z" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#1D4A74]/25 px-5 py-3 font-semibold text-[#1D4A74] transition-[transform,background-color,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-[#1D4A74]/5 hover:shadow-sm active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Hablar con un asesor</a>
            </motion.div>
            <motion.p
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              transition={{ duration: 0.4 }}
              className="mt-4 text-sm text-slate-500"
            >Solicitá asesoramiento sin cargo.</motion.p>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
            initial={false}
            animate={heroImageControls}
            variants={{
              hidden: { opacity: 0, scale: 0.985, y: 10 },
              visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, delay: prefersReducedMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-xl shadow-[#1D4A74]/10">
              <Image src="/cuidado2.jpg" alt="Acompañamiento de cuidado en el hogar" fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102c45]/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/50 bg-white/95 p-4 shadow-lg sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm sm:p-5">
                <p className="text-sm font-semibold text-[#1D4A74]">Cuidar también es acompañar</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Un equipo interdisciplinario, cerca de cada familia.</p>
              </div>
            </div>
            <motion.div
              aria-hidden="true"
              className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-full bg-[#04BF8A]/15 blur-2xl"
              initial={false}
              animate={ambientControls}
              variants={{
                rest: { y: 0 },
                float: { y: [0, -4, 0], transition: { duration: 7, repeat: Infinity, ease: "easeInOut" } },
              }}
            />
          </motion.div>
        </div>
      </section>

      <Servicios />
      <ProfesionalesGrid />
      <WhyCuidarte />
      <ContactSection />
      <TestimonialsSection />
      <AnimatedFooter />
    </main>
    </MotionConfig>
  );
}

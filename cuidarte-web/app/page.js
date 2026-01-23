"use client";
import { Montserrat, Open_Sans } from "next/font/google";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Servicios from "./components/Servicios";
import WhyCuidarte from "./components/WhyCuidarte";
import ProfesionalesGrid from "./components/ProfesionalesGrid";
import ContactSection from "./components/ContactSection";
import TestimonialsSection from "./components/TestimonialsSection";
import AnimatedFooter from "./components/AnimatedFooter";
import AnimateSection from "./components/AnimateSection";
import { fadeUp, fadeLeft, fadeRight, scaleIn } from "./components/animations";
import Link from "next/link";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export default function Page() {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  //Funcion cuando el mouse está en el borde superior para navbar
  useEffect(() => {
    const ACTIVATION_ZONE = 80;
    const handleMouseMove = (e) => {
      if (e.clientY <= ACTIVATION_ZONE) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main
      className={`min-h-screen bg-[#1D4A74] text-white ${openSans.className} overflow-y-scroll h-screen scroll-smooth`}
    >
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300
    ${showNavbar ? "translate-y-0" : "-translate-y-full"}
    bg-[#1D4A74]/90 backdrop-blur border-b border-white/30`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="bg-white rounded-full cursor-pointer transition-all duration-200 ease-out
              hover:scale-105
              hover:ring-white/70 hover:ring-emerald-400/60
              hover:shadow-[0_0_12px_rgba(255,255,255,0.4)]
              active:scale-95
              active:ring-2 active:ring-emerald-500
              active:shadow-[0_0_16px_rgba(16,185,129,0.6)]
              will-change-transform"
            >
              <Image
                src="/nuevologoSinFondo.png" // Ruta desde public/
                alt="Cuidarte - Atención médica en casa"
                width={400} // Ancho real de tu logo
                height={100} // Alto real de tu logo
                className="h-22 w-auto px-1 py-1" // Mantiene proporción
                priority // Prioridad de carga
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-lg">
            <a href="#servicios" className="hover:text-[#04BF8A]">
              Nuestros servicios
            </a>
            <a href="#whyCuidarte" className="hover:text-[#04BF8A]">
              ¿Por qué Cuidarte?
            </a>
            <a href="#precios" className="hover:text-[#04BF8A]">
              Planes y precios
            </a>
            <a href="#testimonios" className="hover:text-[#04BF8A]">
              Testimonios
            </a>
            <a href="#contacto" className="hover:text-[#04BF8A]">
              Contacto
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm px-4 py-2 rounded-xl border border-white hover:bg-white hover:text-[#1D4A74] transition"
            >
              Iniciar sesión
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <AnimateSection variant={fadeUp}>
        <section
          ref={heroRef}
          className="relative flex items-center"
          style={{ height: "100vh" }}
        >
          <div className="mx-auto max-w-7xl px-4 h-full grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1
                className={`text-4xl md:text-5xl font-semibold leading-tight text-[#04BF8A] ${montserrat.className}`}
              >
                <span className="text-white">CUIDADO INTEGRAL</span>
                <span className="block text-[#04BF8A]">
                  en la comodidad de tu hogar...
                </span>
              </h1>
              <p className="mt-5 text-lg text-white">
                <strong className="text-[#04bf8a]">Cuidarte</strong> conecta
                pacientes con{" "}
                <strong className="text-[#04bf8a]">
                  terapeutas, cuidadores y profesionales de la salud
                </strong>{" "}
                para atención personalizada a domicilio. Desde acompañamiento
                terapéutico hasta rehabilitación física.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <a
                  href="#contacto"
                  className="px-5 py-3 rounded-xl bg-[#04BF8A] text-white shadow hover:bg-[#00A884]"
                >
                  Ver más..
                </a>
                <a
                  href="https://wa.link/v2l67z"
                  target="_blank"
                  className="px-5 py-3 rounded-xl border border-white hover:bg-white hover:text-[#1D4A74] transition"
                >
                  Hablar con un asesor..
                </a>
              </div>
              <div className="mt-6 text-xs text-white/80">
                Solicita tu asesoramiento • Sin cargo
              </div>
            </div>
            <div className="relative">
              <div className="relative max-h-[80vh] h-[420px] md:h-[560px] rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-white">
                {!videoError ? (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      src="/video_cuidarte.mp4"
                      type="video/mp4"
                      autoPlay
                      loop
                      playsInline
                      muted
                      onError={() => setVideoError(true)}
                    />

                    <div className="absolute inset-0 bg-black/20" />

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <Image
                        src="/nuevologoSinFondo.png"
                        alt="cuidarTE"
                        width={300}
                        height={100}
                        className="w-36 sm:w-40 md:w-128 h-auto"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image
                      src="/logo_png-cuidarte.png"
                      alt="cuidarTE"
                      width={600}
                      height={200}
                      className="w-48 h-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </AnimateSection>

      {/* SERVICIOS */}
      <AnimateSection variant={fadeLeft}>
        <section id="servicios" className="bg-[#04BF8A]">
          <Servicios />
        </section>
      </AnimateSection>

      {/* Profesionales */}
      <AnimateSection variant={fadeRight}>
        <ProfesionalesGrid />
      </AnimateSection>

      {/* Porque Cuidarte */}
      <AnimateSection variant={scaleIn}>
        <WhyCuidarte />
      </AnimateSection>

      {/* Contacto y redes */}
      <section id="contacto" className="bg-[#1D4A74]">
        <ContactSection />
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonios" className="bg-[#1D4A74]">
        <TestimonialsSection />
      </section>

      {/* FOOTER */}
      <AnimatedFooter />
    </main>
  );
}

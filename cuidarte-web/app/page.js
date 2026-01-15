"use client";
import { Montserrat, Open_Sans } from "next/font/google";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Servicios from "./components/Servicios";
import WhyCuidarte from "./components/WhyCuidarte";
import ProfesionalesGrid from "./components/ProfesionalesGrid";

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
      className={`min-h-screen bg-[#1D4A74] text-white ${openSans.className} snap-y snap-mandatory overflow-y-scroll h-screen scroll-smooth`}
    >
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300
    ${showNavbar ? "translate-y-0" : "-translate-y-full"}
    bg-[#1D4A74]/90 backdrop-blur border-b border-white/30`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/">
            <Image
              src="/favicon.png" // Ruta desde public/
              alt="cuidarTE - Atención médica en casa"
              width={400} // Ancho real de tu logo
              height={100} // Alto real de tu logo
              className="h-20 w-auto" // Mantiene proporción
              priority // Prioridad de carga
            />
            </a>
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
      <section
        ref={heroRef}
        className="relative flex items-center snap-start"
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
                href="https://wa.link/v2l67z" target="_blank"
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
                    autoPlay
                    loop
                    playsInline
                    muted
                    onError={() => setVideoError(true)}
                  />

                  <div className="absolute inset-0 bg-black/20" />

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <Image
                      src="/logo_png-cuidarte.png"
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

      {/* SERVICIOS */}
      <section
        id="servicios"
        className="bg-[#04BF8A] py-2 md:min-h-screen snap-start"
        
      >
        <h1 className={`inline-block px-4 py-2 text-3xl md:text-4xl font-semibold text-[#1D4A74] ml-6 mt-2 bg-white rounded-xl shadow-lg ${montserrat.className}`}
            >NUESTROS SERVICIOS</h1>
        <Servicios />
      </section>
      
      {/* Profesionales */}
        <ProfesionalesGrid />
      
      {/* Porque Cuidarte */}
        <WhyCuidarte />

      {/* CÓMO FUNCIONA */}
      <section
        id="como-funciona"
        className="snap-start bg-[#1D4A74] text-white border-t border-white/20  min-h-screen flex items-center"
        
      >
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2
            className={`text-2xl md:text-3xl font-semibold text-[#04BF8A] ${montserrat.className}`}
          >
            Cómo funciona
          </h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Creás tu cuenta",
                desc: "Paciente o profesional. Sólo tu email y contraseña.",
              },
              {
                step: "2",
                title: "Configurás tu perfil",
                desc: "Especialidades, horarios, coberturas o preferencias.",
              },
              {
                step: "3",
                title: "Empezás a usar",
                desc: "Agenda, recordatorios, chat y materiales.",
              },
            ].map((s, i) => (
              <li
                key={i}
                className="rounded-2xl border border-white/20 bg-[#04BF8A] p-6 shadow-sm"
              >
                <div className="text-white text-sm">Paso {s.step}</div>
                <div
                  className={`mt-1 font-semibold text-white ${montserrat.className}`}
                >
                  {s.title}
                </div>
                <p className="mt-2 text-white/90 text-sm">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PROFESIONALES */}
      <section
        id="profesionales"
        className="bg-[#04BF8A] text-white py-16  min-h-screen flex items-center snap-start"
        
      >
        <div className="mx-auto max-w-7xl px-4">
          <h2
            className={`text-2xl md:text-3xl font-semibold ${montserrat.className}`}
          >
            Profesionales verificados
          </h2>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <article
                key={i}
                className="rounded-2xl border border-white/30 bg-[#1D4A74] p-5 shadow-sm"
              >
                <div className="h-32 rounded-xl bg-white/20"></div>
                <div
                  className={`mt-4 font-medium text-white ${montserrat.className}`}
                >
                  Dra./Dr. Nombre Apellido
                </div>
                <p className="text-sm text-white/90">Especialidad • 4.8★</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section
        id="testimonios"
        className="bg-[#1D4A74] snap-start text-white border-t border-white/20  min-h-screen flex items-center"
        
      >
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2
            className={`text-2xl md:text-3xl font-semibold text-[#04BF8A] ${montserrat.className}`}
          >
            Lo que dicen los usuarios
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              "“Ahora no me olvido de los turnos.”",
              "“Mejoré la adherencia de mis pacientes.”",
              "“El aula de salud es un golazo.”",
            ].map((t, i) => (
              <figure
                key={i}
                className="rounded-2xl border border-white/20 bg-[#04BF8A] p-6 shadow-sm"
              >
                <blockquote className="text-white">{t}</blockquote>
                <figcaption className="mt-3 text-sm text-white/80">
                  Usuario verificado
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="mx-auto max-w-7xl px-4 py-20  min-h-screen flex items-center snap-start"
        
      >
        <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-[#04BF8A] to-[#00A884] p-8 md:p-12 text-white shadow">
          <h3
            className={`text-2xl md:text-3xl font-semibold ${montserrat.className}`}
          >
            Empezá hoy con cuidarTE
          </h3>
          <p className="mt-2 text-white/90">
            Unite gratis, invitá a tu equipo y probá todas las funciones.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/registro"
              className="px-5 py-3 rounded-xl bg-white text-[#1D4A74] hover:bg-[#F2F2F2]"
            >
              Crear cuenta
            </a>
            <a
              href="/login"
              className="px-5 py-3 rounded-xl border border-white/30 hover:bg-white/10"
            >
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/20 mt-10 bg-[#1D4A74] text-white snap-start">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>© {new Date().getFullYear()} cuidarTE</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#04BF8A]">
              Términos
            </a>
            <a href="#" className="hover:text-[#04BF8A]">
              Privacidad
            </a>
            <a href="#" className="hover:text-[#04BF8A]">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

"use client";

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaEnvelope,
} from "react-icons/fa";
import AnimateSection from "./AnimateSection";
import { fadeLeft, fadeRight } from "./animations";

export default function ContactSection() {
  return (
    <section
      id="contacto"
      className="bg-[#1D4A74] text-white py-24 border-t border-white/20"
    >
      <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-12 items-start">
        {/* COLUMNA IZQUIERDA */}
        <AnimateSection variant={fadeLeft}>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#04BF8A]">
              Contactanos
            </h2>

            <p className="mt-4 text-white/90 max-w-md">
              Si tenés dudas, necesitás asesoramiento o querés sumar un
              servicio, nuestro equipo está listo para ayudarte.
            </p>

            {/* REDES */}
            <div className="mt-8 space-y-5">
              <a
                href="https://wa.link/v2l67z"
                target="_blank"
                className="group flex items-center gap-4 transition-transform hover:translate-x-1"
              >
                <FaWhatsapp className="text-3xl md:text-4xl text-white/70 group-hover:text-[#25D366] transition-colors" />
                <span className="text-lg md:text-xl font-medium text-white/90 group-hover:text-[#25D366] transition-colors">
                  WhatsApp
                </span>
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                className="group flex items-center gap-4 transition-transform hover:translate-x-1"
              >
                <FaInstagram className="text-3xl md:text-4xl text-white/70 group-hover:text-pink-500 transition-colors" />
                <span className="text-lg md:text-xl font-medium text-white/90 group-hover:text-pink-500 transition-colors">
                  Instagram
                </span>
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                className="group flex items-center gap-4 transition-transform hover:translate-x-1"
              >
                <FaFacebook className="text-3xl md:text-4xl text-white/70 group-hover:text-[#1877F2] transition-colors" />
                <span className="text-lg md:text-xl font-medium text-white/90 group-hover:text-[#1877F2] transition-colors">
                  Facebook
                </span>
              </a>

              <a
                href="mailto:contacto@cuidarte.com"
                className="group flex items-center gap-4 transition-transform hover:translate-x-1"
              >
                <FaEnvelope className="text-3xl md:text-4xl text-white/70 group-hover:text-[#EA4335] transition-colors" />
                <span className="text-lg md:text-xl font-medium text-white/90 group-hover:text-[#EA4335] transition-colors">
                  contacto@cuidarte.com
                </span>
              </a>
            </div>
          </div>
        </AnimateSection>

        {/* COLUMNA DERECHA – FORMULARIO */}
        <AnimateSection variant={fadeRight}>
          <form className="bg-white rounded-2xl p-6 md:p-8 text-[#1D4A74] shadow-lg space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Mensaje</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#04BF8A]"
                placeholder="Contanos en qué podemos ayudarte"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 rounded-xl bg-[#04BF8A] py-3 text-white font-medium hover:bg-[#00A884] transition"
            >
              Enviar mensaje
            </button>
          </form>
        </AnimateSection>
      </div>
    </section>
  );
}

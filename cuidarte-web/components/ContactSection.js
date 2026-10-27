"use client";

import Reveal from "./Reveal";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaEnvelope,
} from "react-icons/fa";

export default function ContactSection() {
  return (
    <section
      id="contacto"
      className="scroll-mt-24 border-t border-slate-200 bg-white py-16 text-[#1D4A74] sm:py-20"
    >
      <Reveal className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_0.85fr] md:items-center lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Estamos para ayudarte</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Hablemos de lo que necesitás.</h2>
          <p className="mt-4 leading-7 text-slate-600">Si tenés dudas, necesitás asesoramiento o querés sumar un servicio, contactá al equipo de Cuidarte.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="https://wa.link/v2l67z" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1D4A74] px-5 py-3 font-semibold text-white transition-[transform,background-color,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-[#163a5c] hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] focus-visible:ring-offset-2">
              <FaWhatsapp aria-hidden="true" /> Escribir por WhatsApp
            </a>
            <a href="mailto:contacto@cuidartelr.com.ar" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-[#1D4A74] transition-[transform,background-color] duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">
              <FaEnvelope aria-hidden="true" /> Enviar un email
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[#F4F7F5] p-5 sm:p-7">
          <h3 className="font-semibold text-[#1D4A74]">También podés encontrarnos</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <li><a href="https://www.instagram.com/cuidarte.lr/" target="_blank" rel="noopener noreferrer" className="group flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#1D4A74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]"><FaInstagram aria-hidden="true" className="text-xl text-pink-600" />Instagram</a></li>
            <li><a href="https://www.facebook.com/profile.php?id=100090937053452&locale=es_LA" target="_blank" rel="noopener noreferrer" className="group flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:text-[#1D4A74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]"><FaFacebook aria-hidden="true" className="text-xl text-blue-700" />Facebook</a></li>
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

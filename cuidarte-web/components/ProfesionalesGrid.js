"use client";

import { useEffect, useState } from "react";
import { apiAssetUrl, apiFetch } from "@/lib/api";
import Reveal from "./Reveal";

export default function ProfesionalesGrid() {
  const [profesionales, setProfesionales] = useState([]);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiFetch("/api/profesionales/publicos", { signal: controller.signal })
      .then((data) => setProfesionales(Array.isArray(data) ? data : []))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError("No pudimos cargar la información del equipo.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <section
      id="profesionales"
      className="scroll-mt-24 bg-[#F4F7F5] py-16 text-[#1D4A74] sm:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Nuestro equipo</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Profesionales que acompañan</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">Conocé a quienes forman parte del equipo de Cuidarte.</p>
        </Reveal>

        {loading && <p role="status" className="mt-8 text-slate-600">Cargando profesionales…</p>}
        {error && <p role="alert" className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">{error}</p>}
        {!loading && !error && profesionales.length === 0 && (
          <p className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-slate-600">En este momento no hay profesionales publicados.</p>
        )}

        {!loading && !error && profesionales.length > 0 && (
          <ul className="mt-8 grid gap-5 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {profesionales.map((profesional, index) => {
              const imageFailed = failedImages.has(index);
              return (
                <Reveal
                  as="li"
                  key={`${profesional.nombreApellido}-${index}`}
                  delay={Math.min(index * 0.06, 0.3)}
                >
                  <article className="group h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:border-[#04BF8A]/40 hover:shadow-lg">
                    <div className="relative grid aspect-[5/4] place-items-center overflow-hidden bg-slate-50 p-3 sm:aspect-[4/3]">
                      {profesional.fotoUrl && !imageFailed ? (
                        <img
                          src={apiAssetUrl(profesional.fotoUrl)}
                          alt={`Fotografía de ${profesional.nombreApellido}`}
                          loading="lazy"
                          decoding="async"
                          onError={() => setFailedImages((current) => new Set(current).add(index))}
                          className="h-full w-full object-contain transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.02]"
                        />
                      ) : (
                        <span aria-hidden="true" className="grid h-20 w-20 place-items-center rounded-full bg-[#1D4A74] text-2xl font-semibold text-white">
                          {profesional.nombreApellido?.trim()?.[0]?.toLocaleUpperCase("es") || "C"}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-[#1D4A74]">{profesional.nombreApellido}</h3>
                      {profesional.profesion && <p className="mt-1 text-sm font-medium text-emerald-700">{profesional.profesion}</p>}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

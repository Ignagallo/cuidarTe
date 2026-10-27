import Image from "next/image";
import Reveal from "./Reveal";

const servicios = [
  { id: 1, title: "Cuidador", desc: "Asistencia y acompañamiento diario", image: "/cuidado1.jpg" },
  { id: 2, title: "Limpieza", desc: "Higiene integral del hogar", image: "/limpieza3.png" },
  { id: 3, title: "Kinesiología", desc: "Rehabilitación y movilidad", image: "/kinesiologo1.jpg" },
  { id: 4, title: "Enfermería", desc: "Atención profesional domiciliaria", image: "/enfermeria1.jpg" },
  { id: 5, title: "Nutrición", desc: "Planes alimentarios personalizados", image: "/nutricionista1.jpg" },
  { id: 6, title: "Terapia Ocupacional", desc: "Autonomía en actividades diarias", image: "/terapiaocupacional2.jpg" },
  { id: 7, title: "Psicología", desc: "Acompañamiento emocional", image: "/psicologo2.webp" },
  { id: 8, title: "Radiología", desc: "Estudios por imágenes a domicilio", image: "/radiologo2.jpg" },
  { id: 9, title: "Análisis Clínicos", desc: "Extracciones y estudios", image: "/analisis-clinico2.jpg" },
  { id: 10, title: "Acompañante Terapéutico", desc: "Contención profesional", image: "/acompanante-terapeutico2.png" },
];

export default function Servicios() {
  return (
    <section id="servicios" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Atención en el hogar</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1D4A74] sm:text-4xl">Nuestros servicios</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
            Brindamos atención profesional a domicilio con un equipo interdisciplinario comprometido con el bienestar y la continuidad del cuidado.
          </p>
        </Reveal>

        <ul className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {servicios.map((servicio) => (
            <Reveal as="li" key={servicio.id} delay={servicio.id * 0.025}>
              <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image src={servicio.image} alt="" fill sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 24vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]" />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm font-semibold leading-snug text-[#1D4A74] sm:text-base">{servicio.title}</h3>
                  <p className="mt-1.5 hidden text-sm leading-6 text-slate-600 sm:block">{servicio.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

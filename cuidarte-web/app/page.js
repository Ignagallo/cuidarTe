import { Montserrat, Open_Sans } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '600', '700'] });
const openSans = Open_Sans({ subsets: ['latin'], weight: ['400', '600'] });

export default function Page() {
  return (
    <main className={`min-h-screen bg-[#1D4A74] text-white ${openSans.className}`}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-[#1D4A74]/90 backdrop-blur border-b border-white/30">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-[#04BF8A] inline-flex items-center justify-center shadow text-white font-bold" style={{ fontFamily: 'Express, sans-serif' }}>CT</span>
            <span className="font-semibold tracking-tight" style={{ fontFamily: 'Express, sans-serif' }}>cuidarTE</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#servicios" className="hover:text-[#04BF8A]">Servicios</a>
            <a href="#como-funciona" className="hover:text-[#04BF8A]">Cómo funciona</a>
            <a href="#profesionales" className="hover:text-[#04BF8A]">Profesionales</a>
            <a href="#testimonios" className="hover:text-[#04BF8A]">Testimonios</a>
            <a href="#faq" className="hover:text-[#04BF8A]">Preguntas</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm px-4 py-2 rounded-xl border border-white hover:bg-white hover:text-[#1D4A74] transition">Iniciar sesión</a>
            <a href="#cta" className="text-sm px-4 py-2 rounded-xl bg-[#04BF8A] text-white shadow hover:bg-[#00A884]">Comenzar</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className={`text-4xl md:text-5xl font-semibold leading-tight text-[#04BF8A] ${montserrat.className}`}>
              ATENCIÓN PERSONALIZADA EN TU HOGAR
            </h1>
            <p className="mt-5 text-lg text-white">
              CuidarTE conecta pacientes con profesionales de la salud para turnos, seguimiento y educación personalizada.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <a href="#cta" className="px-5 py-3 rounded-xl bg-[#04BF8A] text-white shadow hover:bg-[#00A884]">Probar gratis</a>
              <a href="#como-funciona" className="px-5 py-3 rounded-xl border border-white hover:bg-white hover:text-[#1D4A74] transition">Ver cómo funciona</a>
            </div>
            <div className="mt-6 text-xs text-white/80">Sin tarjeta • Cancelás cuando quieras</div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-white text-[#1D4A74] shadow-xl border p-4 border-white">
              <div className="h-full w-full rounded-xl bg-gradient-to-br from-[#04BF8A]/10 via-white to-[#1D4A74]/10 grid grid-cols-3 gap-3 p-3">
                <div className="col-span-2 rounded-xl bg-white text-[#1D4A74] shadow-inner border border-[#1D4A74]/20 p-4">
                  <div className="text-sm font-medium">Agenda semanal</div>
                  <div className="mt-3 grid grid-cols-7 gap-2 text-xs">
                    {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d,i)=> (
                      <div key={i} className="h-16 rounded-lg border border-[#1D4A74]/20 bg-[#F2F2F2]"></div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-white text-[#1D4A74] shadow-inner border border-[#1D4A74]/20 p-4">
                  <div className="text-sm font-medium">Indicadores</div>
                  <ul className="mt-3 space-y-2 text-xs">
                    <li className="flex justify-between"><span>Adherencia</span><span className="font-semibold text-[#04BF8A]">92%</span></li>
                    <li className="flex justify-between"><span>Asistencia</span><span className="font-semibold text-[#1D4A74]">87%</span></li>
                    <li className="flex justify-between"><span>Satisfacción</span><span className="font-semibold text-[#00A884]">4.7★</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="bg-[#04BF8A] text-white py-16 min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className={`text-2xl md:text-3xl font-semibold ${montserrat.className}`}>¿Qué ofrece cuidarTE?</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {title: 'Turnos online', desc: 'Reservá y reprogramá turnos con recordatorios automáticos.'},
              {title: 'Seguimiento de pacientes', desc: 'Planes de cuidado, hábitos y alertas inteligentes.'},
              {title: 'Aula de salud', desc: 'Material educativo y videollamadas con profesionales.'},
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-white/30 bg-[#1D4A74] p-6 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-[#04BF8A] inline-flex items-center justify-center mb-4 text-white font-bold">{i+1}</div>
                <h3 className={`font-semibold text-white ${montserrat.className}`}>{f.title}</h3>
                <p className="mt-2 text-white/90 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-[#1D4A74] text-white border-t border-white/20  min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className={`text-2xl md:text-3xl font-semibold text-[#04BF8A] ${montserrat.className}`}>Cómo funciona</h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {step: '1', title: 'Creás tu cuenta', desc: 'Paciente o profesional. Sólo tu email y contraseña.'},
              {step: '2', title: 'Configurás tu perfil', desc: 'Especialidades, horarios, coberturas o preferencias.'},
              {step: '3', title: 'Empezás a usar', desc: 'Agenda, recordatorios, chat y materiales.'},
            ].map((s, i) => (
              <li key={i} className="rounded-2xl border border-white/20 bg-[#04BF8A] p-6 shadow-sm">
                <div className="text-white text-sm">Paso {s.step}</div>
                <div className={`mt-1 font-semibold text-white ${montserrat.className}`}>{s.title}</div>
                <p className="mt-2 text-white/90 text-sm">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PROFESIONALES */}
      <section id="profesionales" className="bg-[#04BF8A] text-white py-16  min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className={`text-2xl md:text-3xl font-semibold ${montserrat.className}`}>Profesionales verificados</h2>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <article key={i} className="rounded-2xl border border-white/30 bg-[#1D4A74] p-5 shadow-sm">
                <div className="h-32 rounded-xl bg-white/20"></div>
                <div className={`mt-4 font-medium text-white ${montserrat.className}`}>Dra./Dr. Nombre Apellido</div>
                <p className="text-sm text-white/90">Especialidad • 4.8★</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonios" className="bg-[#1D4A74] text-white border-t border-white/20  min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className={`text-2xl md:text-3xl font-semibold text-[#04BF8A] ${montserrat.className}`}>Lo que dicen los usuarios</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {["“Ahora no me olvido de los turnos.”","“Mejoré la adherencia de mis pacientes.”","“El aula de salud es un golazo.”"].map((t, i) => (
              <figure key={i} className="rounded-2xl border border-white/20 bg-[#04BF8A] p-6 shadow-sm">
                <blockquote className="text-white">{t}</blockquote>
                <figcaption className="mt-3 text-sm text-white/80">Usuario verificado</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-7xl px-4 py-20  min-h-screen flex items-center">
        <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-[#04BF8A] to-[#00A884] p-8 md:p-12 text-white shadow">
          <h3 className={`text-2xl md:text-3xl font-semibold ${montserrat.className}`}>Empezá hoy con cuidarTE</h3>
          <p className="mt-2 text-white/90">Unite gratis, invitá a tu equipo y probá todas las funciones.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="/registro" className="px-5 py-3 rounded-xl bg-white text-[#1D4A74] hover:bg-[#F2F2F2]">Crear cuenta</a>
            <a href="/login" className="px-5 py-3 rounded-xl border border-white/30 hover:bg-white/10">Ya tengo cuenta</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/20 mt-10 bg-[#1D4A74] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>© {new Date().getFullYear()} cuidarTE</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#04BF8A]">Términos</a>
            <a href="#" className="hover:text-[#04BF8A]">Privacidad</a>
            <a href="#" className="hover:text-[#04BF8A]">Contacto</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

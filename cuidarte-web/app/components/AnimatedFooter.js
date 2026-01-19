export default function AnimatedFooter() {
  return (
    <footer className="bg-[#1D4A74] text-white mt-16">
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-12 md:grid-cols-3 items-start">

        {/* LOGO */}
        <div className="flex items-center justify-center h-full">
          <img
            src="/nuevologo2.png"
            alt="cuidarTE"
            className="max-h-55 object-contain rounded-full"
          />
        </div>

        {/* LEGALES */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-[#04BF8A]">Términos y condiciones</a></li>
            <li><a href="#" className="hover:text-[#04BF8A]">Política de privacidad</a></li>
            <li><a href="#" className="hover:text-[#04BF8A]">Contacto</a></li>
            <li>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#04BF8A]"
              >
                Trabajar con nosotros
              </a>
            </li>
          </ul>
        </div>

        {/* REDES */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Seguinos</h4>
          <div className="flex gap-5">
            <a href="https://www.instagram.com" target="_blank">
              <img src="/instagram.png" className="h-8 w-8 hover:scale-115 transition h-20 w-auto shrink-0 object-contain" />
            </a>
            <a href="https://www.facebook.com" target="_blank">
              <img src="/facebook.png" className="h-8 w-8 hover:scale-115 transition h-20 w-auto shrink-0 object-contain" />
            </a>
            <a href="https://www.linkedin.com" target="_blank">
              <img src="/linkedin.png" className="h-8 w-8 hover:scale-115 transition h-20 w-auto shrink-0 object-contain" />
            </a>
            <a href="mailto:contacto@cuidarte.com">
              <img src="/gmail.png" className="h-8 w-8 hover:scale-115 transition h-20 w-auto shrink-0 object-contain" />
            </a>
          </div>
        </div>
      </div>

      {/* FIRMAS */}
      <div className="border-t border-white/20">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-white/70 flex flex-col md:flex-row justify-between gap-2">
          <span>Creado por: <span className="font-bold"><a href="www.gallosolutions.com">Gallo Solutions</a></span></span>
          <span>Desarrollo: <span className="font-bold"><a href="www.gallosolutions.com">Gallo Solutions</a></span></span>
          <span>© {new Date().getFullYear()} Cuidarte — Todos los derechos reservados</span>
        </div>
      </div>
    </footer>
  );
}

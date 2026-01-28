import Image from 'next/image';

export default function AdminLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D4A74]">
      <div className="flex flex-col items-center gap-6">
        
        {/* Logo + animación */}
        <div className="relative">
          <div className="h-80 w-80 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <Image
              src="/nuevologoSinFondo.png"
              alt="CuidarTE"
              width={250}
              height={250}
              priority
            />
          </div>

          {/* Aro giratorio */}
          <div className="absolute inset-0 rounded-full border-4 border-[#04BF8A]/50 border-t-transparent animate-spin" />
        </div>

        <div className="text-center">
          <p className="text-white text-sm tracking-wide">
            Verificando sesión
          </p>
        </div>

      </div>
    </div>
  );
}


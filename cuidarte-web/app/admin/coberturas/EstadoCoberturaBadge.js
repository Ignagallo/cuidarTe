// admin/coberturas/EstadoCoberturaBadge.js
export default function EstadoCoberturaBadge({ estado }) {
  const styles = {
    impago: "bg-red-200 text-red-900",
    parcial: "bg-yellow-200 text-yellow-900",
    pago: "bg-green-200 text-green-900",
  };

  const labels = {
    impago: "IMPAGO",
    parcial: "PARCIAL",
    pago: "PAGO",
  };

  return (
    <span
      className={`inline-flex items-center justify-center
        px-3 py-1 rounded-full text-xs font-semibold
        ${styles[estado] ?? "bg-gray-200 text-gray-800"}`}
    >
      {labels[estado] ?? estado}
    </span>
  );
}


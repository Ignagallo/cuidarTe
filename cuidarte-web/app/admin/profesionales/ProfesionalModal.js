"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { apiAssetUrl, apiFetch, deleteUploadedImage, uploadImage } from "@/lib/api";
import AdminAuthContext from "@/components/AdminAuthContext";

const inputBase = `
  w-full px-4 py-2.5 rounded-xl
  border border-gray-300
  bg-white
  text-gray-800
  placeholder-gray-400
  transition
  focus:outline-none
  focus:ring-2 focus:ring-[#04BF8A]
  focus:border-[#04BF8A]
  hover:border-gray-400
`;

export default function ProfesionalModal({ open, onClose, onSaved, editing }) {
  const { registerUnsavedForm } = useContext(AdminAuthContext);
  const editMode = !!editing;

  const [form, setForm] = useState({
    nombreApellido: "",
    profesion: "",
    telefono: "",
    email: "",
    direccion: "",
    observaciones: "",
    fotoUrl: "",
    dni: "",
    fechaNacimiento: "",
    cbuCvu: "",
  });

  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dirty, setDirty] = useState(false);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    registerUnsavedForm("profesional-form", open && dirty);
    return () => registerUnsavedForm("profesional-form", false);
  }, [dirty, open, registerUnsavedForm]);

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  useEffect(() => () => clearObjectUrl(), [clearObjectUrl]);

  useEffect(() => {
    if (!open) return;

    clearObjectUrl();
    setPhotoFile(null);
    setPreviewUrl(editing?.fotoUrl ? apiAssetUrl(editing.fotoUrl) : "");
    setDirty(false);

    if (editing) {
      const toYMD = (x) => (x ? new Date(x).toISOString().slice(0, 10) : "");
      setForm({
        nombreApellido: editing.nombreApellido || "",
        profesion: editing.profesion || "",
        telefono: editing.telefono || "",
        email: editing.email || "",
        direccion: editing.direccion || "",
        observaciones: editing.observaciones || "",
        fotoUrl: editing.fotoUrl || "",
        dni: editing.dni || "",
        fechaNacimiento: toYMD(editing.fechaNacimiento),
        cbuCvu: editing.cbuCvu || "",
      });
    } else {
      setForm({
        nombreApellido: "",
        profesion: "",
        telefono: "",
        email: "",
        direccion: "",
        observaciones: "",
        fotoUrl: "",
        dni: "",
        fechaNacimiento: "",
        cbuCvu: "",
      });
    }

    setErr("");
  }, [open, editing, clearObjectUrl]);

  const requestClose = () => {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Querés cerrar el formulario?")) return;
    clearObjectUrl();
    setPhotoFile(null);
    onClose();
  };

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setDirty(true);
  };

  function selectFoto(file) {
    if (!file) return;
    setErr("");
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
      setErr("Elegí una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr("La imagen no puede superar 5 MB.");
      return;
    }
    clearObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPhotoFile(file);
    setPreviewUrl(objectUrl);
    setDirty(true);
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.dni.trim()) return setErr("El DNI es obligatorio");
    if (!form.fechaNacimiento)
      return setErr("La fecha de nacimiento es obligatoria");
    if (!form.cbuCvu.trim()) return setErr("El CBU / CVU es obligatorio");
    if (!form.telefono.trim()) return setErr("El teléfono es obligatorio");
    if (!form.email.trim()) return setErr("El email es obligatorio");
    if (!form.direccion.trim()) return setErr("La dirección es obligatoria");

    const payload = {
      ...form,
      fechaNacimiento: new Date(form.fechaNacimiento).toISOString(),
    };

    setSaving(true);
    setErr("");
    let uploadedUrl = "";
    try {
      if (photoFile) {
        setUploading(true);
        const uploaded = await uploadImage(photoFile);
        uploadedUrl = uploaded.url;
        payload.fotoUrl = uploadedUrl;
      }

      if (editMode) {
        await apiFetch(`/api/profesionales/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/profesionales", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
    } catch (e) {
      if (uploadedUrl) {
        try {
          await deleteUploadedImage(uploadedUrl);
        } catch (_cleanupError) {
          setErr(`${e.message}. No se pudo limpiar la imagen que se acababa de subir.`);
          setUploading(false);
          setSaving(false);
          return;
        }
      }
      setErr(e.message);
      setUploading(false);
      setSaving(false);
      return;
    }

    setDirty(false);
    setPhotoFile(null);
    clearObjectUrl();
    if (uploadedUrl && editing?.fotoUrl && editing.fotoUrl !== uploadedUrl) {
      try {
        await deleteUploadedImage(editing.fotoUrl);
      } catch (_cleanupError) {
        // The old image remains when the backend still finds a reference.
      }
    }
    try {
      await onSaved?.();
    } catch (_refreshError) {
      alert("El profesional se guardó, pero no se pudo actualizar la lista. Volvé a cargar la sección.");
    } finally {
      setUploading(false);
      setSaving(false);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Modal title={editMode ? "Editar profesional" : "Nuevo profesional"} onClose={requestClose} bodyClassName="min-h-0 overflow-y-auto p-0" size="max-w-3xl">
      <form onSubmit={submit} className="flex min-h-0 flex-col">
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          <FormField label="Nombre y apellido" htmlFor="profesional-nombre" required>
            <input id="profesional-nombre" autoComplete="name" className={inputBase} value={form.nombreApellido} onChange={(e) => updateField("nombreApellido", e.target.value)} required />
          </FormField>
          <FormField label="Profesión" htmlFor="profesional-profesion" required>
            <input id="profesional-profesion" className={inputBase} value={form.profesion} onChange={(e) => updateField("profesion", e.target.value)} required />
          </FormField>
          <FormField label="DNI" htmlFor="profesional-dni" required>
            <input id="profesional-dni" inputMode="numeric" className={inputBase} value={form.dni} onChange={(e) => updateField("dni", e.target.value)} required />
          </FormField>
          <FormField label="Fecha de nacimiento" htmlFor="profesional-fecha" required>
            <input id="profesional-fecha" type="date" className={inputBase} value={form.fechaNacimiento} onChange={(e) => updateField("fechaNacimiento", e.target.value)} required />
          </FormField>
          <FormField label="CBU / CVU" htmlFor="profesional-cbu" required>
            <input id="profesional-cbu" inputMode="numeric" className={inputBase} value={form.cbuCvu} onChange={(e) => updateField("cbuCvu", e.target.value)} required />
          </FormField>
          <FormField label="Teléfono" htmlFor="profesional-telefono" required>
            <input id="profesional-telefono" type="tel" autoComplete="tel" className={inputBase} value={form.telefono} onChange={(e) => updateField("telefono", e.target.value)} required />
          </FormField>
          <FormField label="Email" htmlFor="profesional-email" required>
            <input id="profesional-email" type="email" autoComplete="email" className={inputBase} value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
          </FormField>
          <FormField label="Dirección" htmlFor="profesional-direccion" required className="sm:col-span-2">
            <input id="profesional-direccion" autoComplete="street-address" className={inputBase} value={form.direccion} onChange={(e) => updateField("direccion", e.target.value)} required />
          </FormField>
          <FormField label="Observaciones" htmlFor="profesional-observaciones" className="sm:col-span-2">
            <textarea id="profesional-observaciones" className={`${inputBase} min-h-24`} value={form.observaciones} onChange={(e) => updateField("observaciones", e.target.value)} />
          </FormField>

          <div className="space-y-3 sm:col-span-2">
            <FormField label="Fotografía" htmlFor="profesional-foto">
              <input id="profesional-foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { selectFoto(e.target.files?.[0]); e.target.value = ""; }} disabled={uploading || saving} className="block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-medium" />
            </FormField>
            <p className="text-xs text-slate-500">JPG, PNG o WebP · máximo 5 MB</p>
            {previewUrl ? (
              <img src={previewUrl} alt={`Vista previa de ${form.nombreApellido || "la fotografía"}`} className="h-28 w-28 rounded-xl border border-slate-200 object-cover" />
            ) : (
              <div className="grid h-28 w-28 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">Sin fotografía</div>
            )}
            {photoFile && <p role="status" className="text-sm text-slate-600">La foto se subirá al guardar el profesional.</p>}
          </div>

          {err && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{err}</p>}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={requestClose} className="min-h-11 rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A]">Cancelar</button>
          <button type="submit" disabled={saving || uploading} className="min-h-11 rounded-xl bg-[#1D4A74] px-5 py-2.5 font-medium text-white hover:bg-[#163a5c] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#04BF8A] focus-visible:ring-offset-2">
            {uploading ? "Subiendo fotografía…" : saving ? "Guardando…" : editMode ? "Guardar cambios" : "Crear profesional"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

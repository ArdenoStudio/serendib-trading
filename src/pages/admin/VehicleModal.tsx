import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, Upload, Sparkles, ImagePlus, Trash2, Tag, Plus } from 'lucide-react';
import { uploadVehicleImage, parseVehicleText, fetchDynamicKnowledge, learnFromVehicle } from '../../lib/supabase';
import { isBlobUrl } from '../../lib/images';
import { useBodyScrollLock } from '../../lib/bodyScrollLock';

export interface VehicleFormData {
  id?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  image: string;
  gallery: string[];
  condition: string;
  is_sold: boolean;
  description: string;
  key_features: string[];
}

interface Props {
  initial?: VehicleFormData | null;
  onClose: () => void;
  onSaved: () => void;
}

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Hybrid', 'Electric'] as const;
const TRANSMISSION_OPTIONS = ['Automatic', 'Manual'] as const;
const BODY_TYPE_OPTIONS = ['Sedan', 'Hatchback', 'SUV', 'Crossover', 'Coupe', 'Pickup', 'Double Cab', 'Van', 'Wagon', 'Convertible'] as const;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const EMPTY: VehicleFormData = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  fuel: 'Petrol',
  transmission: 'Automatic',
  bodyType: 'Sedan',
  color: '',
  image: '',
  gallery: [],
  condition: 'Registered',
  is_sold: false,
  description: '',
  key_features: [],
};

const sanitizeForm = (data: VehicleFormData): VehicleFormData => ({
  ...data,
  fuel: (FUEL_OPTIONS as readonly string[]).includes(data.fuel) ? data.fuel : 'Petrol',
  transmission: (TRANSMISSION_OPTIONS as readonly string[]).includes(data.transmission)
    ? data.transmission
    : 'Automatic',
  bodyType: (BODY_TYPE_OPTIONS as readonly string[]).includes(data.bodyType)
    ? data.bodyType
    : data.bodyType || 'Sedan',
});

const inp =
  'w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white placeholder:text-white/55 transition-all [color-scheme:dark] focus:border-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]';
const lbl = 'mb-1.5 block text-sm font-semibold text-white/80';

export default function VehicleModal({ initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<VehicleFormData>(sanitizeForm(initial ?? EMPTY));
  const [tab, setTab] = useState<'form' | 'paste'>('form');
  const [pasteText, setPasteText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [heroPreview, setHeroPreview] = useState(initial?.image ?? '');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initial?.gallery ?? []);
  const [newFeature, setNewFeature] = useState('');
  const [parseStatus, setParseStatus] = useState('');
  const [dynamicKB, setDynamicKB] = useState<Record<string, any>>({});
  const heroRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    fetchDynamicKnowledge().then(setDynamicKB);
  }, []);

  useBodyScrollLock(true);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  const set = (k: keyof VehicleFormData, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleHeroUpload = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setHeroPreview(preview);
    setUploading(true);
    setFormError('');
    try {
      const url = await uploadVehicleImage(file);
      set('image', url);
      setHeroPreview(url);
      URL.revokeObjectURL(preview);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown storage error';
      setFormError(`Storage upload failed: ${detail} Local previews cannot be published.`);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploading(true);
    setFormError('');
    const uploadedUrls: string[] = [];
    const failures: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadVehicleImage(file);
        uploadedUrls.push(url);
      } catch (err) {
        failures.push(err instanceof Error ? err.message : 'Upload failed');
      }
    }
    if (uploadedUrls.length > 0) {
      setGalleryPreviews((p) => [...p, ...uploadedUrls]);
      setForm((f) => ({ ...f, gallery: [...(f.gallery ?? []), ...uploadedUrls] }));
    }
    if (failures.length > 0) {
      const uniqueReasons = [...new Set(failures)];
      setFormError(
        `${failures.length} of ${files.length} image${files.length === 1 ? '' : 's'} failed to upload. ${uniqueReasons.join(' ')}`,
      );
    }
    setUploading(false);
  };

  const removeGallery = (idx: number) => {
    setGalleryPreviews((p) => p.filter((_, i) => i !== idx));
    set(
      'gallery',
      (form.gallery ?? []).filter((_, i) => i !== idx),
    );
  };

  const handleParse = () => {
    if (!pasteText.trim()) return;
    setParsing(true);
    setParseStatus('Extracting key data...');

    setTimeout(() => {
      setParseStatus('Analyzing vehicle model...');
      setTimeout(() => {
        setParseStatus('Inferring missing specifications...');
        setTimeout(() => {
          const parsed = parseVehicleText(pasteText, dynamicKB);
          setForm((f) => sanitizeForm({ ...f, ...parsed }));
          setParsing(false);
          setParseStatus('');
          setTab('form');
        }, 800);
      }, 600);
    }, 400);
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    set('key_features', [...(form.key_features ?? []), newFeature.trim()]);
    setNewFeature('');
  };
  const removeFeature = (i: number) =>
    set(
      'key_features',
      (form.key_features ?? []).filter((_, idx) => idx !== i),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    const { id, ...data } = form;
    if (isBlobUrl(data.image) || (data.gallery || []).some(isBlobUrl)) {
      setFormError('Remove local-only image previews and re-upload so vehicle photos get real public URLs.');
      setSaving(false);
      return;
    }
    if (!data.image?.trim()) {
      setFormError('Add a main photo before saving this vehicle.');
      setSaving(false);
      return;
    }
    try {
      if (id) {
        const res = await fetch('/api/db/vehicles', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update vehicle');
        }
      } else {
        const res = await fetch('/api/db/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create vehicle');
        }
      }

      await learnFromVehicle(form);

      onSaved();
      onClose();
    } catch (err: any) {
      setFormError(`Error saving vehicle: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const motionProps = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 12 },
        transition: { duration: 0.16, ease: 'easeOut' as const },
      };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/80 p-0 sm:items-center sm:p-4">
      <motion.div
        ref={dialogRef}
        {...motionProps}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-modal-title"
        aria-describedby="vehicle-modal-copy"
        className="flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden border border-white/10 bg-[#0A0A0A] text-white shadow-2xl sm:h-auto sm:max-h-[min(920px,calc(100dvh-2rem))] sm:rounded-[28px]"
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pr-2">
              <h2 id="vehicle-modal-title" className="text-xl font-black tracking-tight text-white sm:text-2xl">
                {initial ? 'Edit vehicle' : 'Add vehicle'}
              </h2>
              <p id="vehicle-modal-copy" className="mt-1 text-sm text-white/60">
                {initial ? 'Update details, photos, or price, then save.' : 'Fill in the car details and add a main photo.'}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Vehicle entry method">
            {(['form', 'paste'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                  tab === t ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                {t === 'paste' ? (
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Paste text
                  </span>
                ) : (
                  'Form'
                )}
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {tab === 'paste' ? (
            <motion.div
              key="paste"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8">
                <label htmlFor="vehicle-paste" className={lbl}>
                  Listing text
                </label>
                <p className="mb-3 text-sm text-white/60">
                  Paste an ad or spec sheet. We will fill the form from it.
                </p>
                <textarea
                  id="vehicle-paste"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={12}
                  placeholder={
                    'Toyota Land Cruiser Prado 2020\nColor: Pearl White\nMileage: 45,000 km\nFuel: Diesel\nPrice: LKR 35,000,000'
                  }
                  className={`${inp} resize-y font-mono text-xs leading-relaxed`}
                />
              </div>
              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/10 bg-[#0A0A0A] p-4 sm:flex-row sm:justify-end sm:px-7 sm:py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleParse}
                  disabled={parsing || !pasteText.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-8 py-3 text-sm font-bold text-black disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {parsing ? parseStatus : (
                    <>
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      Fill form
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
              aria-busy={saving || uploading}
            >
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label htmlFor="vehicle-make" className={lbl}>
                      Make
                    </label>
                    <input
                      id="vehicle-make"
                      required
                      value={form.make}
                      onChange={(e) => set('make', e.target.value)}
                      className={inp}
                      placeholder="Toyota"
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-model" className={lbl}>
                      Model
                    </label>
                    <input
                      id="vehicle-model"
                      required
                      value={form.model}
                      onChange={(e) => set('model', e.target.value)}
                      className={inp}
                      placeholder="Land Cruiser"
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-year" className={lbl}>
                      Year
                    </label>
                    <input
                      id="vehicle-year"
                      required
                      type="number"
                      value={form.year}
                      onChange={(e) => set('year', Number(e.target.value))}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-condition" className={lbl}>
                      Condition
                    </label>
                    <select
                      id="vehicle-condition"
                      value={form.condition}
                      onChange={(e) => set('condition', e.target.value)}
                      className={inp}
                    >
                      {['New', 'Registered', 'Reconditioned'].map((c) => (
                        <option key={c} value={c} className="bg-black text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label htmlFor="vehicle-price" className={lbl}>
                      Price (LKR)
                    </label>
                    <input
                      id="vehicle-price"
                      required
                      type="number"
                      value={form.price}
                      onChange={(e) => set('price', Number(e.target.value))}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-mileage" className={lbl}>
                      Mileage (km)
                    </label>
                    <input
                      id="vehicle-mileage"
                      required
                      type="number"
                      value={form.mileage}
                      onChange={(e) => set('mileage', Number(e.target.value))}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-fuel" className={lbl}>
                      Fuel
                    </label>
                    <select
                      id="vehicle-fuel"
                      value={form.fuel}
                      onChange={(e) => set('fuel', e.target.value)}
                      className={inp}
                    >
                      {FUEL_OPTIONS.map((f) => (
                        <option key={f} value={f} className="bg-black text-white">
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vehicle-transmission" className={lbl}>
                      Transmission
                    </label>
                    <select
                      id="vehicle-transmission"
                      value={form.transmission}
                      onChange={(e) => set('transmission', e.target.value)}
                      className={inp}
                    >
                      {TRANSMISSION_OPTIONS.map((t) => (
                        <option key={t} value={t} className="bg-black text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label htmlFor="vehicle-body" className={lbl}>
                      Body type
                    </label>
                    <select
                      id="vehicle-body"
                      value={form.bodyType}
                      onChange={(e) => set('bodyType', e.target.value)}
                      className={inp}
                    >
                      {BODY_TYPE_OPTIONS.map((b) => (
                        <option key={b} value={b} className="bg-black text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-1 lg:col-span-3">
                    <label htmlFor="vehicle-color" className={lbl}>
                      Color
                    </label>
                    <input
                      id="vehicle-color"
                      value={form.color}
                      onChange={(e) => set('color', e.target.value)}
                      className={inp}
                      placeholder="Pearl White"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <p className={lbl} id="vehicle-hero-label">
                    Main photo
                  </p>
                  <button
                    type="button"
                    onClick={() => heroRef.current?.click()}
                    aria-labelledby="vehicle-hero-label"
                    className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-white/10 text-left transition-all hover:border-[#D4AF37]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    style={{ height: heroPreview ? 180 : 120 }}
                  >
                    {heroPreview ? (
                      <img src={heroPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full flex-col items-center justify-center gap-2 text-white/55">
                        <Upload className="h-8 w-8" aria-hidden="true" />
                        <span className="text-sm font-semibold">Click to upload main photo</span>
                      </span>
                    )}
                    {heroPreview && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        Change photo
                      </span>
                    )}
                    {uploading && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm font-semibold text-[#D4AF37]">
                        Uploading…
                      </span>
                    )}
                  </button>
                  <input
                    ref={heroRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleHeroUpload(e.target.files[0]);
                    }}
                  />
                  <label htmlFor="vehicle-image-url" className={lbl}>
                    Or paste a photo URL
                  </label>
                  <input
                    id="vehicle-image-url"
                    value={form.image}
                    onChange={(e) => {
                      set('image', e.target.value);
                      setHeroPreview(e.target.value);
                    }}
                    className={inp}
                    placeholder="https://"
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <p className={lbl} id="vehicle-gallery-label">
                    Gallery photos
                  </p>
                  <div className="flex flex-wrap gap-3" role="list" aria-labelledby="vehicle-gallery-label">
                    {galleryPreviews.map((src, i) => (
                      <div key={`${src}-${i}`} className="relative h-20 w-24 overflow-hidden rounded-xl border border-white/10" role="listitem">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGallery(i)}
                          aria-label={`Remove gallery photo ${i + 1}`}
                          className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-red-200 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      className="flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/10 text-white/55 transition-all hover:border-[#D4AF37]/50 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    >
                      <ImagePlus className="h-5 w-5" aria-hidden="true" />
                      <span className="text-xs font-semibold">Add</span>
                    </button>
                  </div>
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(e) => {
                      if (e.target.files) handleGalleryUpload(e.target.files);
                    }}
                  />
                </div>

                <div className="mt-6">
                  <label htmlFor="vehicle-description" className={lbl}>
                    Description
                  </label>
                  <textarea
                    id="vehicle-description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    className={`${inp} resize-y`}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <p className={lbl} id="vehicle-features-label">
                    Key features
                  </p>
                  <div className="flex min-h-[36px] flex-wrap gap-2">
                    {(form.key_features ?? []).map((f, i) => (
                      <span
                        key={`${f}-${i}`}
                        className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1.5 text-sm font-semibold text-[#D4AF37]"
                      >
                        <Tag className="h-3 w-3" aria-hidden="true" />
                        {f}
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          aria-label={`Remove ${f}`}
                          className="ml-1 text-[#D4AF37]/70 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="vehicle-new-feature"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      aria-labelledby="vehicle-features-label"
                      className={`${inp} flex-1`}
                      placeholder="e.g. Sunroof, Apple CarPlay, 4WD"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      aria-label="Add feature"
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/70 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {formError && (
                  <div id="vehicle-form-error" className="mt-6 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200" role="alert">
                    {formError}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/10 bg-[#0A0A0A] p-4 sm:flex-row sm:justify-end sm:px-7 sm:py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-xl bg-[#D4AF37] px-8 py-3 text-sm font-bold text-black shadow-xl disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {saving ? 'Saving…' : initial ? 'Save changes' : 'Add vehicle'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
}

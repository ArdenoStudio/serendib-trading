import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, ImagePlus, Trash2, Tag, Plus } from 'lucide-react';
import { uploadVehicleImage, parseVehicleText, fetchDynamicKnowledge, learnFromVehicle } from '../../lib/supabase';
import { isBlobUrl } from '../../lib/images';

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

const EMPTY: VehicleFormData = {
  make:'', model:'', year: new Date().getFullYear(), price:0, mileage:0,
  fuel:'Hybrid', transmission:'Automatic', bodyType:'Sedan', color:'',
  image:'', gallery:[], condition:'Registered', is_sold:false, description:'', key_features:[],
};

const sanitizeForm = (data: VehicleFormData): VehicleFormData => ({
  ...data,
  fuel: (FUEL_OPTIONS as readonly string[]).includes(data.fuel) ? data.fuel : 'Petrol',
  transmission: (TRANSMISSION_OPTIONS as readonly string[]).includes(data.transmission) ? data.transmission : 'Automatic',
  bodyType: (BODY_TYPE_OPTIONS as readonly string[]).includes(data.bodyType) ? data.bodyType : data.bodyType || 'Sedan',
});

const inp = 'w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-white/55 focus:outline-none focus:border-[#D4AF37] transition-all [color-scheme:dark]';
const lbl = 'block text-[10px] font-black uppercase tracking-[0.2em] text-white/65 mb-1.5';

export default function VehicleModal({ initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<VehicleFormData>(sanitizeForm(initial ?? EMPTY));
  const [tab, setTab] = useState<'form'|'paste'>('form');
  const [pasteText, setPasteText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [heroPreview, setHeroPreview] = useState(initial?.image ?? '');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initial?.gallery ?? []);
  const [newFeature, setNewFeature] = useState('');
  const heroRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [dynamicKB, setDynamicKB] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchDynamicKnowledge().then(setDynamicKB);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const set = (k: keyof VehicleFormData, v: any) => setForm(f => ({ ...f, [k]: v }));

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
    } finally { setUploading(false); }
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
    setGalleryPreviews(p => p.filter((_, i) => i !== idx));
    set('gallery', (form.gallery ?? []).filter((_, i) => i !== idx));
  };

  const [parseStatus, setParseStatus] = useState('');

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
          setForm(f => sanitizeForm({ ...f, ...parsed }));
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
  const removeFeature = (i: number) => set('key_features', (form.key_features ?? []).filter((_, idx) => idx !== i));

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
      setFormError('Add a hero image before saving this vehicle.');
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
    } finally { setSaving(false); }
  };

  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 px-3 py-4 text-white sm:px-6 sm:py-8" role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title">
      <div className="flex min-h-full items-start justify-center">
      <motion.div
        initial={{ opacity:0, y:12, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:12, scale:0.98 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0A] shadow-2xl"
      >
        <button type="button" onClick={onClose} aria-label="Close vehicle form" className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/70 text-gray-500 transition-colors hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0A0A0A]/95 p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 id="vehicle-modal-title" className="text-2xl font-black uppercase tracking-tight text-balance">
                {initial ? 'Edit' : 'New'} <span className="text-[#D4AF37]">Vehicle</span>
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                {initial ? 'Modify Existing Entry' : 'Add to Inventory'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pr-12 lg:justify-end">
              {(['form','paste'] as const).map(t => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab===t ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                  {t === 'paste' ? <><Sparkles className="w-3 h-3" />Smart Fill</> : 'Manual Form'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <AnimatePresence mode="wait">
            {tab === 'paste' ? (
              <motion.div key="paste" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-4">
                <p className="text-xs text-white/65 leading-relaxed text-pretty">Paste any vehicle description, ad text, or spec sheet below. We'll auto-identify all details and fill the form for you.</p>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={12}
                  placeholder={"Toyota Land Cruiser Prado 2020\nColor: Pearl White\nMileage: 45,000 km\nFuel: Diesel\nTransmission: Automatic\nCondition: Registered\nPrice: LKR 35,000,000\n\nPristine condition, full service history..."}
                  className={inp + " resize-none font-mono text-xs leading-relaxed"}
                />
                <button onClick={handleParse} disabled={parsing || !pasteText.trim()}
                  className="px-8 py-3 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2">
                  {parsing ? parseStatus : <><Sparkles className="w-4 h-4" />Parse & Auto-Fill</>}
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div><label className={lbl}>Make</label><input required value={form.make} onChange={e=>set('make',e.target.value)} className={inp} placeholder="Toyota"/></div>
                  <div><label className={lbl}>Model</label><input required value={form.model} onChange={e=>set('model',e.target.value)} className={inp} placeholder="Land Cruiser"/></div>
                  <div><label className={lbl}>Year</label><input required type="number" value={form.year} onChange={e=>set('year',Number(e.target.value))} className={inp}/></div>
                  <div>
                    <label className={lbl}>Condition</label>
                    <select value={form.condition} onChange={e=>set('condition',e.target.value)} className={inp}>
                      {['New','Registered','Reconditioned'].map(c=><option key={c} value={c} className="bg-black text-white">{c}</option>)}
                    </select>
                  </div>
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div><label className={lbl}>Price (LKR)</label><input required type="number" value={form.price} onChange={e=>set('price',Number(e.target.value))} className={inp}/></div>
                  <div><label className={lbl}>Mileage (KM)</label><input required type="number" value={form.mileage} onChange={e=>set('mileage',Number(e.target.value))} className={inp}/></div>
                   <div>
                    <label className={lbl}>Fuel</label>
                    <select value={form.fuel} onChange={e=>set('fuel',e.target.value)} className={inp}>
                      {FUEL_OPTIONS.map(f=><option key={f} value={f} className="bg-black text-white">{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Transmission</label>
                    <select value={form.transmission} onChange={e=>set('transmission',e.target.value)} className={inp}>
                      {TRANSMISSION_OPTIONS.map(t=><option key={t} value={t} className="bg-black text-white">{t}</option>)}
                    </select>
                  </div>
                </div>
                {/* Row 3 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={lbl}>Body Type</label>
                    <select value={form.bodyType} onChange={e=>set('bodyType',e.target.value)} className={inp}>
                      {BODY_TYPE_OPTIONS.map(b=><option key={b} value={b} className="bg-black text-white">{b}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-1 lg:col-span-3"><label className={lbl}>Color</label><input value={form.color} onChange={e=>set('color',e.target.value)} className={inp} placeholder="Pearl White"/></div>
                </div>

                {/* Hero Image */}
                <div className="space-y-3">
                  <label className={lbl}>Hero Image (Main Photo)</label>
                  <div
                    onClick={() => heroRef.current?.click()}
                    className="relative group cursor-pointer rounded-2xl border-2 border-dashed border-white/10 hover:border-[#D4AF37]/50 transition-all overflow-hidden"
                    style={{ height: heroPreview ? 200 : 120 }}
                  >
                    {heroPreview ? (
                      <img src={heroPreview} alt="Hero" className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"/>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                        <Upload className="w-8 h-8"/>
                        <span className="text-[11px] font-black uppercase tracking-widest">Click to upload hero image</span>
                      </div>
                    )}
                    {heroPreview && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <span className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2"><Upload className="w-4 h-4"/>Change Image</span>
                      </div>
                    )}
                    {uploading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Uploading...</span></div>}
                  </div>
                  <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleHeroUpload(e.target.files[0]); }}/>
                  <p className="text-[10px] text-white/55">Or paste a URL directly:</p>
                  <input value={form.image} onChange={e=>{set('image',e.target.value);setHeroPreview(e.target.value);}} className={inp} placeholder="https://..."/>
                </div>

                {/* Gallery */}
                <div className="space-y-3">
                  <label className={lbl}>Gallery Images</label>
                  <div className="flex flex-wrap gap-3">
                    {galleryPreviews.map((src,i) => (
                      <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden group border border-white/10">
                        <img src={src} alt="" className="w-full h-full object-cover"/>
                        <button type="button" onClick={()=>removeGallery(i)} aria-label={`Remove gallery image ${i + 1}`} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Trash2 className="w-4 h-4 text-red-400"/>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={()=>galleryRef.current?.click()}
                      className="w-24 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-[#D4AF37]/50 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#D4AF37] transition-all">
                      <ImagePlus className="w-5 h-5"/><span className="text-[9px] uppercase font-black">Add</span>
                    </button>
                  </div>
                  <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={e=>{if(e.target.files) handleGalleryUpload(e.target.files);}}/>
                </div>

                {/* Description */}
                <div>
                  <label className={lbl}>Description</label>
                  <textarea rows={4} value={form.description} onChange={e=>set('description',e.target.value)} className={inp+' resize-none'}/>
                </div>

                {/* Key Features */}
                <div className="space-y-3">
                  <label className={lbl}>Key Features</label>
                  <div className="flex flex-wrap gap-2 min-h-[36px]">
                    {(form.key_features ?? []).map((f,i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[11px] font-bold text-[#D4AF37]">
                        <Tag className="w-3 h-3"/>{f}
                        <button type="button" onClick={()=>removeFeature(i)} aria-label={`Remove ${f}`} className="ml-1 text-[#D4AF37]/60 hover:text-red-400 transition-colors"><X className="w-3 h-3"/></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newFeature} onChange={e=>setNewFeature(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addFeature();}}}
                      className={inp+' flex-1'} placeholder="e.g. Sunroof, Apple CarPlay, 4WD..."/>
                    <button type="button" onClick={addFeature} aria-label="Add feature" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-[#D4AF37] transition-colors">
                      <Plus className="w-4 h-4"/>
                    </button>
                  </div>
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200" role="alert">
                    {formError}
                  </div>
                )}

                {/* Submit */}
                <div className="sticky bottom-0 z-10 -mx-5 -mb-5 flex flex-col-reverse gap-3 border-t border-white/10 bg-[#0A0A0A]/95 p-5 sm:-mx-8 sm:-mb-8 sm:flex-row sm:justify-end sm:p-6">
                  <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 font-black uppercase tracking-widest text-[11px] hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={saving || uploading}
                    className="px-10 py-3 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[11px] rounded-xl hover:scale-105 transition-all shadow-xl disabled:opacity-60">
                    {saving ? 'Saving...' : initial ? 'Update Vehicle' : 'Add to Inventory'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

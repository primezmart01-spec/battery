import React, { useState, useEffect } from 'react';
import { Car, Search, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface VehicleFinderProps {
  onSelectModel?: (modelId: string) => void;
  onNavigate: (route: string, param?: string) => void;
}

export const VehicleFinder: React.FC<VehicleFinderProps> = ({ onSelectModel, onNavigate }) => {
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoadingMakes, setIsLoadingMakes] = useState<boolean>(true);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/catalog/vehicles/makes')
      .then(r => r.json())
      .then(d => {
        if (d.success) setMakes(d.makes || []);
      })
      .catch(console.error)
      .finally(() => setIsLoadingMakes(false));
  }, []);

  const handleMakeChange = (makeId: string) => {
    setSelectedMake(makeId);
    setSelectedModel('');
    if (!makeId) {
      setModels([]);
      return;
    }

    setIsLoadingModels(true);
    fetch(`/api/catalog/vehicles/models?makeId=${makeId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setModels(d.models || []);
      })
      .catch(console.error)
      .finally(() => setIsLoadingModels(false));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) return;

    if (onSelectModel) {
      onSelectModel(selectedModel);
    }
    onNavigate('shop', `vehicleModelId=${selectedModel}`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded bg-red-600 text-white">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
            <span>VEHICLE BATTERY FINDER</span>
            <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
              OEM FIT GUARANTEE
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Find the exact battery size (Ah, CCA, Dimensions) recommended for your car.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Make */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Vehicle Manufacturer
          </label>
          <select
            value={selectedMake}
            onChange={e => handleMakeChange(e.target.value)}
            disabled={isLoadingMakes}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
          >
            <option value="">Select Make (e.g. Toyota, Honda)</option>
            {makes.map(m => (
              <option key={m.id} value={m.id}>
                {m.make}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Model & Engine
          </label>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            disabled={!selectedMake || isLoadingModels}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 disabled:opacity-50"
          >
            <option value="">
              {!selectedMake ? 'First select make' : isLoadingModels ? 'Loading models...' : 'Select Model'}
            </option>
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.model_name} ({m.start_year}-{m.end_year})
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={!selectedModel}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/20"
          >
            <Search className="w-4 h-4" />
            <span>FIND BATTERIES</span>
          </button>
        </div>
      </form>
    </div>
  );
};

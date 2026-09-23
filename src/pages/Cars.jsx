import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from 'react-helmet-async';
import CarCard from "../components/CarCard";
import SkeletonCard from "../components/SkeletonCard";
import { getCars } from "../services/carService";
import { resolveImageUrl } from "../utils/imageUrl";
import { FaCar, FaSearch, FaFilter, FaTimes, FaThLarge, FaList, FaSortAmountDown, FaSortAmountUp, FaClock, FaGasPump, FaCog, FaCalendarAlt, FaArrowRight, FaMoneyBillWave } from "react-icons/fa";
import Datepicker from "react-tailwindcss-datepicker";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFuel, setFilterFuel] = useState("all");
  const [filterGearbox, setFilterGearbox] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState(2000);
  const [viewMode, setViewMode] = useState("grid"); 
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [dateValue, setDateValue] = useState({
    startDate: null,
    endDate: null
  });

  const fetchCars = useCallback(async (start, end) => {
    setLoading(true);
    try {
      const params = {};
      if (start && end) {
        params.startDate = start;
        params.endDate = end;
      }
      const data = await getCars(params);
      setCars(Array.isArray(data) ? data : (data.cars || []));
    } catch (err) {
      console.error("Erreur chargement voitures", err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const bothFilled = dateValue.startDate && dateValue.endDate;
    const bothEmpty = !dateValue.startDate && !dateValue.endDate;
    if (bothFilled || bothEmpty) {
      fetchCars(dateValue.startDate, dateValue.endDate);
    }
  }, [dateValue.startDate, dateValue.endDate, fetchCars]);

  const filteredCars = useMemo(() => {
    return cars
      .filter(car => {
        const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (car.brand && car.brand.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFuel = filterFuel === "all" || car.fuel === filterFuel;
        const matchesGearbox = filterGearbox === "all" || car.gearbox === filterGearbox;
        const matchesPrice = car.price <= priceRange;
        return matchesSearch && matchesFuel && matchesGearbox && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "year-desc") return b.year - a.year;
        return 0;
      });
  }, [cars, searchTerm, filterFuel, filterGearbox, priceRange, sortBy]);

  
  const activeFilters = [];
  if (filterFuel !== "all") activeFilters.push({ key: 'fuel', label: filterFuel, clear: () => setFilterFuel("all") });
  if (filterGearbox !== "all") activeFilters.push({ key: 'gearbox', label: filterGearbox, clear: () => setFilterGearbox("all") });
  if (priceRange < 2000) activeFilters.push({ key: 'price', label: `Max ${priceRange} DH`, clear: () => setPriceRange(2000) });
  if (searchTerm) activeFilters.push({ key: 'search', label: `"${searchTerm}"`, clear: () => setSearchTerm("") });
  if (sortBy !== "default") {
    const sortLabels = { "price-asc": "Prix croissant", "price-desc": "Prix décroissant", "year-desc": "Plus récents" };
    activeFilters.push({ key: 'sort', label: sortLabels[sortBy], clear: () => setSortBy("default") });
  }

  const clearAll = () => {
    setSearchTerm("");
    setFilterFuel("all");
    setFilterGearbox("all");
    setSortBy("default");
    setPriceRange(2000);
    setDateValue({ startDate: null, endDate: null });
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#F9FAFB]">
      <Helmet>
        <title>Flotte Automobile | LocaGawa - Voitures Premium</title>
        <meta name="description" content="Découvrez notre large gamme de véhicules premium à Fès. Filtrez par prix, carburant et boîte de vitesse." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6">

        {}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EEF3FB] text-[#E3383C] rounded-full font-bold text-xs uppercase tracking-widest mb-4 border border-[#D3E0F4]"
          >
            <FaCar /> Notre Flotte
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-[#111827] mb-4 tracking-tight">
            Trouvez votre <span className="text-[#E3383C]">véhicule idéal</span>
          </h1>
          <p className="text-lg text-[#6B7280] max-w-xl mx-auto font-medium">
            {loading ? 'Chargement du catalogue...' : `${filteredCars.length} véhicule${filteredCars.length !== 1 ? 's' : ''} disponible${filteredCars.length !== 1 ? 's' : ''} à Fès`}
          </p>
        </div>

        {}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-5 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Rechercher un véhicule (nom, marque...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-[#F9FAFB] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#E3383C] focus:ring-2 focus:ring-[#E3383C]/10 outline-none text-sm font-medium transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FaTimes size={12} />
                </button>
              )}
            </div>

            {}
            <div className="lg:w-80 relative z-30">
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-[#F9FAFB] hover:border-[#E3383C] transition-colors">
                <Datepicker
                  primaryColor={"amber"}
                  value={dateValue}
                  onChange={newValue => setDateValue(newValue)}
                  displayFormat={"DD/MM/YYYY"}
                  readOnly={true}
                  placeholder="Dates de location"
                  inputClassName="w-full px-4 py-4 bg-transparent outline-none text-sm font-bold text-[#111827] cursor-pointer"
                />
              </div>
            </div>

            {}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:w-auto px-6 py-4 bg-[#0F2F75] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#0A2463] hover:shadow-xl transition-all text-sm whitespace-nowrap"
            >
              <FaFilter size={12} />
              Filtres
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 bg-[#E3383C] text-white rounded-full text-[10px] font-black flex items-center justify-center">{activeFilters.length}</span>
              )}
            </button>
          </div>
        </div>

        {}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {}
          <div className="flex items-center gap-1.5 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
            <FaGasPump className="text-gray-400 ml-3 mr-1" size={12} />
            {["all", "Essence", "Diesel", "Hybride"].map(fuel => (
              <button
                key={fuel}
                onClick={() => setFilterFuel(fuel)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterFuel === fuel
                    ? 'bg-[#0F2F75] text-white shadow-md shadow-black/10'
                    : 'text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                {fuel === "all" ? "Tous" : fuel}
              </button>
            ))}
          </div>

          {}
          <div className="flex items-center gap-1.5 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
            <FaCog className="text-gray-400 ml-3 mr-1" size={12} />
            {["all", "Manuelle", "Automatique"].map(gear => (
              <button
                key={gear}
                onClick={() => setFilterGearbox(gear)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterGearbox === gear
                    ? 'bg-[#0F2F75] text-white shadow-md shadow-black/10'
                    : 'text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                {gear === "all" ? "Toutes" : gear === "Automatique" ? "Auto" : "BVM"}
              </button>
            ))}
          </div>

          {}
          <div className="flex items-center gap-1.5 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
            {[
              { key: "default", label: "Défaut", icon: null },
              { key: "price-asc", label: "Prix croissant", icon: <FaSortAmountUp size={10} /> },
              { key: "price-desc", label: "Prix décroissant", icon: <FaSortAmountDown size={10} /> },
              { key: "year-desc", label: "Plus récents", icon: <FaClock size={10} /> },
            ].map(sort => (
              <button
                key={sort.key}
                onClick={() => setSortBy(sort.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  sortBy === sort.key
                    ? 'bg-[#0F2F75] text-white shadow-md'
                    : 'text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                {sort.icon} {sort.label}
              </button>
            ))}
          </div>

          {}
          <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm ml-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#0F2F75] text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FaThLarge size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#0F2F75] text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FaList size={14} />
            </button>
          </div>
        </div>

        {}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mr-1">Filtres actifs :</span>
              {activeFilters.map(f => (
                <motion.button
                  key={f.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={f.clear}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF3FB] text-[#E3383C] rounded-full text-xs font-bold border border-[#D3E0F4] hover:bg-[#E3EBF8] transition-all group"
                >
                  {f.label}
                  <FaTimes size={8} className="opacity-50 group-hover:opacity-100" />
                </motion.button>
              ))}
              <button
                onClick={clearAll}
                className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-2 hover:underline"
              >
                Tout effacer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-bold text-[#111827]">
            <motion.span
              key={filteredCars.length}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block text-[#E3383C] text-xl font-black mr-1"
            >
              {filteredCars.length}
            </motion.span>
            véhicule{filteredCars.length !== 1 ? 's' : ''} trouvé{filteredCars.length !== 1 ? 's' : ''}
          </p>
        </div>

        {}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-[#0F2F75]/40 backdrop-blur-sm z-40 cursor-pointer"
              />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl overflow-y-auto flex flex-col"
              >
                {}
                <div className="flex items-center justify-between p-8 pb-0">
                  <div>
                    <h3 className="text-xl font-black text-[#111827]">Filtres Avancés</h3>
                    <p className="text-xs text-[#6B7280] font-medium mt-1">{filteredCars.length} résultats</p>
                  </div>
                  <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#111827] hover:bg-gray-100 transition-all">
                    <FaTimes />
                  </button>
                </div>

                <div className="flex flex-col gap-8 p-8 flex-1">
                  {}
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
                        <FaMoneyBillWave size={10} /> Budget Maximum
                      </label>
                      <span className="text-sm font-black text-[#E3383C]">{priceRange} DH</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      step="50"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#E3383C]"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                      <span>100 DH</span>
                      <span>2000 DH</span>
                    </div>
                  </div>

                  {}
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-3">
                      <FaGasPump size={10} /> Carburant
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["all", "Essence", "Diesel", "Hybride"].map(fuel => (
                        <button
                          key={fuel}
                          onClick={() => setFilterFuel(fuel)}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                            filterFuel === fuel
                              ? 'bg-[#0F2F75] text-white border-[#E3383C] shadow-lg shadow-black/10'
                              : 'bg-gray-50 text-[#6B7280] border-gray-100 hover:border-[#E3383C]'
                          }`}
                        >
                          {fuel === "all" ? "Tous" : fuel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {}
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-3">
                      <FaCog size={10} /> Boîte de vitesse
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["all", "Manuelle", "Automatique"].map(gear => (
                        <button
                          key={gear}
                          onClick={() => setFilterGearbox(gear)}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                            filterGearbox === gear
                              ? 'bg-[#0F2F75] text-white border-[#E3383C] shadow-lg shadow-black/10'
                              : 'bg-gray-50 text-[#6B7280] border-gray-100 hover:border-[#E3383C]'
                          }`}
                        >
                          {gear === "all" ? "Toutes" : gear === "Automatique" ? "Auto" : "Manuelle"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {}
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-3">
                      Trier par
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "default", label: "Défaut" },
                        { key: "price-asc", label: "Prix croissant" },
                        { key: "price-desc", label: "Prix décroissant" },
                        { key: "year-desc", label: "Plus récents" },
                      ].map(s => (
                        <button
                          key={s.key}
                          onClick={() => setSortBy(s.key)}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                            sortBy === s.key
                              ? 'bg-[#0F2F75] text-white border-[#0F2F75]'
                              : 'bg-gray-50 text-[#6B7280] border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {}
                  <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
                    {activeFilters.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="w-full py-4 bg-gray-50 rounded-2xl text-xs font-bold text-[#6B7280] hover:bg-gray-100 transition-all"
                      >
                        Réinitialiser tous les filtres
                      </button>
                    )}
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full py-4 bg-[#0F2F75] text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:shadow-xl transition-all"
                    >
                      Voir {filteredCars.length} résultat{filteredCars.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              : "space-y-4"
            }>
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredCars.length > 0 ? (
            viewMode === 'grid' ? (
              
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCars.map((car, idx) => (
                  <motion.div
                    key={car._id || car.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                  >
                    <CarCard car={car} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              
              <div className="space-y-4">
                {filteredCars.map((car, idx) => (
                  <motion.div
                    key={car._id || car.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Link
                      to={`/cars/${car._id || car.id}`}
                      className="flex flex-col md:flex-row bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group"
                    >
                      {}
                      <div className="w-full md:w-64 h-48 md:h-auto bg-[#F9FAFB] shrink-0 overflow-hidden relative">
                        {car.image ? (
                          <img
                            src={resolveImageUrl(car.image)}
                            alt={car.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FaCar size={40} />
                          </div>
                        )}
                        {}
                        <div className="absolute top-3.5 left-3.5 z-10">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-sm ${
                            car.isAvailableNow !== false
                              ? 'bg-white/95 text-slate-800 border border-emerald-500/30'
                              : 'bg-white/95 text-slate-500 border border-slate-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${car.isAvailableNow !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {car.isAvailableNow !== false ? 'Disponible à Fès' : 'Réservé'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#E3383C] transition-colors">{car.name}</h3>
                              <p className="text-xs font-semibold text-[#8F1C20] tracking-wider">{car.brand || 'Gamme Récente'} • Fès Saïss</p>
                            </div>
                            <span className="px-3 py-1 bg-gray-50 rounded-lg text-[11px] font-semibold text-[#111827] border border-gray-100">
                              {car.gearbox === 'Automatique' ? 'Boîte Auto' : 'Manuelle'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-[#6B7280] font-medium">
                            <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-[#E3383C]" size={11} /> {car.year}</span>
                            <span className="flex items-center gap-1.5"><FaGasPump className="text-[#E3383C]" size={11} /> {car.fuel}</span>
                            <span className="flex items-center gap-1.5"><FaCog className="text-[#E3383C]" size={11} /> {car.gearbox === 'Automatique' ? 'Auto' : 'Manuelle'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">À partir de</p>
                            <p className="text-2xl font-black text-[#111827] leading-none">
                              {car.price} <span className="text-xs font-bold text-[#E3383C]">DH / jour</span>
                            </p>
                            <p className="text-[10px] text-emerald-600 font-medium mt-1">Assurance tous risques incluse</p>
                          </div>
                          <span className="flex items-center gap-2 px-5 py-2.5 bg-[#0F2F75] text-white rounded-xl font-bold text-xs hover:bg-[#E3383C] hover:text-white hover:shadow-lg transition-all">
                            Réserver <FaArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-[32px] border border-dashed border-gray-200"
            >
              <div className="w-20 h-20 bg-[#EEF3FB] rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FaCar className="text-[#E3383C]/40" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#111827] mb-2">Aucun véhicule trouvé</h3>
              <p className="text-[#6B7280] mb-8">Essayez de modifier vos filtres ou vos dates de recherche.</p>
              {activeFilters.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-8 py-4 bg-[#0F2F75] text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
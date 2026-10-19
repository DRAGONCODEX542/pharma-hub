import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  UserCheck,
  ChevronRight,
  ArrowRight,
  X,
  Sparkles,
  Printer,
  RotateCcw,
  Pill
} from 'lucide-react';

export default function SoloPOS({
  drugs = [],
  currency = 'KSh',
  onCompleteSale,
  isSubmitting = false,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash', 'mpesa', 'credit'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [justAddedId, setJustAddedId] = useState(null);

  // Categories
  const categories = ['All', 'OTC', 'Prescription', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Cough & Cold'];

  // Filtered Drugs with robust property fallbacks
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      const name = (drug.brand_name || drug.name || '').toLowerCase();
      const generic = (drug.molecule_name || drug.generic_name || '').toLowerCase();
      const code = (drug.barcode || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || generic.includes(q) || code.includes(q);

      const cat = (drug.category || '').toLowerCase();
      const matchesCat =
        selectedCategory === 'All' ||
        cat === selectedCategory.toLowerCase() ||
        (selectedCategory === 'OTC' && (cat === 'otc' || !drug.is_prescription_required)) ||
        (selectedCategory === 'Prescription' && (cat === 'prescription' || drug.is_prescription_required));

      return matchesSearch && matchesCat;
    });
  }, [drugs, searchQuery, selectedCategory]);

  // Cart Calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Active step: 1: Pick Drug, 2: Choose Qty, 3: Ready to Finish
  const currentStep = useMemo(() => {
    if (cart.length === 0) return 1;
    if (paymentMode === 'credit' && (!customerName || !customerPhone)) return 2;
    return 3;
  }, [cart, paymentMode, customerName, customerPhone]);

  // Add Item to Cart
  const handleAddToCart = (drug, unitType = 'pack') => {
    let unitPrice = drug.pack_price || drug.box_price || drug.unit_price || 0;
    if (unitType === 'strip' && drug.strip_price) unitPrice = drug.strip_price;
    if (unitType === 'unit' && drug.unit_price) unitPrice = drug.unit_price;

    const drugName = drug.brand_name || drug.name || 'Medicine';
    const drugDosage = drug.strength || drug.dosage || '';
    const stockAvailable = drug.total_packs ?? drug.stock_boxes ?? 999;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.drugId === drug.id && item.unitType === unitType
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      } else {
        return [
          ...prev,
          {
            drugId: drug.id,
            name: drugName,
            dosage: drugDosage,
            unitType,
            unitPrice,
            quantity: 1,
            maxStock: stockAvailable
          }
        ];
      }
    });

    setJustAddedId(drug.id);
    setTimeout(() => setJustAddedId(null), 300);
  };

  const handleUpdateQuantity = (index, delta) => {
    setCart((prev) => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index].quantity = newQty;
      }
      return copy;
    });
  };

  const handleRemoveItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  // Submit Sale Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      if (showToast) showToast('Please select at least one medicine', 'error');
      return;
    }

    if (paymentMode === 'credit' && (!customerName.trim() || !customerPhone.trim())) {
      if (showToast) showToast('Customer name and phone number required for credit loan', 'error');
      return;
    }

    const payload = {
      customer_name: customerName.trim() || 'Walk-in Patient',
      customer_phone: customerPhone.trim() || '',
      payment_method: paymentMode,
      items: cart.map((item) => ({
        drug_id: item.drugId,
        unit_type: item.unitType,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        drug_name: item.name
      })),
      discount: 0,
      is_credit_loan: paymentMode === 'credit'
    };

    try {
      const result = await onCompleteSale(payload);
      if (result && result.success) {
        setCompletedReceipt({
          receiptNumber: result.receipt_number || result.sale_id || `PH-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          items: [...cart],
          total: cartTotal,
          paymentMethod: paymentMode,
          customerName: customerName.trim() || 'Walk-in Patient',
          customerPhone: customerPhone.trim() || ''
        });
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setMobileCartOpen(false);
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Checkout failed', 'error');
    }
  };

  return (
    <div className="min-h-full pb-28 lg:pb-12 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. APPLE STEP NAVIGATION BAR */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-3 sm:p-4 rounded-3xl border border-white/80 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none py-0.5">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
            currentStep === 1
              ? 'bg-emerald-600 text-white shadow-sm font-bold scale-102'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
          }`}>
            <span className="w-4.5 h-4.5 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-black">1</span>
            <span>Tap Medicine</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
            currentStep === 2
              ? 'bg-emerald-600 text-white shadow-sm font-bold scale-102'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
          }`}>
            <span className="w-4.5 h-4.5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">2</span>
            <span>Choose Qty</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-50 shrink-0" />

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
            currentStep === 3
              ? 'bg-emerald-600 text-white shadow-sm font-bold scale-102'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
          }`}>
            <span className="w-4.5 h-4.5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">3</span>
            <span>Finish & Pay</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
            {drugs.length} medicines in inventory
          </span>
          <button
            onClick={() => setMobileCartOpen(true)}
            className="lg:hidden ml-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm active:scale-95 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Cart ({totalItemsCount})</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Search & Apple iOS Drug Widgets (8 cols)    */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* iOS Liquid Glass Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name, generic formula, or barcode..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm sm:text-base font-medium
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl
                border border-black/[0.06] dark:border-white/[0.08]
                text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* iOS Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs scale-102'
                    : 'bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-black/[0.04] dark:border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Apple iOS Drug Bento Cards Grid */}
          {filteredDrugs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.06]">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl">
                🔍
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No medicines found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try searching for another medicine or generic formula.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredDrugs.map((drug) => {
                const displayName = drug.brand_name || drug.name || 'Unnamed Drug';
                const genericFormula = drug.molecule_name || drug.generic_name || drug.therapeutic_class || '';
                const dosage = drug.strength || drug.dosage || drug.dosage_form || '';
                const stockAvailable = drug.total_packs ?? drug.stock_boxes ?? 0;
                const looseUnits = drug.total_loose_units ?? drug.stock_loose ?? 0;
                const isOutOfStock = stockAvailable <= 0 && looseUnits <= 0;
                const isLowStock = stockAvailable > 0 && stockAvailable <= 5;
                const isJustAdded = justAddedId === drug.id;
                const price = drug.pack_price || drug.box_price || drug.unit_price || 0;

                return (
                  <div
                    key={drug.id}
                    onClick={() => !isOutOfStock && handleAddToCart(drug, 'pack')}
                    className={`group relative rounded-3xl p-4.5 cursor-pointer select-none transition-all duration-200 
                      bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl
                      border border-black/[0.06] dark:border-white/[0.08]
                      hover:-translate-y-1 hover:shadow-lg hover:border-emerald-500/40 dark:hover:border-emerald-500/40
                      active:scale-[0.98] ${
                        isJustAdded ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                      } ${isOutOfStock ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    {/* Top Pill Tags (iOS Style) */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        drug.category === 'Prescription' || drug.is_prescription_required
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}>
                        {drug.category || (drug.is_prescription_required ? 'Prescription' : 'OTC')}
                      </span>

                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOutOfStock
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          : isLowStock
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        {isOutOfStock ? 'Out of stock' : `${stockAvailable} in stock`}
                      </span>
                    </div>

                    {/* Drug Name & Dosage */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {displayName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 mb-3 font-medium">
                      {genericFormula ? `${genericFormula}${dosage ? ` • ${dosage}` : ''}` : dosage || 'Standard Pack'}
                    </p>

                    {/* Price & Add Button */}
                    <div className="flex items-end justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-tight block">
                          Price
                        </span>
                        <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                          {currency} {Number(price).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) handleAddToCart(drug, 'pack');
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${
                          isOutOfStock
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Floating Apple Liquid Glass Smart Cart     */}
        {/* ======================================================== */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-6">
          <div className="rounded-3xl p-5 bg-white/85 dark:bg-[#0f141c]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xl space-y-4">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Smart Cart</h2>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {totalItemsCount} item{totalItemsCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-[11px] font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-3xl mb-2 opacity-40">🛒</div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cart is empty</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Tap any medicine to add to order
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`${item.drugId}-${item.unitType}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {currency} {item.unitPrice.toLocaleString()} × {item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(idx, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(idx, 1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 transition ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Payment Methods */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight block">
                Payment Method
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-2.5 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                    paymentMode === 'cash'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('mpesa')}
                  className={`py-2.5 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                    paymentMode === 'mpesa'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>M-Pesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('credit')}
                  className={`py-2.5 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                    paymentMode === 'credit'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Credit</span>
                </button>
              </div>

              {/* Patient Loan Details */}
              {paymentMode === 'credit' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Customer Credit Details</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Customer Name (required)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Customer Phone (e.g. 0712345678)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Total & Complete Sale */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Payable</span>
                  <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {currency} {cartTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={cart.length === 0 || isSubmitting}
                  onClick={handleCheckout}
                  className={`w-full py-3.5 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-150 ${
                    cart.length === 0 || isSubmitting
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] shadow-emerald-600/25 cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Processing Sale...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Sale ({currency} {cartTotal.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={() => setMobileCartOpen(true)}
          className="w-full py-3.5 px-5 rounded-full flex items-center justify-between shadow-2xl
            bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm
            active:scale-[0.98] transition-all backdrop-blur-xl border border-white/20"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">
              {totalItemsCount}
            </div>
            <span>Review Order</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-black">
              {currency} {cartTotal.toLocaleString()}
            </span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 4. MOBILE CART DRAWER */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-h-[85vh] rounded-t-3xl p-5 bg-white dark:bg-slate-900 border-t border-white/20 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                Cart Items ({totalItemsCount})
              </h3>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Cart is empty</div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`m-${item.drugId}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {currency} {item.unitPrice} × {item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(idx, -1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(idx, 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-2 rounded-xl text-xs font-bold text-center ${
                    paymentMode === 'cash'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('mpesa')}
                  className={`py-2 rounded-xl text-xs font-bold text-center ${
                    paymentMode === 'mpesa'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  M-Pesa
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('credit')}
                  className={`py-2 rounded-xl text-xs font-bold text-center ${
                    paymentMode === 'credit'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Credit
                </button>
              </div>

              {paymentMode === 'credit' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Customer Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-full bg-emerald-600 text-white font-bold text-sm shadow-md"
              >
                Complete Sale ({currency} {cartTotal.toLocaleString()})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. THERMAL RECEIPT MODAL */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-white/20 shadow-2xl text-center space-y-4">
            
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl">
              ✓
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">Sale Completed Successfully!</h3>
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Receipt #:</span>
                <span className="font-bold">{completedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span>{completedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="uppercase font-bold text-emerald-600">{completedReceipt.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                <span>Total Paid:</span>
                <span className="text-emerald-600">{currency} {completedReceipt.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setCompletedReceipt(null)}
                className="flex-1 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                Next Customer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

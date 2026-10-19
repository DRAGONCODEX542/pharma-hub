import React, { useState, useMemo, useEffect } from 'react';
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
  Phone,
  Printer,
  RotateCcw
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

  // Filtered Drugs
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        drug.name?.toLowerCase().includes(q) ||
        drug.generic_name?.toLowerCase().includes(q) ||
        drug.brand_name?.toLowerCase().includes(q) ||
        drug.barcode?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'All' ||
        drug.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'OTC' && drug.category === 'OTC') ||
        (selectedCategory === 'Prescription' && (drug.category === 'Prescription' || drug.prescription_required));

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

  // Current active step calculation for 9-year-old step guidance
  const currentStep = useMemo(() => {
    if (cart.length === 0) return 1; // 1. Pick medicine
    if (paymentMode === 'credit' && (!customerName || !customerPhone)) return 2; // 2. Add details
    return 3; // 3. Ready to tap pay
  }, [cart, paymentMode, customerName, customerPhone]);

  // Add Item to Cart (Default 1 Box or 1 Unit)
  const handleAddToCart = (drug, unitType = 'box') => {
    let unitPrice = drug.box_price || drug.unit_price || 0;
    if (unitType === 'strip' && drug.strip_price) unitPrice = drug.strip_price;
    if (unitType === 'tablet' && drug.unit_price) unitPrice = drug.unit_price;

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
            name: drug.name,
            dosage: drug.dosage || '',
            unitType,
            unitPrice,
            quantity: 1,
            maxStock: drug.stock_boxes || 999
          }
        ];
      }
    });

    // Quick visual feedback bounce
    setJustAddedId(drug.id);
    setTimeout(() => setJustAddedId(null), 400);
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
    if (cart.length === 0) return;
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  // Submit Sale Handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      if (showToast) showToast('Please add at least one medicine to the cart', 'error');
      return;
    }

    if (paymentMode === 'credit' && (!customerName.trim() || !customerPhone.trim())) {
      if (showToast) showToast('Customer Name and Phone Number are required for Credit Loans', 'error');
      return;
    }

    const payload = {
      customer_name: customerName.trim() || 'Walk-in Customer',
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
          receiptNumber: result.sale_id || result.id || `PH-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          items: [...cart],
          total: cartTotal,
          paymentMethod: paymentMode,
          customerName: customerName.trim() || 'Walk-in Customer',
          customerPhone: customerPhone.trim() || ''
        });
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setMobileCartOpen(false);
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to complete sale', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-28 lg:pb-12 bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. TOP STEP GUIDANCE BAR (Child-Simple Apple Header) */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f141c]/80 backdrop-blur-2xl border-b border-black/[0.05] dark:border-white/[0.08] px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Active Step Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-semibold">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              currentStep === 1
                ? 'bg-emerald-600 text-white shadow-xs scale-102 font-bold'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">1</span>
              <span>Tap Medicine</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              currentStep === 2
                ? 'bg-emerald-600 text-white shadow-xs scale-102 font-bold'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">2</span>
              <span>Choose Qty</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              currentStep === 3
                ? 'bg-emerald-600 text-white shadow-xs scale-102 font-bold'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">3</span>
              <span>Finish & Pay</span>
            </div>
          </div>

          {/* Quick Stats or Cart Badge on Mobile */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              {drugs.length} medicines available
            </span>
            <button
              onClick={() => setMobileCartOpen(true)}
              className="lg:hidden ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart ({totalItemsCount})</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. MAIN BODY (Desktop 2-Column Split / Mobile Single Column) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Clean Search & Medicine Cards (7 or 8 cols) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            
            {/* Search Input Bar (Big, Uncluttered, Apple Glass) */}
            <div className="relative">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine name, generic formula, or scan barcode..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl text-sm sm:text-base font-medium
                  bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl
                  border border-black/[0.07] dark:border-white/[0.1]
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

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-xs scale-102'
                      : 'bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-black/[0.04] dark:border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Medicine Cards Grid (Clean, High Contrast, Tactile) */}
            {filteredDrugs.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.06]">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl">
                  🔍
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No medicines found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Try searching for another generic or brand name.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredDrugs.map((drug) => {
                  const isLowStock = (drug.stock_boxes || 0) <= 5;
                  const isOutOfStock = (drug.stock_boxes || 0) === 0 && (drug.stock_loose || 0) === 0;
                  const isJustAdded = justAddedId === drug.id;

                  return (
                    <div
                      key={drug.id}
                      onClick={() => !isOutOfStock && handleAddToCart(drug, 'box')}
                      className={`group relative rounded-2xl p-4.5 cursor-pointer select-none transition-all duration-200 
                        bg-white/80 dark:bg-slate-900/75 backdrop-blur-xl
                        border border-black/[0.06] dark:border-white/[0.08]
                        hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40
                        active:scale-[0.98] ${
                          isJustAdded ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                        } ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          drug.category === 'Prescription' || drug.prescription_required
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        }`}>
                          {drug.category || 'OTC'}
                        </span>

                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          isOutOfStock
                            ? 'text-red-500 dark:text-red-400'
                            : isLowStock
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          {isOutOfStock ? 'Out of stock' : `${drug.stock_boxes || 0} in stock`}
                        </span>
                      </div>

                      {/* Drug Name & Dosage */}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {drug.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                        {drug.generic_name || drug.dosage || 'Standard Pack'}
                      </p>

                      {/* Price & Quick Add Button */}
                      <div className="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight block">
                            Price
                          </span>
                          <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                            {currency} {(drug.box_price || drug.unit_price || 0).toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOutOfStock) handleAddToCart(drug, 'box');
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
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
          {/* RIGHT COLUMN: Floating Apple Smart Cart (Desktop)        */}
          {/* ======================================================== */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20">
            <div className="rounded-3xl p-5 bg-white/85 dark:bg-[#0f141c]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-lg space-y-4">
              
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
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
              <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {cart.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="text-3xl mb-2 opacity-50">🛒</div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cart is empty</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Tap any medicine on the left to add
                    </p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={`${item.drugId}-${item.unitType}-${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {currency} {item.unitPrice.toLocaleString()} × {item.quantity}
                        </span>
                      </div>

                      {/* Stepper Buttons */}
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

              {/* Payment Methods (Step 3) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block">
                  Select Payment Method
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cash')}
                    className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                      paymentMode === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('mpesa')}
                    className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                      paymentMode === 'mpesa'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('credit')}
                    className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                      paymentMode === 'credit'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Credit Loan</span>
                  </button>
                </div>

                {/* Patient Loan Details (Only when Credit is chosen) */}
                {paymentMode === 'credit' && (
                  <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Customer Credit Loan Details</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Customer Full Name (required)"
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

                {/* Total & Checkout CTA Button */}
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
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all duration-150 ${
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
      </div>

      {/* ======================================================== */}
      {/* 3. MOBILE STICKY BOTTOM PILL BAR (Morphs for Phone Screen) */}
      {/* ======================================================== */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={() => setMobileCartOpen(true)}
          className="w-full py-3.5 px-5 rounded-2xl flex items-center justify-between shadow-xl
            bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm
            active:scale-[0.98] transition-all backdrop-blur-xl border border-white/20"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs">
              {totalItemsCount}
            </div>
            <span>Cart Total</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-black">
              {currency} {cartTotal.toLocaleString()}
            </span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 4. MOBILE CART DRAWER (Slide-Up iOS Modal Sheet)          */}
      {/* ======================================================== */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-h-[85vh] rounded-t-3xl p-5 bg-white dark:bg-slate-900 border-t border-white/20 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Drawer Drag Bar */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                Review Your Cart ({totalItemsCount})
              </h3>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Items List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Cart is empty</div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`m-${item.drugId}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
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

            {/* Mobile Payment Selector */}
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
                className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md"
              >
                Complete Sale ({currency} {cartTotal.toLocaleString()})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. RECEIPT MODAL (Clean Apple Thermal Receipt)           */}
      {/* ======================================================== */}
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
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setCompletedReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
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

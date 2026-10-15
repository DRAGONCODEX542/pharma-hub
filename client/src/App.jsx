import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Boxes,
  Receipt,
  Settings,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Tag,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Phone,
  Percent,
  X,
  RefreshCw,
  QrCode,
  HandCoins,
  MessageCircle,
  Globe,
  ExternalLink,
  UserCheck,
  Send,
  LogIn,
  LogOut,
  User,
  KeyRound
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'dashboard', 'inventory', 'batches', 'loans', 'sales', 'settings'
  const [settings, setSettings] = useState({
    pharmacy_name: 'HealthFirst Pharmacy',
    currency_symbol: 'KSh',
    tax_rate: '0',
    expiry_warning_days: '90',
    address: '104 Healthcare Boulevard',
    phone: '+254 700 123456',
    detected_country: 'Kenya'
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pharmahub_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDemoGuest, setIsDemoGuest] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    pharmacy_name: '',
    phone: '',
    currency_symbol: 'KSh'
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [molecules, setMolecules] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Auto-detected locale info
  const [detectedLocale, setDetectedLocale] = useState({ country: 'Kenya', currency: 'KSh', timezone: '' });

  // POS State
  const [cart, setCart] = useState([]);
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('All');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [prescriptionNumber, setPrescriptionNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'card', 'insurance', 'mobile_money', 'loan'
  const [discountAmount, setDiscountAmount] = useState(0);

  // Loan specific POS fields
  const [loanPromiseDate, setLoanPromiseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [loanNotes, setLoanNotes] = useState('');

  // Modals
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [selectedForAlternative, setSelectedForAlternative] = useState(null);
  const [alternativesData, setAlternativesData] = useState(null);
  const [marketBenchmarkData, setMarketBenchmarkData] = useState(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [activeAltSubTab, setActiveAltSubTab] = useState('inventory'); // 'inventory' or 'market'

  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // Repayment Modal
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMethod, setRepayMethod] = useState('cash');
  const [repayNotes, setRepayNotes] = useState('');

  // Direct Loan Modal
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [newLoanForm, setNewLoanForm] = useState({
    customer_name: '',
    customer_phone: '',
    national_id_or_notes: '',
    total_amount: '',
    promise_date: '',
    items_summary: ''
  });

  // Standalone Market Price Checker Search
  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [standaloneMarketData, setStandaloneMarketData] = useState(null);

  // Form states
  const [newMedForm, setNewMedForm] = useState({
    brand_name: '',
    molecule_id: '',
    brand_tier: 'generic',
    manufacturer: '',
    strength: '',
    dosage_form: 'Tablet',
    barcode: '',
    category: 'OTC',
    is_prescription_required: false,
    unit_name: 'Pill',
    units_per_pack: 100,
    units_per_strip: 10,
    pack_price: '',
    strip_price: '',
    unit_price: '',
    insurance_pack_price: '',
    wholesale_pack_price: '',
    min_stock_alert: 10,
    notes: '',
    batch_number: '',
    supplier: '',
    cost_price_per_pack: '',
    packs_received: '',
    expiry_date: ''
  });

  const [newBatchForm, setNewBatchForm] = useState({
    medicine_id: '',
    batch_number: '',
    supplier: '',
    cost_price_per_pack: '',
    packs_received: '',
    manufacture_date: '',
    expiry_date: ''
  });

  const curr = settings.currency_symbol || 'KSh';

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Automatic Location & Currency Detection
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      let detectedCountry = 'Kenya';
      let detectedCurrency = 'KSh';

      if (tz.includes('Nairobi') || tz.includes('Africa/Nairobi') || tz.includes('Kenya')) {
        detectedCountry = 'Kenya';
        detectedCurrency = 'KSh';
      } else if (tz.includes('America') || tz.includes('US') || tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles')) {
        detectedCountry = 'United States';
        detectedCurrency = '$';
      } else if (tz.includes('London') || tz.includes('Europe/London')) {
        detectedCountry = 'United Kingdom';
        detectedCurrency = '£';
      } else if (tz.includes('Lagos') || tz.includes('Nigeria')) {
        detectedCountry = 'Nigeria';
        detectedCurrency = '₦';
      } else if (tz.includes('Kolkata') || tz.includes('India')) {
        detectedCountry = 'India';
        detectedCurrency = '₹';
      } else if (tz.includes('Europe')) {
        detectedCountry = 'Europe';
        detectedCurrency = '€';
      }

      setDetectedLocale({ country: detectedCountry, currency: detectedCurrency, timezone: tz });
    } catch (e) {
      console.warn('Auto-detect locale failed', e);
    }
  }, []);

  // Authenticated fetch helper
  const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('pharmahub_token');
    const headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  };

  // Initial Data Fetching
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resSettings, resDash, resMeds, resMols, resSales, resLoans] = await Promise.all([
        authFetch('/api/settings').then(r => r.json()),
        authFetch('/api/dashboard').then(r => r.json()),
        authFetch('/api/medicines').then(r => r.json()),
        authFetch('/api/molecules').then(r => r.json()),
        authFetch('/api/sales').then(r => r.json()),
        authFetch('/api/loans').then(r => r.json())
      ]);
      setSettings(resSettings);
      setDashboardData(resDash);
      setMedicines(resMeds);
      setMolecules(resMols);
      setSalesHistory(resSales);
      setLoans(resLoans);
    } catch (err) {
      console.error(err);
      showToast('Error connecting to pharmacy server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered medicines for POS
  const filteredMeds = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch =
        m.brand_name.toLowerCase().includes(posSearch.toLowerCase()) ||
        m.molecule_name.toLowerCase().includes(posSearch.toLowerCase()) ||
        (m.barcode && m.barcode.includes(posSearch)) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(posSearch.toLowerCase()));

      const matchCat = posCategory === 'All' || m.category === posCategory;
      return matchSearch && matchCat;
    });
  }, [medicines, posSearch, posCategory]);

  // Handle Brand vs Generic Alternatives Lookup + Web Market Benchmark
  const handleOpenAlternatives = async (medicine) => {
    try {
      setSelectedForAlternative(medicine);
      setActiveAltSubTab('inventory');
      setBenchmarkLoading(true);
      setShowAlternativeModal(true);

      const [altRes, marketRes] = await Promise.all([
        fetch(`/api/medicines/${medicine.id}/alternatives`).then(r => r.json()),
        fetch(`/api/market-prices?q=${encodeURIComponent(medicine.molecule_name || medicine.brand_name)}`).then(r => r.json())
      ]);

      setAlternativesData(altRes);
      setMarketBenchmarkData(marketRes);
    } catch (err) {
      showToast('Failed to load alternative or market pricing data', 'error');
    } finally {
      setBenchmarkLoading(false);
    }
  };

  // Search Standalone Market Price
  const handleSearchMarket = async (e) => {
    e?.preventDefault();
    if (!marketSearchQuery.trim()) return;
    try {
      setBenchmarkLoading(true);
      const res = await fetch(`/api/market-prices?q=${encodeURIComponent(marketSearchQuery.trim())}`).then(r => r.json());
      setStandaloneMarketData(res);
    } catch (err) {
      showToast('Market search failed', 'error');
    } finally {
      setBenchmarkLoading(false);
    }
  };

  // Add Item to POS Cart
  const addToCart = (med, unitType = 'pack', customPrice = null) => {
    let unitPrice = med.pack_price;
    if (unitType === 'strip') unitPrice = med.strip_price || (med.pack_price / (med.units_per_pack / (med.units_per_strip || 10))).toFixed(2);
    if (unitType === 'unit') unitPrice = med.unit_price;
    if (customPrice !== null) unitPrice = customPrice;

    setCart(prev => {
      const existing = prev.find(item => item.medicine_id === med.id && item.unit_type === unitType);
      if (existing) {
        return prev.map(item =>
          item.medicine_id === med.id && item.unit_type === unitType
            ? { ...item, quantity: item.quantity + 1, total_price: ((item.quantity + 1) * Number(unitPrice)).toFixed(2) }
            : item
        );
      }
      return [
        ...prev,
        {
          medicine_id: med.id,
          brand_name: med.brand_name,
          molecule_name: med.molecule_name,
          strength: med.strength,
          dosage_form: med.dosage_form,
          brand_tier: med.brand_tier,
          unit_type: unitType,
          unit_name: med.unit_name || 'Unit',
          quantity: 1,
          unit_price: Number(unitPrice),
          total_price: Number(unitPrice).toFixed(2),
          dosage_instruction: '1 dose as directed'
        }
      ];
    });
  };

  // Switch cart item to alternative generic
  const switchCartItem = (oldMedId, newMed) => {
    setCart(prev => {
      const target = prev.find(item => item.medicine_id === oldMedId);
      if (!target) return prev;
      const unitType = target.unit_type;
      let newPrice = newMed.pack_price;
      if (unitType === 'strip') newPrice = newMed.strip_price || (newMed.pack_price / 10).toFixed(2);
      if (unitType === 'unit') newPrice = newMed.unit_price;

      return prev.map(item =>
        item.medicine_id === oldMedId
          ? {
              ...item,
              medicine_id: newMed.id,
              brand_name: newMed.brand_name,
              brand_tier: newMed.brand_tier,
              unit_price: Number(newPrice),
              total_price: (item.quantity * Number(newPrice)).toFixed(2)
            }
          : item
      );
    });
    setShowAlternativeModal(false);
    showToast(`Switched to ${newMed.brand_name} (Saved money!)`, 'success');
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + Number(item.total_price), 0);
  const cartTotal = Math.max(0, cartSubtotal - Number(discountAmount));

  // Checkout Handler (Supports Cash, Card, Insurance, M-Pesa, AND Credit/Loan)
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    if (paymentMethod === 'loan') {
      if (!customerName.trim()) {
        showToast('Please enter the customer name for the credit/loan record', 'error');
        return;
      }
      if (!customerPhone.trim()) {
        showToast('Please enter customer phone number so reminders can be sent', 'error');
        return;
      }
      if (!loanPromiseDate) {
        showToast('Please select the promised payment date', 'error');
        return;
      }
    }

    try {
      const payload = {
        customer_name: customerName.trim() || 'Walk-in Patient',
        customer_phone: customerPhone.trim(),
        payment_method: paymentMethod,
        prescribing_doctor: prescribingDoctor.trim(),
        prescription_number: prescriptionNumber.trim(),
        discount: Number(discountAmount),
        items: cart,
        promise_date: loanPromiseDate,
        loan_notes: loanNotes
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        if (paymentMethod === 'loan') {
          showToast(`Credit Recorded! Promised by ${loanPromiseDate}`, 'success');
        } else {
          showToast(`Sale completed! Receipt #${data.receipt_number}`, 'success');
        }

        // Fetch full receipt details
        const receiptDetails = await fetch(`/api/sales/${data.sale_id}`).then(r => r.json());
        setCurrentReceipt(receiptDetails);
        setShowReceiptModal(true);

        // Reset cart & reload data
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setPrescribingDoctor('');
        setPrescriptionNumber('');
        setLoanNotes('');
        setDiscountAmount(0);
        fetchAllData();
      } else {
        showToast(data.error || 'Sale failed', 'error');
      }
    } catch (err) {
      showToast('Network error during checkout', 'error');
    }
  };

  // User Auth Handlers
  const handleLogin = async (e) => {
    e?.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pharmahub_user', JSON.stringify(data.user));
        localStorage.setItem('pharmahub_token', data.token);
        setCurrentUser(data.user);
        setIsDemoGuest(false);
        setShowAuthModal(false);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        fetchAllData();
      } else {
        showToast(data.error || 'Login failed', 'error');
      }
    } catch (err) {
      showToast('Error logging in', 'error');
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pharmahub_user', JSON.stringify(data.user));
        localStorage.setItem('pharmahub_token', data.token);
        setCurrentUser(data.user);
        setIsDemoGuest(false);
        setShowAuthModal(false);
        showToast(`Account created for ${data.user.pharmacy_name}!`, 'success');
        fetchAllData();
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Error creating account', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pharmahub_user');
    localStorage.removeItem('pharmahub_token');
    setCurrentUser(null);
    setIsDemoGuest(false);
    showToast('Signed out. See you next time!', 'success');
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const payload = credentialResponse.credential
        ? { credential: credentialResponse.credential }
        : { email: credentialResponse.email, name: credentialResponse.name, picture: credentialResponse.picture };

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pharmahub_user', JSON.stringify(data.user));
        localStorage.setItem('pharmahub_token', data.token);
        setCurrentUser(data.user);
        setIsDemoGuest(false);
        setShowAuthModal(false);
        showToast(`Welcome${data.user.name ? ', ' + data.user.name.split(' ')[0] : ''}! 🎉`, 'success');
        fetchAllData();
      } else {
        showToast(data.error || 'Google sign-in failed', 'error');
      }
    } catch (err) {
      showToast('Google sign-in error', 'error');
    }
  };

  const triggerGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const email = window.prompt("Enter your Google email address to sign in:");
            if (email && email.includes('@')) {
              handleGoogleLogin({ email: email.trim(), name: email.split('@')[0] });
            }
          }
        });
        return;
      } catch (e) {
        // Fall back below
      }
    }
    const email = window.prompt("Enter your Google email address to sign in:");
    if (email && email.includes('@')) {
      handleGoogleLogin({ email: email.trim(), name: email.split('@')[0] });
    }
  };

  // Record Repayment
  const handleRecordRepayment = async (e) => {
    e.preventDefault();
    if (!selectedLoanForRepayment) return;
    try {
      const res = await fetch(`/api/loans/${selectedLoanForRepayment.id}/repayments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: repayAmount,
          payment_method: repayMethod,
          notes: repayNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment of ${curr}${repayAmount} recorded!`, 'success');
        setShowRepaymentModal(false);
        setRepayAmount('');
        setRepayNotes('');
        fetchAllData();
      } else {
        showToast(data.error || 'Payment failed', 'error');
      }
    } catch (err) {
      showToast('Error recording repayment', 'error');
    }
  };

  // Add Medicine Form Submit
  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newMedForm,
        initial_batch: newMedForm.batch_number ? {
          batch_number: newMedForm.batch_number,
          supplier: newMedForm.supplier,
          cost_price_per_pack: newMedForm.cost_price_per_pack,
          packs_received: newMedForm.packs_received,
          expiry_date: newMedForm.expiry_date
        } : null
      };

      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Medicine created successfully', 'success');
        setShowAddMedicineModal(false);
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch (err) {
      showToast('Error creating medicine', 'error');
    }
  };

  // Add Batch Submit
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatchForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Stock batch added successfully', 'success');
        setShowAddBatchModal(false);
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to add batch', 'error');
      }
    } catch (err) {
      showToast('Error saving batch', 'error');
    }
  };

  // Update Settings Submit
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      showToast('Error saving settings', 'error');
    }
  };

  const overdueLoansCount = loans.filter(l => l.is_overdue).length;

  // GUEST WELCOME & SIGN-IN PAGE
  if (!currentUser && !isDemoGuest) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-sm font-semibold transition-all transform animate-bounce ${
              notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        )}

        <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black">
                <Pill className="w-6 h-6 transform -rotate-45" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  PharmaHub
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Free Cloud OS</span>
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block">Smart Brand vs Generic Dispensing & Credit Tracker</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsDemoGuest(true)}
                className="text-xs font-semibold px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                Explore Demo Mode
              </button>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs font-semibold px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-sm shadow-emerald-600/30"
              >
                {authMode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Smart Pharmacy POS & Inventory Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Dispense smarter. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Compare generics. Save customers money.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              PharmaHub equips community pharmacies with 3-tier brand vs generic price intelligence, FEFO expiry safety, and patient trust loans with 1-click WhatsApp reminders.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Brand vs Generic Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compare originator, branded generic, and pure generic options with live profit margins and customer savings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">FEFO Expiry Safety</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  First-Expiring First-Out tracking alerts you 90 days before expiry and automatically allocates the oldest batch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">WhatsApp Loan Reminders</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track customer debt and send polite, one-click WhatsApp & SMS payment reminders deep-linked directly.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Auto Currency & Cloud Sync</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Auto-detects your local currency ({detectedLocale.currency} in {detectedLocale.country}) and runs on PC, tablet, or Android.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Free Forever</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Card Required</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Pre-built Essential Catalog</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/70 border border-slate-100">
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
                    authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
                    authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {authMode === 'login' ? 'Welcome back, Pharmacist' : 'Set up your free pharmacy'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {authMode === 'login'
                    ? 'Enter your credentials or use Google to continue'
                    : 'Your clean template is pre-loaded with essential medicines'}
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={triggerGoogleSignIn}
                className="w-full py-3 px-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-semibold text-sm text-slate-700 rounded-2xl flex items-center justify-center space-x-3 transition shadow-sm mb-4"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">or email</span>
                </div>
              </div>

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Faith Mwangi"
                        value={authForm.name}
                        onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pharmacy / Chemist Name</label>
                      <input
                        type="text"
                        required
                        placeholder="CarePoint Community Pharmacy"
                        value={authForm.pharmacy_name}
                        onChange={e => setAuthForm(f => ({ ...f, pharmacy_name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="pharmacist@example.com"
                    value={authForm.email}
                    onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder={authMode === 'register' ? 'Choose a secure password' : 'Enter your password'}
                    value={authForm.password}
                    onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  />
                </div>

                {authMode === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                      <select
                        value={authForm.currency_symbol || detectedLocale.currency}
                        onChange={e => setAuthForm(f => ({ ...f, currency_symbol: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                      >
                        <option value="KSh">KSh (Kenya)</option>
                        <option value="$">$ (USD)</option>
                        <option value="£">£ (UK)</option>
                        <option value="₦">₦ (Nigeria)</option>
                        <option value="₹">₹ (India)</option>
                        <option value="UGX">UGX (Uganda)</option>
                        <option value="TZS">TZS (Tanzania)</option>
                        <option value="GH₵">GH₵ (Ghana)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+254 7..."
                        value={authForm.phone}
                        onChange={e => setAuthForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-600/30 text-sm mt-2"
                >
                  {authMode === 'login' ? 'Sign In to My Pharmacy' : 'Create Free Account & Start'}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsDemoGuest(true);
                    showToast('Entered interactive demo mode', 'success');
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                >
                  <span>Just want to take a look?</span>
                  <span className="font-bold underline">Explore Interactive Demo</span>
                </button>
              </div>

            </div>
          </div>
        </main>

        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <p>© 2026 PharmaHub. Free Open Source Pharmacy Management & Pricing Intelligence.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-semibold transition-all transform animate-bounce ${
            notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
        <div className="p-5 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
            <Pill className="w-6 h-6 transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight truncate">{settings.pharmacy_name}</h1>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {settings.currency_symbol} Active
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveTab('pos')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>POS & Dispense</span>
            {cart.length > 0 && (
              <span className="ml-auto bg-emerald-400 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard & Alerts</span>
            {dashboardData?.expiringCount > 0 && (
              <span className="ml-auto bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full">
                {dashboardData.expiringCount}
              </span>
            )}
          </button>

          {/* PATIENT LOANS / PHARMACY CREDIT TAB */}
          <button
            onClick={() => setActiveTab('loans')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'loans'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <HandCoins className="w-5 h-5 text-amber-400" />
            <span>Trust Loans & Debts</span>
            {overdueLoansCount > 0 && (
              <span className="ml-auto bg-rose-500 text-white font-bold text-xs px-2 py-0.5 rounded-full animate-pulse">
                {overdueLoansCount} due
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Pill className="w-5 h-5" />
            <span>Medicines & Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'batches'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-5 h-5" />
            <span>Batches & Expiry (FEFO)</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'sales'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span>Sales History</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Pharmacy Settings</span>
          </button>
        </nav>

        {/* Mobile / Android Connectivity Card */}
        <div className="p-4 m-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
            <QrCode className="w-4 h-4" />
            <span>Android Access</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Open on your Android phone/tablet on the same Wi-Fi network at:
          </p>
          <div className="mt-2 bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-teal-300 break-all select-all">
            http://192.168.0.168:5000
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="md:hidden w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Pill className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                {activeTab === 'pos' && 'Dispensing Counter & POS'}
                {activeTab === 'dashboard' && 'Pharmacy Performance & Alerts'}
                {activeTab === 'loans' && 'Customer Trust Loans & Reminders'}
                {activeTab === 'inventory' && 'Drug Catalog & Multi-Tier Pricing'}
                {activeTab === 'batches' && 'Stock Intake & Expiry Monitoring'}
                {activeTab === 'sales' && 'Completed Sales & Receipts'}
                {activeTab === 'settings' && 'System Configuration'}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                Smart Brand vs Generic Comparison • FEFO Batch Allocation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-detected Currency & Country Tag */}
            <div
              onClick={() => {
                setSettings(s => ({
                  ...s,
                  currency_symbol: detectedLocale.currency,
                  detected_country: detectedLocale.country
                }));
                showToast(`Applied ${detectedLocale.country} currency (${detectedLocale.currency})`, 'success');
              }}
              className="cursor-pointer hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition"
              title="Click to automatically apply your detected local currency"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{settings.currency_symbol} ({settings.detected_country || detectedLocale.country})</span>
            </div>

            <button
              onClick={fetchAllData}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddMedicineModal(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine</span>
            </button>
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm shadow-emerald-700/20"
            >
              <Boxes className="w-4 h-4" />
              <span>Receive Stock</span>
            </button>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5">
                <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-violet-50 border border-violet-200 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-violet-800 max-w-[80px] truncate">
                    {currentUser.name || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-semibold transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                className="flex items-center space-x-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-6 p-4 md:p-6">
          {/* ============================================================ */}
          {/* 1. POS & DISPENSING TAB                                      */}
          {/* ============================================================ */}
          {activeTab === 'pos' && (
            <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* Product Catalog & Search Column */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Search Bar & Category Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 mb-4 space-y-3">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Brand (Augmentin), Generic (Amoxicillin), Barcode, or Manufacturer..."
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    {posSearch && (
                      <button
                        onClick={() => setPosSearch('')}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                    {['All', 'OTC', 'Prescription'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setPosCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                          posCategory === cat
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400 text-[11px] self-center">
                      Showing {filteredMeds.length} products
                    </span>
                  </div>
                </div>

                {/* Medicine Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 overflow-y-auto pr-1">
                  {filteredMeds.map((med) => {
                    const isOutOfStock = med.total_packs <= 0 && med.total_loose_units <= 0;
                    return (
                      <div
                        key={med.id}
                        className={`bg-white rounded-2xl p-4 border transition flex flex-col justify-between shadow-sm hover:shadow-md ${
                          isOutOfStock ? 'opacity-60 border-rose-200 bg-rose-50/20' : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <h3 className="font-bold text-slate-900 text-base leading-snug">{med.brand_name}</h3>
                              <p className="text-xs text-emerald-700 font-medium">{med.molecule_name}</p>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                med.brand_tier === 'originator'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : med.brand_tier === 'branded_generic'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {med.brand_tier === 'originator'
                                ? 'Innovator Brand'
                                : med.brand_tier === 'branded_generic'
                                ? 'Branded Generic'
                                : 'Pure Generic'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 mb-3 space-y-0.5">
                            <p>
                              {med.strength} • {med.dosage_form} • <span className="font-medium text-slate-600">{med.manufacturer}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  med.total_packs > 10 ? 'bg-emerald-500' : med.total_packs > 0 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                              />
                              <span>
                                In Stock: <strong>{med.total_packs}</strong> boxes ({med.total_loose_units} loose {med.unit_name}s)
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {/* Unit Pricing Breakdown */}
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="text-slate-500">Box ({med.units_per_pack}s):</span>
                            <span className="font-bold text-slate-900 text-sm">
                              {curr}{Number(med.pack_price).toFixed(2)}
                            </span>
                          </div>
                          {med.strip_price && (
                            <div className="flex items-baseline justify-between text-xs text-slate-500">
                              <span>Strip ({med.units_per_strip}s):</span>
                              <span className="font-semibold text-slate-700">
                                {curr}{Number(med.strip_price).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline justify-between text-xs text-slate-500">
                            <span>Single {med.unit_name}:</span>
                            <span className="font-semibold text-slate-700">
                              {curr}{Number(med.unit_price).toFixed(2)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1">
                            <button
                              onClick={() => addToCart(med, 'pack')}
                              disabled={isOutOfStock}
                              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition disabled:opacity-40"
                              title="Add 1 Box"
                            >
                              + Box
                            </button>
                            {med.units_per_strip > 0 && (
                              <button
                                onClick={() => addToCart(med, 'strip')}
                                disabled={isOutOfStock}
                                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition disabled:opacity-40"
                                title="Add 1 Strip"
                              >
                                + Strip
                              </button>
                            )}
                            <button
                              onClick={() => addToCart(med, 'unit')}
                              disabled={isOutOfStock}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition disabled:opacity-40"
                              title={`Add 1 ${med.unit_name}`}
                            >
                              + 1 {med.unit_name}
                            </button>
                          </div>

                          {/* Find Generic Alternative & Web Market Price Button */}
                          <button
                            onClick={() => handleOpenAlternatives(med)}
                            className="w-full mt-1.5 py-1.5 px-2 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Compare Brand / Generics & Web Market</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cart & Dispensing Column */}
              <div className="w-full lg:w-96 bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between shrink-0">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-slate-900 text-base">Dispensing Cart</h3>
                    </div>
                    {cart.length > 0 && (
                      <button
                        onClick={() => setCart([])}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Patient & Prescription Details */}
                  <div className="space-y-2 mb-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <input
                      type="text"
                      placeholder="Patient Name (Required for Loan/Credit)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Phone No (e.g. 0712...)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Rx Number"
                        value={prescriptionNumber}
                        onChange={(e) => setPrescriptionNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Cart Items List */}
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30 stroke-1" />
                      <p className="text-sm font-medium">Cart is empty</p>
                      <p className="text-xs">Select medicines from the left to dispense</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {cart.map((item, index) => (
                        <div
                          key={`${item.medicine_id}-${item.unit_type}-${index}`}
                          className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{item.brand_name}</p>
                              <p className="text-[11px] text-slate-500">
                                {item.unit_type === 'pack' ? 'Box' : item.unit_type === 'strip' ? 'Strip' : item.unit_name} @ {curr}{item.unit_price}
                              </p>
                            </div>
                            <span className="font-bold text-slate-900 text-xs">
                              {curr}{item.total_price}
                            </span>
                          </div>

                          {/* Dosage instructions input */}
                          <input
                            type="text"
                            placeholder="Dosage instruction (e.g., 1 tablet TDS)"
                            value={item.dosage_instruction}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCart(prev =>
                                prev.map((it, i) => (i === index ? { ...it, dosage_instruction: val } : it))
                              );
                            }}
                            className="w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-600"
                          />

                          {/* Quantity control & remove */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    setCart(prev =>
                                      prev.map((it, i) =>
                                        i === index
                                          ? {
                                              ...it,
                                              quantity: it.quantity - 1,
                                              total_price: ((it.quantity - 1) * it.unit_price).toFixed(2)
                                            }
                                          : it
                                      )
                                    );
                                  } else {
                                    setCart(prev => prev.filter((_, i) => i !== index));
                                  }
                                }}
                                className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  setCart(prev =>
                                    prev.map((it, i) =>
                                      i === index
                                        ? {
                                            ...it,
                                            quantity: it.quantity + 1,
                                            total_price: ((it.quantity + 1) * it.unit_price).toFixed(2)
                                          }
                                        : it
                                    )
                                  );
                                }}
                                className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => setCart(prev => prev.filter((_, i) => i !== index))}
                              className="text-slate-400 hover:text-rose-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals, Payment Method & Loan Details */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5 mt-2">
                  {/* Payment Method Selector (Including Credit / Loan) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-5 gap-1 text-[11px] font-semibold">
                      {[
                        { id: 'cash', label: 'Cash' },
                        { id: 'mobile_money', label: 'M-Pesa' },
                        { id: 'card', label: 'Card' },
                        { id: 'insurance', label: 'HMO' },
                        { id: 'loan', label: 'Credit / Loan' }
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`py-1.5 px-1 rounded-lg border text-center transition truncate ${
                            paymentMethod === pm.id
                              ? pm.id === 'loan'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special Loan / Pharmacy Credit Input Details */}
                  {paymentMethod === 'loan' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                        <HandCoins className="w-4 h-4 text-amber-600" />
                        <span>Trusted Pharmacy Credit / Loan Details</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-600 text-[10px] font-semibold mb-0.5">Promised Payment Date *</label>
                          <input
                            type="date"
                            value={loanPromiseDate}
                            onChange={(e) => setLoanPromiseDate(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs font-medium"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 text-[10px] font-semibold mb-0.5">National ID / Guarantor</label>
                          <input
                            type="text"
                            placeholder="Optional ID or note"
                            value={loanNotes}
                            onChange={(e) => setLoanNotes(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-amber-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-amber-800 italic">
                        * The system will automatically remind you when this payment is due and generate 1-click WhatsApp/SMS reminders.
                      </p>
                    </div>
                  )}

                  {/* Discount row */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Discount ({curr})</span>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                      className="w-20 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-baseline justify-between text-sm text-slate-600">
                    <span>Subtotal:</span>
                    <span>{curr}{cartSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-baseline justify-between text-lg font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>{paymentMethod === 'loan' ? 'Total Loan Due:' : 'Total Due:'}</span>
                    <span className={`${paymentMethod === 'loan' ? 'text-amber-600' : 'text-emerald-600'} text-xl font-extrabold`}>
                      {curr}{cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className={`w-full py-3.5 text-white font-bold rounded-2xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      paymentMethod === 'loan'
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-700/25'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/25'
                    }`}
                  >
                    {paymentMethod === 'loan' ? (
                      <>
                        <HandCoins className="w-5 h-5" />
                        <span>Issue on Credit / Loan</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Complete Sale & Print Receipt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. CUSTOMER TRUST LOANS & REMINDERS TAB                      */}
          {/* ============================================================ */}
          {activeTab === 'loans' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Outstanding Debt</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">
                      {curr}{loans.reduce((acc, l) => acc + (l.balance_due || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{loans.filter(l => l.balance_due > 0).length} active patient credits</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <HandCoins className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Overdue Payments</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{overdueLoansCount}</p>
                    <p className="text-xs text-rose-600 font-medium mt-0.5">Payment promise date passed</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Due Within 3 Days</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">
                      {loans.filter(l => l.is_due_soon).length}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Send early reminder</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Loans Ledger Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Pharmacy Customer Credit & Debt Ledger</h3>
                    <p className="text-xs text-slate-500">
                      Track patient promises, follow up on unpaid medicines, and send instant WhatsApp/SMS reminders.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3">Patient & Contact</th>
                        <th className="pb-3">Medicines Taken</th>
                        <th className="pb-3">Promised Due Date</th>
                        <th className="pb-3">Total Credit</th>
                        <th className="pb-3">Amount Paid</th>
                        <th className="pb-3">Balance Due</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loans.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3">
                            <p className="font-bold text-slate-900">{l.customer_name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{l.customer_phone}</p>
                            {l.national_id_or_notes && (
                              <p className="text-[10px] text-slate-400 italic">{l.national_id_or_notes}</p>
                            )}
                          </td>
                          <td className="py-3 text-slate-700 max-w-xs truncate" title={l.items_summary}>
                            {l.items_summary}
                          </td>
                          <td className="py-3 font-semibold text-slate-800">
                            {l.promise_date}
                            {l.is_overdue && (
                              <span className="block text-[10px] text-rose-600 font-bold">
                                {Math.abs(Math.round(l.days_left))} days overdue
                              </span>
                            )}
                            {l.is_due_soon && (
                              <span className="block text-[10px] text-amber-600 font-bold">
                                Due in {Math.round(l.days_left)} days
                              </span>
                            )}
                          </td>
                          <td className="py-3 font-bold text-slate-800">{curr}{Number(l.total_amount).toFixed(2)}</td>
                          <td className="py-3 text-slate-600">{curr}{Number(l.amount_paid).toFixed(2)}</td>
                          <td className="py-3 font-extrabold text-amber-700 text-sm">
                            {curr}{Number(l.balance_due).toFixed(2)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                l.balance_due <= 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : l.is_overdue
                                  ? 'bg-rose-100 text-rose-800 animate-pulse'
                                  : l.is_due_soon
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {l.balance_due <= 0 ? 'Paid' : l.is_overdue ? 'Overdue' : l.is_due_soon ? 'Due Soon' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                            {/* WhatsApp Reminder Button */}
                            {l.balance_due > 0 && l.whatsapp_url && (
                              <a
                                href={l.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                                title="Send WhatsApp Reminder"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            {/* SMS Reminder Link */}
                            {l.balance_due > 0 && (
                              <a
                                href={l.sms_url}
                                className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                                title="Send SMS"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>SMS</span>
                              </a>
                            )}

                            {/* Record Payment Button */}
                            {l.balance_due > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedLoanForRepayment(l);
                                  setRepayAmount(String(l.balance_due));
                                  setShowRepaymentModal(true);
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Pay
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. DASHBOARD & ALERTS TAB                                    */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              {/* Loan Reminders Box on Dashboard */}
              {dashboardData.overdueLoansCount > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <h3 className="font-bold text-rose-900 text-base">
                        Customer Loan Action Needed ({dashboardData.overdueLoansCount} Overdue)
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('loans')}
                      className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                    >
                      <span>View All in Credit Ledger</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dashboardData.overdueLoans.map(l => (
                      <div key={l.id} className="bg-white p-3.5 rounded-2xl border border-rose-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{l.customer_name}</p>
                          <p className="text-xs text-rose-700 font-semibold">
                            Balance: {curr}{Number(l.balance_due).toFixed(2)} • Promised {l.promise_date}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{l.items_summary}</p>
                        </div>
                        <a
                          href={l.customer_phone ? `https://wa.me/${l.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${l.customer_name}, gentle reminder regarding your balance of ${curr}${l.balance_due} at ${settings.pharmacy_name}.`)}` : '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Remind</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Today's Revenue</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{curr}{Number(dashboardData.todayRevenue).toFixed(2)}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{dashboardData.todaySalesCount} prescriptions dispensed</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Outstanding Credits</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">
                      {curr}{Number(dashboardData.totalOutstandingLoans || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-amber-700 font-medium mt-0.5">{dashboardData.loansCount || 0} customer loans</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <HandCoins className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Expiring Batches</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{dashboardData.expiringCount}</p>
                    <p className="text-xs text-amber-700 font-medium mt-0.5">&lt; {settings.expiry_warning_days} days shelf-life left</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Low Stock Warnings</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{dashboardData.lowStockCount}</p>
                    <p className="text-xs text-rose-600 font-medium mt-0.5">Below reorder threshold</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Expiry Risk Board (FEFO Alert) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-900 text-base">Expiry Risk Board (FEFO Action Required)</h3>
                  </div>
                  <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-semibold border border-amber-200">
                    Threshold: {settings.expiry_warning_days} Days
                  </span>
                </div>

                {dashboardData.expiringBatches.length === 0 ? (
                  <p className="text-sm text-emerald-600 font-medium py-4 text-center">
                    ✓ All inventory batches have healthy expiry dates!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                          <th className="pb-2">Medicine</th>
                          <th className="pb-2">Batch #</th>
                          <th className="pb-2">Expiry Date</th>
                          <th className="pb-2">Days Left</th>
                          <th className="pb-2">Available Packs</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dashboardData.expiringBatches.map((b) => (
                          <tr key={b.id} className="hover:bg-amber-50/30 transition">
                            <td className="py-2.5 font-bold text-slate-800">
                              {b.brand_name} <span className="font-normal text-slate-500">({b.strength})</span>
                            </td>
                            <td className="py-2.5 font-mono text-slate-600">{b.batch_number}</td>
                            <td className="py-2.5 font-semibold text-amber-800">{b.expiry_date}</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[11px]">
                                {Math.round(b.days_left)} days
                              </span>
                            </td>
                            <td className="py-2.5 font-bold text-slate-900">{b.packs_available} boxes</td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => {
                                  setActiveTab('pos');
                                  setPosSearch(b.brand_name);
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Dispense First
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. MEDICINES & MULTI-TIER PRICING TAB                        */}
          {/* ============================================================ */}
          {activeTab === 'inventory' && (
            <div className="space-y-5">
              {/* Web Market Price Checker Bar */}
              <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-base">Web Market Price Intelligence Engine</h3>
                  </div>
                  <span className="text-xs text-blue-200 bg-blue-800/60 px-3 py-1 rounded-full">
                    Sourced from National Drug Registries & Public Hospital Formularies
                  </span>
                </div>
                <form onSubmit={handleSearchMarket} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search market benchmark for any medicine (e.g. Augmentin, Paracetamol, Metformin)..."
                    value={marketSearchQuery}
                    onChange={(e) => setMarketSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    Check Market Price
                  </button>
                </form>

                {standaloneMarketData && (
                  <div className="mt-3 p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{standaloneMarketData.medicine}</h4>
                        <p className="text-blue-300">{standaloneMarketData.therapeutic_class} • {standaloneMarketData.country}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">{standaloneMarketData.prescription_status}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-purple-900/30 border border-purple-500/30 rounded-xl">
                        <span className="text-[10px] font-bold text-purple-300 uppercase">Originator Brand</span>
                        <p className="font-bold text-white text-sm mt-0.5">{standaloneMarketData.tiers.originator.brand}</p>
                        <p className="text-amber-300 font-extrabold text-base mt-1">
                          {curr}{standaloneMarketData.tiers.originator.market_average.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-400">Range: {curr}{standaloneMarketData.tiers.originator.market_low} - {curr}{standaloneMarketData.tiers.originator.market_high}</p>
                      </div>

                      <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-xl">
                        <span className="text-[10px] font-bold text-blue-300 uppercase">Branded Generic</span>
                        <p className="font-bold text-white text-sm mt-0.5">{standaloneMarketData.tiers.branded_generic.brand}</p>
                        <p className="text-teal-300 font-extrabold text-base mt-1">
                          {curr}{standaloneMarketData.tiers.branded_generic.market_average.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-400">Range: {curr}{standaloneMarketData.tiers.branded_generic.market_low} - {curr}{standaloneMarketData.tiers.branded_generic.market_high}</p>
                      </div>

                      <div className="p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase">Pure Generic</span>
                        <p className="font-bold text-white text-sm mt-0.5">{standaloneMarketData.tiers.pure_generic.brand}</p>
                        <p className="text-emerald-300 font-extrabold text-base mt-1">
                          {curr}{standaloneMarketData.tiers.pure_generic.market_average.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-400">Range: {curr}{standaloneMarketData.tiers.pure_generic.market_low} - {curr}{standaloneMarketData.tiers.pure_generic.market_high}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      ℹ️ {standaloneMarketData.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Drug Catalog Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Store Drug Catalog & Pricing</h3>
                    <p className="text-xs text-slate-500">
                      Compare Originator Brands, Branded Generics, and Pure Generics side-by-side.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddMedicineModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Medicine</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3">Brand & Manufacturer</th>
                        <th className="pb-3">Generic Molecule</th>
                        <th className="pb-3">Brand Tier</th>
                        <th className="pb-3">Box Price</th>
                        <th className="pb-3">Strip Price</th>
                        <th className="pb-3">Unit Pill Price</th>
                        <th className="pb-3">Insurance Copay</th>
                        <th className="pb-3">Stock (Packs)</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map((med) => (
                        <tr key={med.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 pr-2">
                            <p className="font-bold text-slate-900">{med.brand_name}</p>
                            <p className="text-[11px] text-slate-500">{med.strength} • {med.manufacturer}</p>
                          </td>
                          <td className="py-3 text-slate-700 font-medium">
                            {med.molecule_name}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                med.brand_tier === 'originator'
                                  ? 'bg-purple-100 text-purple-700'
                                  : med.brand_tier === 'branded_generic'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {med.brand_tier}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-slate-900">{curr}{Number(med.pack_price).toFixed(2)}</td>
                          <td className="py-3 text-slate-600">{med.strip_price ? `${curr}${Number(med.strip_price).toFixed(2)}` : '—'}</td>
                          <td className="py-3 text-slate-600">{curr}{Number(med.unit_price).toFixed(2)}</td>
                          <td className="py-3 text-slate-600">{med.insurance_pack_price ? `${curr}${Number(med.insurance_pack_price).toFixed(2)}` : '—'}</td>
                          <td className="py-3">
                            <span className={`font-bold ${med.total_packs <= med.min_stock_alert ? 'text-rose-600' : 'text-slate-800'}`}>
                              {med.total_packs}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenAlternatives(med)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold"
                              title="Compare alternatives"
                            >
                              Compare & Web Market
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. BATCHES & EXPIRE MANAGEMENT (FEFO)                        */}
          {/* ============================================================ */}
          {activeTab === 'batches' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Batch Inventory & FEFO Allocator</h3>
                  <p className="text-xs text-slate-500">
                    Stock is automatically dispensed First-Expired, First-Out to eliminate shelf spoilage.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddBatchModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Receive Stock Batch</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3">Medicine & Strength</th>
                      <th className="pb-3">Batch Number</th>
                      <th className="pb-3">Supplier</th>
                      <th className="pb-3">Cost Price</th>
                      <th className="pb-3">Packs Remaining</th>
                      <th className="pb-3">Expiry Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.flatMap(m => (m.batches || []).map(b => ({ ...b, medicine_name: m.brand_name, strength: m.strength }))).length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-6 text-center text-slate-400">
                          Batches loaded per medicine. Open "Medicines & Pricing" to view individual batch histories.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 6. SALES HISTORY TAB                                         */}
          {/* ============================================================ */}
          {activeTab === 'sales' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Dispensing Sales Audit Trail</h3>
                  <p className="text-xs text-slate-500">Full receipt logs and doctor prescription records</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3">Receipt #</th>
                      <th className="pb-3">Date & Time</th>
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">Prescription Details</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3 text-right">View / Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesHistory.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-mono font-bold text-slate-900">{s.receipt_number}</td>
                        <td className="py-3 text-slate-600">{s.created_at}</td>
                        <td className="py-3 font-semibold text-slate-800">{s.customer_name}</td>
                        <td className="py-3 text-slate-500">
                          {s.prescribing_doctor ? `${s.prescribing_doctor} (Rx: ${s.prescription_number})` : 'Over the counter'}
                        </td>
                        <td className="py-3 capitalize">
                          <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                            s.payment_method === 'loan' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {s.payment_method === 'loan' ? 'Credit / Loan' : s.payment_method}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-emerald-600 text-sm">
                          {curr}{Number(s.total).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={async () => {
                              const details = await fetch(`/api/sales/${s.id}`).then(r => r.json());
                              setCurrentReceipt(details);
                              setShowReceiptModal(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 7. SETTINGS & CUSTOMIZATION TAB                             */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Pharmacy Customization</h3>
                <p className="text-xs text-slate-500">
                  Configure store headers, currency symbols, and inventory alert parameters.
                </p>
              </div>

              {/* Automatic Location Detection Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-900">🌍 Auto-Detected Location: {detectedLocale.country}</p>
                  <p className="text-emerald-700">Timezone: {detectedLocale.timezone || 'Local'} • Standard Currency: {detectedLocale.currency}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      currency_symbol: detectedLocale.currency,
                      detected_country: detectedLocale.country
                    });
                    showToast(`Currency set to ${detectedLocale.currency}`, 'success');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Use {detectedLocale.currency}
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pharmacy / Store Name</label>
                  <input
                    type="text"
                    value={settings.pharmacy_name}
                    onChange={(e) => setSettings({ ...settings, pharmacy_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={settings.currency_symbol}
                      onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                      placeholder="e.g. KSh, $, €, £, NGN"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-emerald-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Expiry Warning Threshold (Days)</label>
                    <input
                      type="number"
                      value={settings.expiry_warning_days}
                      onChange={(e) => setSettings({ ...settings, expiry_warning_days: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-700/20"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Bar (Android & Mobile View) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-3 flex justify-around items-center z-40 shadow-lg">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs ${
              activeTab === 'pos' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            <span>POS</span>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs ${
              activeTab === 'loans' ? 'text-amber-600 font-bold' : 'text-slate-400'
            }`}
          >
            <HandCoins className="w-5 h-5 mb-0.5" />
            <span>Loans</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs ${
              activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs ${
              activeTab === 'inventory' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <Pill className="w-5 h-5 mb-0.5" />
            <span>Drugs</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs ${
              activeTab === 'settings' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span>Settings</span>
          </button>
        </div>
      </main>

      {/* ============================================================ */}
      {/* BRAND VS GENERIC & WEB MARKET BENCHMARK COMPARISON MODAL     */}
      {/* ============================================================ */}
      {showAlternativeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <h3 className="font-bold text-lg">Generic Alternatives & Web Market Pricing</h3>
                </div>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Molecule: <strong>{selectedForAlternative?.molecule_name}</strong> ({selectedForAlternative?.strength})
                </p>
              </div>
              <button
                onClick={() => setShowAlternativeModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab switcher: Store Stock vs Web Market Prices */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveAltSubTab('inventory')}
                className={`pb-2.5 transition border-b-2 ${
                  activeAltSubTab === 'inventory'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                In-Store Stock Alternatives
              </button>
              <button
                onClick={() => setActiveAltSubTab('market')}
                className={`pb-2.5 transition border-b-2 flex items-center space-x-1.5 ${
                  activeAltSubTab === 'market'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Web Market Benchmarks & Price Guide</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Selected Target Medicine */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Currently Selected Item
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{selectedForAlternative?.brand_name}</h4>
                    <span className="text-xs text-purple-700 bg-purple-100 font-bold px-2 py-0.5 rounded-full uppercase text-[10px]">
                      {selectedForAlternative?.brand_tier}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900">{curr}{Number(selectedForAlternative?.pack_price).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Box price</p>
                  </div>
                </div>
              </div>

              {/* TAB 1: INVENTORY ALTERNATIVES */}
              {activeAltSubTab === 'inventory' && alternativesData && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Available Bioequivalent In-Stock Options:
                  </h4>

                  {alternativesData.alternatives.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      No other brands registered with this exact molecule in stock yet.
                    </p>
                  ) : (
                    alternativesData.alternatives.map((alt) => (
                      <div
                        key={alt.id}
                        className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          alt.isCheaper
                            ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-bold text-slate-900 text-sm">{alt.brand_name}</h5>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                alt.brand_tier === 'generic'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {alt.brand_tier}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Mfg: {alt.manufacturer} • In Stock: {alt.total_packs} boxes
                          </p>
                          {alt.isCheaper && (
                            <div className="mt-1.5 inline-flex items-center space-x-1 text-emerald-700 font-bold text-xs bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                              <span>Saves patient {alt.savingsPct}% ({curr}{alt.priceDifference} per box)</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-right">
                            <p className="text-base font-extrabold text-slate-900">{curr}{Number(alt.pack_price).toFixed(2)}</p>
                            <p className="text-[11px] text-slate-500">
                              {curr}{Number(alt.unit_price).toFixed(2)} / {alt.unit_name}
                            </p>
                          </div>
                          <button
                            onClick={() => switchCartItem(selectedForAlternative.id, alt)}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                          >
                            Switch & Dispense
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: WEB MARKET BENCHMARKS & PRICE INTELLIGENCE */}
              {activeAltSubTab === 'market' && marketBenchmarkData && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Market Intelligence Summary for {marketBenchmarkData.country}</span>
                    </p>
                    <p className="text-blue-800">{marketBenchmarkData.notes}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 uppercase">1. Originator Brand</span>
                      <p className="font-bold text-slate-900 text-xs">{marketBenchmarkData.tiers.originator.brand}</p>
                      <p className="text-purple-700 font-extrabold text-lg mt-1">
                        {curr}{marketBenchmarkData.tiers.originator.market_average.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Typical range: {curr}{marketBenchmarkData.tiers.originator.market_low} - {curr}{marketBenchmarkData.tiers.originator.market_high}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-2">Source: {marketBenchmarkData.tiers.originator.source}</p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase">2. Branded Generic</span>
                      <p className="font-bold text-slate-900 text-xs">{marketBenchmarkData.tiers.branded_generic.brand}</p>
                      <p className="text-blue-700 font-extrabold text-lg mt-1">
                        {curr}{marketBenchmarkData.tiers.branded_generic.market_average.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Typical range: {curr}{marketBenchmarkData.tiers.branded_generic.market_low} - {curr}{marketBenchmarkData.tiers.branded_generic.market_high}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-2">Source: {marketBenchmarkData.tiers.branded_generic.source}</p>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">3. Pure Generic</span>
                      <p className="font-bold text-slate-900 text-xs">{marketBenchmarkData.tiers.pure_generic.brand}</p>
                      <p className="text-emerald-700 font-extrabold text-lg mt-1">
                        {curr}{marketBenchmarkData.tiers.pure_generic.market_average.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Typical range: {curr}{marketBenchmarkData.tiers.pure_generic.market_low} - {curr}{marketBenchmarkData.tiers.pure_generic.market_high}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-2">Source: {marketBenchmarkData.tiers.pure_generic.source}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RECORD REPAYMENT MODAL                                       */}
      {/* ============================================================ */}
      {showRepaymentModal && selectedLoanForRepayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Customer Debt Repayment</h3>
                <p className="text-xs text-slate-500">Patient: {selectedLoanForRepayment.customer_name}</p>
              </div>
              <button onClick={() => setShowRepaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordRepayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Current Outstanding Balance:</span>
                  <span className="text-amber-700 font-bold">{curr}{selectedLoanForRepayment.balance_due.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Repayment Amount ({curr}) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedLoanForRepayment.balance_due}
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-base font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                <select
                  value={repayMethod}
                  onChange={(e) => setRepayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">M-Pesa / Mobile Money</option>
                  <option value="card">Bank Card</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Notes</label>
                <input
                  type="text"
                  placeholder="e.g. M-Pesa Ref QK99... or paid in cash at counter"
                  value={repayNotes}
                  onChange={(e) => setRepayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-700/20"
              >
                Confirm Payment & Update Balance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD MEDICINE MODAL                                           */}
      {/* ============================================================ */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Register New Medicine Formulation</h3>
              <button
                onClick={() => setShowAddMedicineModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Augmentin 625mg"
                    value={newMedForm.brand_name}
                    onChange={(e) => setNewMedForm({ ...newMedForm, brand_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Active Ingredient (Molecule) *</label>
                  <select
                    required
                    value={newMedForm.molecule_id}
                    onChange={(e) => setNewMedForm({ ...newMedForm, molecule_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">-- Select Active Molecule --</option>
                    {molecules.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.therapeutic_class})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand Tier</label>
                  <select
                    value={newMedForm.brand_tier}
                    onChange={(e) => setNewMedForm({ ...newMedForm, brand_tier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  >
                    <option value="originator">Originator Brand</option>
                    <option value="branded_generic">Branded Generic</option>
                    <option value="generic">Pure Generic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Strength</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 625mg"
                    value={newMedForm.strength}
                    onChange={(e) => setNewMedForm({ ...newMedForm, strength: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dosage Form</label>
                  <select
                    value={newMedForm.dosage_form}
                    onChange={(e) => setNewMedForm({ ...newMedForm, dosage_form: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream / Ointment</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. GSK, Sandoz"
                    value={newMedForm.manufacturer}
                    onChange={(e) => setNewMedForm({ ...newMedForm, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Barcode / UPC</label>
                  <input
                    type="text"
                    placeholder="Scan or enter barcode"
                    value={newMedForm.barcode}
                    onChange={(e) => setNewMedForm({ ...newMedForm, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                <p className="font-bold text-emerald-900 text-xs">Unit Packaging & Retail Pricing ({curr})</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Units / Box (Pack Size)</label>
                    <input
                      type="number"
                      value={newMedForm.units_per_pack}
                      onChange={(e) => setNewMedForm({ ...newMedForm, units_per_pack: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Full Box Retail Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={newMedForm.pack_price}
                      onChange={(e) => {
                        const pp = e.target.value;
                        const autoUnit = pp && newMedForm.units_per_pack ? (pp / newMedForm.units_per_pack).toFixed(2) : '';
                        setNewMedForm({ ...newMedForm, pack_price: pp, unit_price: autoUnit });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Single Pill / Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Auto"
                      value={newMedForm.unit_price}
                      onChange={(e) => setNewMedForm({ ...newMedForm, unit_price: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-700/20"
                >
                  Save to Drug Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD BATCH / RECEIVE STOCK MODAL                             */}
      {/* ============================================================ */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Receive New Inventory Batch (FEFO)</h3>
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Medicine *</label>
                <select
                  required
                  value={newBatchForm.medicine_id}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, medicine_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                >
                  <option value="">-- Choose Medicine --</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.brand_name} ({m.strength}) - {m.manufacturer}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Batch / Lot Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-2026-X8"
                    value={newBatchForm.batch_number}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batch_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newBatchForm.expiry_date}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Packs Received *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={newBatchForm.packs_received}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, packs_received: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Supplier / Distributor</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Health Logistics"
                    value={newBatchForm.supplier}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cost Price Per Pack ({curr})</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newBatchForm.cost_price_per_pack}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, cost_price_per_pack: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-700/20"
              >
                Intake Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* THERMAL RECEIPT MODAL                                        */}
      {/* ============================================================ */}
      {showReceiptModal && currentReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">Thermal Receipt Preview</span>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Content */}
            <div id="printable-receipt" className="p-6 font-mono text-xs text-slate-800 space-y-3">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h4 className="font-bold text-sm text-slate-900">{settings.pharmacy_name}</h4>
                <p className="text-[11px] text-slate-500">{settings.address}</p>
                <p className="text-[11px] text-slate-500">Tel: {settings.phone}</p>
              </div>

              <div className="text-[11px] text-slate-600 space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <p>Receipt: <strong>{currentReceipt.receipt_number}</strong></p>
                <p>Date: {currentReceipt.created_at}</p>
                <p>Patient: {currentReceipt.customer_name}</p>
                {currentReceipt.prescribing_doctor && (
                  <p>Doctor: {currentReceipt.prescribing_doctor}</p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
                {currentReceipt.items.map((it, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{it.brand_name} ({it.unit_type}) x{it.quantity}</span>
                      <span>{curr}{Number(it.total_price).toFixed(2)}</span>
                    </div>
                    {it.dosage_instruction && (
                      <p className="text-[10px] text-emerald-800 font-sans italic">
                        Directions: {it.dosage_instruction}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right text-xs pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{curr}{Number(currentReceipt.subtotal).toFixed(2)}</span>
                </div>
                {Number(currentReceipt.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{curr}{Number(currentReceipt.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-1">
                  <span>Total {currentReceipt.payment_method === 'loan' ? 'Credit' : 'Paid'}:</span>
                  <span>{curr}{Number(currentReceipt.total).toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-500 capitalize">
                  Payment via {currentReceipt.payment_method === 'loan' ? 'Trust Loan / Credit' : currentReceipt.payment_method}
                </p>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-400 font-sans">
                Thank you for choosing {settings.pharmacy_name}! Wish you quick recovery.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* AUTH MODAL — Login / Register                               */}
      {/* ============================================================ */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-violet-600 to-indigo-700 px-6 pt-6 pb-8 text-white">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {authMode === 'login' ? 'Welcome back' : 'Create your account'}
                  </h2>
                  <p className="text-xs text-violet-200">
                    {authMode === 'login'
                      ? 'Sign in to access your pharmacy data'
                      : 'Free forever — no credit card required'}
                  </p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex mt-4 bg-white/15 rounded-xl p-1">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition ${
                    authMode === 'login' ? 'bg-white text-violet-700 shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition ${
                    authMode === 'register' ? 'bg-white text-violet-700 shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5 space-y-4">

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Dr. Jane Wambui"
                      value={authForm.name}
                      onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pharmacy Name</label>
                    <input
                      type="text"
                      placeholder="HealthFirst Pharmacy"
                      value={authForm.pharmacy_name}
                      onChange={e => setAuthForm(f => ({ ...f, pharmacy_name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="jane@pharmacy.com"
                  value={authForm.email}
                  onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder={authMode === 'register' ? 'Create a strong password' : 'Your password'}
                  value={authForm.password}
                  onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (authMode === 'login' ? handleLogin(e) : handleRegister(e))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
                />
              </div>

              {authMode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      placeholder="+254 700 000000"
                      value={authForm.phone}
                      onChange={e => setAuthForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Currency Symbol</label>
                    <select
                      value={authForm.currency_symbol}
                      onChange={e => setAuthForm(f => ({ ...f, currency_symbol: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none bg-white"
                    >
                      <option value="KSh">KSh (Kenya)</option>
                      <option value="$">$ (USD)</option>
                      <option value="£">£ (UK)</option>
                      <option value="₦">₦ (Nigeria)</option>
                      <option value="₹">₹ (India)</option>
                      <option value="UGX">UGX (Uganda)</option>
                      <option value="TZS">TZS (Tanzania)</option>
                      <option value="GH₵">GH₵ (Ghana)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={authMode === 'login' ? handleLogin : handleRegister}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold rounded-xl transition text-sm shadow-lg shadow-violet-500/30"
              >
                {authMode === 'login' ? 'Sign In to My Pharmacy' : 'Create Free Account'}
              </button>

              <p className="text-center text-xs text-slate-500">
                {authMode === 'login' ? (
                  <>Don't have an account?{' '}
                    <button onClick={() => setAuthMode('register')} className="text-violet-600 font-semibold hover:underline">
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => setAuthMode('login')} className="text-violet-600 font-semibold hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>

              {authMode === 'register' && (
                <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                  🔒 Your data is stored securely. By creating an account you agree to our terms of service.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

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
  UserCheck,
  Send,
  LogIn,
  LogOut,
  User,
  KeyRound,
  Sun,
  Moon,
  Edit3,
  MoreHorizontal,
  Users,
  Shield,
  CreditCard,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Building,
  Check,
  Briefcase
} from 'lucide-react';
import SoloPOS from './components/SoloPOS';
import PharmaGuide from './components/PharmaGuide';

const DEPARTMENTS = [
  { id: 'All', label: 'All Products', icon: '✨' },
  { id: 'Tablets & Capsules', label: 'Tablets & Capsules', icon: '💊' },
  { id: 'Syrups & Suspensions', label: 'Syrups & Liquids', icon: '🧪' },
  { id: 'Ointments, Creams & Gels', label: 'Ointments & Creams', icon: '🧴' },
  { id: 'Veterinary & Animal Health', label: 'Veterinary & Animal Health', icon: '🐾' },
  { id: 'Eye & Ear Drops', label: 'Eye & Ear Drops', icon: '💧' },
  { id: 'Inhalers & Sprays', label: 'Inhalers & Sprays', icon: '💨' },
  { id: 'Injections & Infusions', label: 'Injections & IV', icon: '💉' },
  { id: 'Medical Supplies', label: 'Medical Supplies', icon: '🩹' }
];

// Tiered SaaS Subscriptions & 30-Day Free Trial Architecture
const SUBSCRIPTION_PLANS = {
  solo: [
    {
      id: 'basic',
      name: 'Solo Basic',
      price: 1000,
      period: 'month',
      staffLimit: 1,
      tag: 'Single Chemist',
      description: 'Single-counter dispensing and inventory for independent community pharmacists.',
      features: [
        'Single Pharmacist Device (Strict 1-User)',
        'Unlimited POS Counter Prescriptions',
        'Standard Drug Catalog & Barcodes',
        'Basic Daily Sales & Receipt Printing',
        'Standard Email Support'
      ]
    },
    {
      id: 'standard',
      name: 'Solo Standard',
      price: 3500,
      period: 'month',
      staffLimit: 1,
      tag: 'Most Popular',
      popular: true,
      description: 'Intelligent dual pricing, batch top-up sensing, and WhatsApp customer loans.',
      features: [
        'Single Pharmacist Device (Strict 1-User)',
        'Dual Wholesale & Retail Pricing at Intake',
        'FEFO Expiry Warnings & Smart Lot Top-up',
        'Customer Trust Loans & 1-Click WhatsApp Reminders',
        'Multi-Unit Selling (Full Box, Blister Strip, Loose Pill)'
      ]
    },
    {
      id: 'premium',
      name: 'Solo Premium',
      price: 6000,
      period: 'month',
      staffLimit: 1,
      tag: 'Full Intelligence',
      description: 'Advanced profit analytics, market pricing intelligence, and priority hotline.',
      features: [
        'Single Pharmacist Device (Strict 1-User)',
        'All Standard Tier Features Included',
        'Web Market Price Intelligence Engine',
        'Gross Profit & COGS Margin Analytics',
        'Exportable Tax & Accountant Ledger CSVs',
        'Priority 24/7 Support Hotline'
      ]
    }
  ],
  organization: [
    {
      id: 'org_basic',
      name: 'Organization Basic',
      price: 5000,
      period: 'month',
      staffLimit: 5,
      tag: 'Clinics & Health Centers',
      description: 'Multi-user role access for small health facilities and clinics.',
      features: [
        'Up to 5 Organization Staff Logins',
        'Professional Work Domain Email Accounts',
        'Role-Based Access Control (Admin, Pharmacist, Cashier)',
        'Basic Departmental Filtering',
        'Central Organization Drug Catalog'
      ]
    },
    {
      id: 'org_enterprise',
      name: 'Organization Enterprise',
      price: 10000,
      period: 'month',
      staffLimit: 9999,
      tag: 'Hospital / Chain',
      popular: true,
      description: 'Unlimited staff, granular department isolation (Vet, Ointments, IV), and executive accounting.',
      features: [
        'Unlimited Multi-Counter Staff Logins',
        'Granular Department Isolation (e.g. Vet Specialist Only, Ointments Only)',
        'Executive Financial Accounting (P&L Statements, COGS, Cash Flow)',
        'Admin Role Assignment & Activity Audit Logs',
        'Integrated Wholesaler Bulk Procurement Portal',
        'Dedicated Enterprise Account Manager'
      ]
    }
  ],
  wholesale: [
    {
      id: 'wholesale_basic',
      name: 'Wholesale Distributor Basic',
      price: 2000,
      period: 'month',
      staffLimit: 3,
      tag: 'Local Distributor',
      description: 'Connect your warehouse stock with neighborhood chemists & clinics.',
      features: [
        'Directory Listing for All Pharmacies',
        'Direct Phone Call & WhatsApp Ordering',
        'Upload up to 100 Products to Catalog',
        'Real-time Stock Availability Displays',
        'Standard Distributor Support'
      ]
    },
    {
      id: 'wholesale_growth',
      name: 'Wholesale Growth Hub',
      price: 5000,
      period: 'month',
      staffLimit: 8,
      tag: 'Regional Wholesaler',
      popular: true,
      description: 'Full catalog visibility, automated stock depletion sync, and bulk promotions.',
      features: [
        'Up to 8 Logistics & Dispatch Staff Accounts',
        'Unlimited Warehouse Product Listings',
        'Real-time Auto Stock Restock Alerts to Pharmacies',
        'Automatic In-App Purchase Order Intake',
        'Priority Listing in Chemist Low-Stock Search'
      ]
    },
    {
      id: 'wholesale_enterprise',
      name: 'Wholesale Enterprise FMCG',
      price: 10000,
      period: 'month',
      staffLimit: 9999,
      tag: 'National Importer',
      description: 'Nationwide distribution, multi-depot sync, and bulk hospital supply contracts.',
      features: [
        'Unlimited Warehouse & Depot Staff Logins',
        'Multi-County Warehouse Stock Isolation',
        'Direct API Link for ERPs (SAP, Oracle, Tally)',
        'Exclusive Direct Chemist Contract Portals',
        'Dedicated 24/7 Supply Chain Account Manager'
      ]
    }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'dashboard', 'inventory', 'batches', 'loans', 'sales', 'settings', 'staff', 'accounting'
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [salesSubView, setSalesSubView] = useState('receipts'); // 'receipts' or 'accounting'
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [accountingData, setAccountingData] = useState(null);
  const [accountingLoading, setAccountingLoading] = useState(false);

  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    staff_title: 'Staff Pharmacist',
    allowed_departments: ['All'],
    permissions: ['pos', 'inventory_read']
  });

  // Wholesalers & Live Restock Directory State
  const [wholesalersList, setWholesalersList] = useState([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState(null);
  const [wholesalerCatalog, setWholesalerCatalog] = useState([]);
  const [wholesalerSearchQuery, setWholesalerSearchQuery] = useState('');
  const [wholesalerDrugMatches, setWholesalerDrugMatches] = useState([]);
  const [wholesalerLoading, setWholesalerLoading] = useState(false);
  const [landingPortalCategory, setLandingPortalCategory] = useState('solo'); // 'solo' | 'organization' | 'wholesale'
  const [showPortalLoginModal, setShowPortalLoginModal] = useState(false);
  const [wholesaleOrders, setWholesaleOrders] = useState([]);
  const [wholesaleSubTab, setWholesaleSubTab] = useState('inventory'); // 'inventory', 'dispatch', 'inbound'

  // M-Pesa Interactive Demo Checkout State
  const [mpesaCheckoutPlan, setMpesaCheckoutPlan] = useState(null);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaCheckoutLoading, setMpesaCheckoutLoading] = useState(false);
  const [mpesaSuccessReceipt, setMpesaSuccessReceipt] = useState(null);
  
  // Apple Dark Mode / Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmahub_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pharmahub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pharmahub_theme', 'light');
    }
  }, [isDarkMode]);

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
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [phoneLoginForm, setPhoneLoginForm] = useState({ phone: '', password: '' });
  const [selectedMedId, setSelectedMedId] = useState(null); // tracks active selection with liquid highlight
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleButtonReady, setGoogleButtonReady] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    pharmacy_name: '',
    phone: '',
    currency_symbol: 'KSh',
    account_type: 'solo', // 'solo' | 'organization'
    work_domain: ''
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
  const [showMobileCart, setShowMobileCart] = useState(false);
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

  // Department Category Filter (for both POS and Medicines views)
  const [selectedFormCategory, setSelectedFormCategory] = useState('All');
  const [medCatalogSearch, setMedCatalogSearch] = useState('');
  const [medCatalogFormCategory, setMedCatalogFormCategory] = useState('All');

  // Quick Price & Wholesaler Cost Edit Modal
  const [showPriceEditModal, setShowPriceEditModal] = useState(false);
  const [editingPriceMed, setEditingPriceMed] = useState(null);
  const [priceEditForm, setPriceEditForm] = useState({
    pack_price: '',
    wholesale_pack_price: '',
    strip_price: '',
    unit_price: '',
    min_stock_alert: 10
  });
  const [priceSaving, setPriceSaving] = useState(false);

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
    expiry_date: '',
    pack_price: '',
    strip_price: '',
    unit_price: '',
    allow_strip_sales: true,
    allow_unit_sales: true
  });

  // Interactive Guided Feature Tour Modal State
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

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
    const token = isDemoGuest ? null : localStorage.getItem('pharmahub_token');
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
      fetchWholesalers();
    } catch (err) {
      console.error(err);
      showToast('Error connecting to pharmacy server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setStaffLoading(true);
    try {
      const res = await authFetch('/api/organization/staff');
      const data = await res.json();
      if (res.ok) {
        setStaffList(data.staff || []);
      } else {
        showToast(data.error || 'Failed to fetch staff', 'error');
      }
    } catch {
      showToast('Failed to connect to staff endpoint', 'error');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/organization/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Staff member added successfully!', 'success');
        setShowStaffModal(false);
        setNewStaffForm({
          name: '',
          email: '',
          password: '',
          role: 'staff',
          staff_title: 'Staff Pharmacist',
          allowed_departments: ['All'],
          permissions: ['pos', 'inventory_read']
        });
        fetchStaffList();
      } else {
        showToast(data.error || 'Failed to add staff', 'error');
      }
    } catch {
      showToast('Failed to submit staff form', 'error');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const res = await authFetch(`/api/organization/staff/${staffId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Staff member removed', 'success');
        fetchStaffList();
      } else {
        showToast(data.error || 'Failed to delete staff', 'error');
      }
    } catch {
      showToast('Failed to delete staff', 'error');
    }
  };

  const handleUpgradePlan = async (tierId) => {
    try {
      const res = await authFetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Upgraded to ${tierId.toUpperCase()}!`, 'success');
        const updatedUser = { ...currentUser, subscription_tier: tierId };
        setCurrentUser(updatedUser);
        localStorage.setItem('pharmahub_user', JSON.stringify(updatedUser));
        setShowSubscriptionModal(false);
        setMpesaCheckoutPlan(null);
      } else {
        showToast(data.error || 'Upgrade failed', 'error');
      }
    } catch {
      showToast('Upgrade request failed', 'error');
    }
  };

  const handleSimulateMpesaPayment = async (plan) => {
    if (!mpesaPhone || mpesaPhone.trim().length < 9) {
      showToast('Please enter your valid Safaricom M-Pesa phone number (e.g. 0712345678)', 'error');
      return;
    }
    setMpesaCheckoutLoading(true);
    // Simulate Daraja STK Push prompt delay
    await new Promise(r => setTimeout(r, 1600));

    const receiptCode = 'QA' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setMpesaSuccessReceipt({
      code: receiptCode,
      amount: plan.price,
      phone: mpesaPhone,
      tier: plan.name,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    setMpesaCheckoutLoading(false);

    // Automatically apply plan upgrade on successful mock verification
    await handleUpgradePlan(plan.id);
  };

  const fetchAccounting = async () => {
    setAccountingLoading(true);
    try {
      const res = await authFetch('/api/accounting/summary');
      const data = await res.json();
      if (res.ok) {
        setAccountingData(data);
      } else {
        showToast(data.error || 'Failed to load accounting data', 'error');
      }
    } catch {
      showToast('Accounting server error', 'error');
    } finally {
      setAccountingLoading(false);
    }
  };

  const exportAccountingCSV = () => {
    if (!accountingData) return;
    const rows = [
      ['PharmaHub Executive Accounting & P&L Report'],
      ['Generated At', new Date().toLocaleString()],
      ['Pharmacy / Hospital', settings.pharmacy_name],
      [],
      ['Financial Metric', 'Amount'],
      ['Gross Sales Revenue', `${settings.currency_symbol} ${Number(accountingData.revenue || 0).toLocaleString()}`],
      ['Cost of Goods Sold (COGS)', `${settings.currency_symbol} ${Number(accountingData.cogs || 0).toLocaleString()}`],
      ['Gross Profit Margin Amount', `${settings.currency_symbol} ${Number(accountingData.grossProfit || 0).toLocaleString()}`],
      ['Gross Margin Percentage', `${accountingData.margin || 0}%`],
      ['Total Prescriptions Dispensed', accountingData.totalPrescriptions || 0],
      ['Average Order Value (AOV)', `${settings.currency_symbol} ${Number(accountingData.aov || 0).toLocaleString()}`],
      ['Outstanding Customer Trust Loans', `${settings.currency_symbol} ${Number(accountingData.loansOutstanding || 0).toLocaleString()}`],
      [],
      ['Payment Method Breakdown', 'Volume'],
      ...Object.entries(accountingData.paymentMethods || {}).map(([k, v]) => [k, `${settings.currency_symbol} ${Number(v).toLocaleString()}`])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PharmaHub_Accounting_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (activeTab === 'staff' && currentUser?.role === 'admin') {
      fetchStaffList();
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
    if (activeTab === 'sales' && salesSubView === 'accounting') {
      fetchAccounting();
    }
  }, [activeTab, salesSubView]);

  useEffect(() => {
    fetchAllData();
  }, [isDemoGuest]);

  // Verify persistent authentication session on mount
  useEffect(() => {
    const token = localStorage.getItem('pharmahub_token');
    if (!token) return;
    authFetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('pharmahub_user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('pharmahub_user');
          localStorage.removeItem('pharmahub_token');
          setCurrentUser(null);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Google Client ID and other runtime auth configs dynamically from backend
  useEffect(() => {
    fetch('/api/auth/config')
      .then(r => r.json())
      .then(data => {
        if (data?.googleClientId) {
          setGoogleClientId(data.googleClientId);
        }
      })
      .catch(() => {});
  }, []);

  // Automatic Google One Tap login prompt on visit (just like other modern websites)
  useEffect(() => {
    if (currentUser || isDemoGuest) return;
    const activeClientId = googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!activeClientId) return;

    const initGis = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: (response) => {
              if (response?.credential) {
                handleGoogleLogin({ credential: response.credential });
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });
          window.google.accounts.id.prompt();

          const landingEl = document.getElementById('google-btn-landing-official');
          if (landingEl) {
            landingEl.innerHTML = '';
            window.google.accounts.id.renderButton(landingEl, {
              theme: isDarkMode ? 'filled_black' : 'outline',
              size: 'large',
              shape: 'pill',
              width: 320,
              text: 'continue_with'
            });
            setGoogleButtonReady(true);
          }

          const modalEl = document.getElementById('google-btn-modal-official');
          if (modalEl) {
            modalEl.innerHTML = '';
            window.google.accounts.id.renderButton(modalEl, {
              theme: isDarkMode ? 'filled_black' : 'outline',
              size: 'large',
              shape: 'pill',
              width: 280,
              text: 'continue_with'
            });
            setGoogleButtonReady(true);
          }
        } catch (err) {
          console.warn('Google One Tap auto prompt:', err);
        }
      }
    };
    const timer = setTimeout(initGis, 800);
    return () => clearTimeout(timer);
  }, [currentUser, isDemoGuest, googleClientId, showAuthModal, isDarkMode]);

  // Filtered medicines for POS
  const filteredMeds = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch =
        m.brand_name.toLowerCase().includes(posSearch.toLowerCase()) ||
        (m.molecule_name && m.molecule_name.toLowerCase().includes(posSearch.toLowerCase())) ||
        (m.barcode && m.barcode.includes(posSearch)) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(posSearch.toLowerCase()));

      const matchCat = posCategory === 'All' || m.category === posCategory;
      const matchDept = selectedFormCategory === 'All' || m.form_category === selectedFormCategory;
      return matchSearch && matchCat && matchDept;
    });
  }, [medicines, posSearch, posCategory, selectedFormCategory]);

  // Filtered medicines for Drug Catalog / Medicines tab
  const filteredCatalogMeds = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch = !medCatalogSearch.trim() ||
        m.brand_name.toLowerCase().includes(medCatalogSearch.toLowerCase()) ||
        (m.molecule_name && m.molecule_name.toLowerCase().includes(medCatalogSearch.toLowerCase())) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(medCatalogSearch.toLowerCase()));

      const matchDept = medCatalogFormCategory === 'All' || m.form_category === medCatalogFormCategory;
      return matchSearch && matchDept;
    });
  }, [medicines, medCatalogSearch, medCatalogFormCategory]);

  // Handle Quick Price & Wholesale Cost Edit
  const handleOpenPriceEdit = (med) => {
    setEditingPriceMed(med);
    setPriceEditForm({
      pack_price: med.pack_price != null ? String(med.pack_price) : '',
      wholesale_pack_price: med.wholesale_pack_price != null ? String(med.wholesale_pack_price) : (med.avg_cost_price != null ? String(med.avg_cost_price) : ''),
      strip_price: med.strip_price != null ? String(med.strip_price) : '',
      unit_price: med.unit_price != null ? String(med.unit_price) : '',
      min_stock_alert: med.min_stock_alert != null ? String(med.min_stock_alert) : '10',
      allow_strip_sales: med.allow_strip_sales !== 0,
      allow_unit_sales: med.allow_unit_sales !== 0
    });
    setShowPriceEditModal(true);
  };

  const handleSavePriceEdit = async (e) => {
    e?.preventDefault();
    if (!editingPriceMed) return;
    if (!priceEditForm.pack_price || isNaN(Number(priceEditForm.pack_price))) {
      showToast('Please enter a valid retail pack price', 'error');
      return;
    }

    try {
      setPriceSaving(true);
      const res = await authFetch(`/api/medicines/${editingPriceMed.id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_price: Number(priceEditForm.pack_price),
          wholesale_pack_price: priceEditForm.wholesale_pack_price ? Number(priceEditForm.wholesale_pack_price) : null,
          strip_price: priceEditForm.strip_price ? Number(priceEditForm.strip_price) : null,
          unit_price: priceEditForm.unit_price ? Number(priceEditForm.unit_price) : null,
          min_stock_alert: priceEditForm.min_stock_alert ? Number(priceEditForm.min_stock_alert) : 10,
          allow_strip_sales: priceEditForm.allow_strip_sales,
          allow_unit_sales: priceEditForm.allow_unit_sales
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Prices updated for ${editingPriceMed.brand_name}!`, 'success');
        setShowPriceEditModal(false);
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to update price', 'error');
      }
    } catch (err) {
      showToast('Error saving price', 'error');
    } finally {
      setPriceSaving(false);
    }
  };

  const handleAutoCalculatePrices = () => {
    if (!editingPriceMed || !priceEditForm.pack_price) return;
    const pack = Number(priceEditForm.pack_price);
    const unitsPerPack = Number(editingPriceMed.units_per_pack) || 1;
    const unitsPerStrip = Number(editingPriceMed.units_per_strip) || 10;
    
    const unitPrice = (pack / unitsPerPack).toFixed(2);
    const stripsPerPack = unitsPerPack / unitsPerStrip;
    const stripPrice = stripsPerPack > 0 ? (pack / stripsPerPack).toFixed(2) : null;

    setPriceEditForm(prev => ({
      ...prev,
      unit_price: unitPrice,
      strip_price: stripPrice || prev.strip_price
    }));
    showToast('Auto-calculated strip & unit prices based on box price', 'info');
  };

  // Helper when selecting a medicine in Restock Modal: Pre-fill on-hand info & prices
  const handleBatchMedicineSelect = (medicineId) => {
    const med = medicines.find(m => String(m.id) === String(medicineId));
    if (med) {
      setNewBatchForm(prev => ({
        ...prev,
        medicine_id: medicineId,
        pack_price: med.pack_price != null ? String(med.pack_price) : '',
        strip_price: med.strip_price != null ? String(med.strip_price) : '',
        unit_price: med.unit_price != null ? String(med.unit_price) : '',
        cost_price_per_pack: med.wholesale_pack_price != null ? String(med.wholesale_pack_price) : (med.avg_cost_price != null ? String(med.avg_cost_price) : prev.cost_price_per_pack),
        allow_strip_sales: med.allow_strip_sales !== 0,
        allow_unit_sales: med.allow_unit_sales !== 0
      }));
    } else {
      setNewBatchForm(prev => ({ ...prev, medicine_id: medicineId }));
    }
  };

  const handleAutoCalcBatchPrices = () => {
    const med = medicines.find(m => String(m.id) === String(newBatchForm.medicine_id));
    if (!med || !newBatchForm.pack_price) return;
    const pack = Number(newBatchForm.pack_price);
    const unitsPerPack = Number(med.units_per_pack) || 1;
    const unitsPerStrip = Number(med.units_per_strip) || 10;
    const unitPrice = (pack / unitsPerPack).toFixed(2);
    const stripsPerPack = unitsPerPack / unitsPerStrip;
    const stripPrice = stripsPerPack > 0 ? (pack / stripsPerPack).toFixed(2) : null;

    setNewBatchForm(prev => ({
      ...prev,
      unit_price: unitPrice,
      strip_price: stripPrice || prev.strip_price
    }));
    showToast('Auto-calculated strip & unit prices based on box price', 'info');
  };

  // Handle Brand vs Generic Alternatives Lookup + Web Market Benchmark
  const handleOpenAlternatives = async (medicine) => {
    try {
      setSelectedForAlternative(medicine);
      setActiveAltSubTab('inventory');
      setBenchmarkLoading(true);
      setShowAlternativeModal(true);

      const [altRes, marketRes] = await Promise.all([
        authFetch(`/api/medicines/${medicine.id}/alternatives`).then(r => r.json()),
        authFetch(`/api/market-prices?q=${encodeURIComponent(medicine.molecule_name || medicine.brand_name)}`).then(r => r.json())
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
      const res = await authFetch(`/api/market-prices?q=${encodeURIComponent(marketSearchQuery.trim())}`).then(r => r.json());
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

      const res = await authFetch('/api/sales', {
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
        const receiptDetails = await authFetch(`/api/sales/${data.sale_id}`).then(r => r.json());
        setCurrentReceipt(receiptDetails);
        setShowReceiptModal(true);
        setShowMobileCart(false);

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

  const handleSoloSaleSubmit = async (salePayload) => {
    try {
      const payload = {
        customer_name: salePayload.customer_name || 'Walk-in Patient',
        customer_phone: salePayload.customer_phone || '',
        payment_method: salePayload.payment_method === 'credit' ? 'loan' : salePayload.payment_method,
        prescribing_doctor: '',
        prescription_number: '',
        discount: Number(salePayload.discount || 0),
        items: salePayload.items.map(it => ({
          drug_id: it.drug_id,
          unit_type: it.unit_type,
          quantity: it.quantity,
          unit_price: it.unit_price,
          drug_name: it.drug_name
        }))
      };

      const res = await authFetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          salePayload.payment_method === 'credit'
            ? 'Customer loan recorded!'
            : `Sale completed! Receipt #${data.receipt_number || data.sale_id}`,
          'success'
        );
        fetchAllData();
        return { success: true, sale_id: data.sale_id, receipt_number: data.receipt_number };
      } else {
        showToast(data.error || 'Sale failed', 'error');
        throw new Error(data.error || 'Sale failed');
      }
    } catch (err) {
      showToast(err.message || 'Checkout failed', 'error');
      throw err;
    }
  };

  // User Auth Handlers
  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!authForm.email || !authForm.password) {
      showToast('Please enter both email and password', 'error');
      return;
    }
    const cleanEmail = authForm.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      showToast('Please enter a genuine, valid email address', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: authForm.password })
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
    if (!authForm.name?.trim() || !authForm.email?.trim() || !authForm.password || !authForm.pharmacy_name?.trim()) {
      showToast('Name, email, password, and pharmacy name are required', 'error');
      return;
    }

    const cleanEmail = authForm.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      showToast('Please enter a genuine, valid email address (e.g. name@domain.com)', 'error');
      return;
    }

    if (authForm.phone && authForm.phone.trim()) {
      const cleanPhone = authForm.phone.trim();
      const phoneDigits = cleanPhone.replace(/\D/g, '');
      if (phoneDigits.length < 8 || phoneDigits.length > 15 || !/^\+?[0-9\s\-()]{8,20}$/.test(cleanPhone)) {
        showToast('Please enter a genuine phone number with valid digits', 'error');
        return;
      }
    }

    if (authForm.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...authForm,
          email: cleanEmail,
          name: authForm.name.trim(),
          pharmacy_name: authForm.pharmacy_name.trim(),
          phone: authForm.phone?.trim() || ''
        })
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

  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('pharmahub_user');
    localStorage.removeItem('pharmahub_token');
    setCurrentUser(null);
    setIsDemoGuest(false);
    showToast('Signed out. See you next time!', 'success');
    fetchAllData();
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
    const activeClientId = googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && activeClientId) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification?.isNotDisplayed() || notification?.isSkippedMoment()) {
            setShowAuthModal(true);
          }
        });
        return;
      } catch (e) {
        console.warn('Google One Tap prompt failed', e);
      }
    }
    if (!activeClientId) {
      showToast('To enable Google Sign-In, add your GOOGLE_CLIENT_ID in Render environment variables.', 'info');
    }
    setShowAuthModal(true);
  };

  // Phone Number Login Handler
  const handlePhoneLogin = async (e) => {
    e?.preventDefault();
    if (!phoneLoginForm.phone?.trim() || !phoneLoginForm.password) {
      showToast('Please enter both your phone number and password', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneLoginForm.phone.trim(),
          password: phoneLoginForm.password
        })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('pharmahub_user', JSON.stringify(data.user));
        localStorage.setItem('pharmahub_token', data.token);
        setCurrentUser(data.user);
        setIsDemoGuest(false);
        setShowAuthModal(false);
        showToast(`Welcome back, ${data.user.name}! 🎉`, 'success');
        fetchAllData();
      } else {
        showToast(data.error || 'Phone login failed', 'error');
      }
    } catch (err) {
      showToast('Error signing in with phone', 'error');
    }
  };

  // Record Repayment
  const handleRecordRepayment = async (e) => {
    e.preventDefault();
    if (!selectedLoanForRepayment) return;
    try {
      const res = await authFetch(`/api/loans/${selectedLoanForRepayment.id}/repayments`, {
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

      const res = await authFetch('/api/medicines', {
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

  // Add Batch Submit (with dual pricing and smart lot detection)
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatchForm)
      });
      const data = await res.json();
      if (data.success) {
        if (data.isToppedUp) {
          showToast(`Topped up batch ${newBatchForm.batch_number} (+${newBatchForm.packs_received} packs) and updated pricing!`, 'success');
        } else {
          showToast('New stock batch and custom pharmacy prices saved!', 'success');
        }
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
      await authFetch('/api/settings', {
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

  // Wholesalers & Live Restock Directory Helpers
  const fetchWholesalers = async () => {
    try {
      setWholesalerLoading(true);
      const res = await fetch('/api/wholesalers');
      const data = await res.json();
      setWholesalersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching wholesalers:', err);
    } finally {
      setWholesalerLoading(false);
    }
  };

  const fetchWholesalerCatalog = async (wholesaler) => {
    try {
      setSelectedWholesaler(wholesaler);
      setWholesalerLoading(true);
      const res = await fetch(`/api/wholesalers/${wholesaler.id}/catalog`);
      const data = await res.json();
      setWholesalerCatalog(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error loading wholesaler catalog', 'error');
    } finally {
      setWholesalerLoading(false);
    }
  };

  const searchWholesaleDrug = async (drugName) => {
    if (!drugName || drugName.trim().length < 2) return;
    try {
      setWholesalerLoading(true);
      const res = await fetch(`/api/wholesalers/search-drug?q=${encodeURIComponent(drugName.trim())}`);
      const data = await res.json();
      setWholesalerDrugMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error searching drug in wholesalers:', err);
    } finally {
      setWholesalerLoading(false);
    }
  };

  const fetchWholesaleOrders = async (wholesalerId = 1) => {
    try {
      const res = await fetch(`/api/wholesalers/${wholesalerId}/orders`);
      const data = await res.json();
      setWholesaleOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching wholesale orders:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/wholesalers/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Dispatch updated', 'success');
        fetchWholesaleOrders(selectedWholesaler?.id || 1);
      } else {
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch {
      showToast('Error updating delivery status', 'error');
    }
  };



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
              <span>Multi-Portal Healthcare & Distribution Network</span>
            </div>

            {/* 3-Portal Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              <button
                type="button"
                onClick={() => {
                  setLandingPortalCategory('solo');
                  setAuthForm(f => ({ ...f, account_type: 'solo' }));
                  setShowPortalLoginModal(true);
                }}
                className={`p-4 rounded-2xl border text-left transition apple-spring group ${
                  landingPortalCategory === 'solo'
                    ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg mb-3">
                  💊
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition">Solo Pharmacy</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Community chemist, brand vs generic, patient debt loans</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-emerald-400">30-Day Free Trial</span>
                  <span className="text-xs text-slate-400 group-hover:translate-x-1 transition">Enter →</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLandingPortalCategory('organization');
                  setAuthForm(f => ({ ...f, account_type: 'organization' }));
                  setShowPortalLoginModal(true);
                }}
                className={`p-4 rounded-2xl border text-left transition apple-spring group ${
                  landingPortalCategory === 'organization'
                    ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg mb-3">
                  🏥
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition">Enterprise Hub</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Hospital chains, multi-staff roles (Vet, Ointment), executive P&L</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-cyan-400">Admin Setup</span>
                  <span className="text-xs text-slate-400 group-hover:translate-x-1 transition">Enter →</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLandingPortalCategory('wholesale');
                  setAuthForm(f => ({ ...f, account_type: 'wholesale' }));
                  setShowPortalLoginModal(true);
                }}
                className={`p-4 rounded-2xl border text-left transition apple-spring group ${
                  landingPortalCategory === 'wholesale'
                    ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg mb-3">
                  🏭
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition">Wholesale Hub</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">Distributor warehouse stock, live chemist restock orders</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-amber-400">Bulk Restock</span>
                  <span className="text-xs text-slate-400 group-hover:translate-x-1 transition">Enter →</span>
                </div>
              </button>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              {landingPortalCategory === 'solo' && (
                <>
                  Dispense smarter. <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Compare generics. Save customers money.
                  </span>
                </>
              )}
              {landingPortalCategory === 'organization' && (
                <>
                  Enterprise Pharmacy. <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
                    Multi-staff roles, Vet medicines & P&L accounting.
                  </span>
                </>
              )}
              {landingPortalCategory === 'wholesale' && (
                <>
                  Wholesale Distribution. <br />
                  <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                    Live warehouse stock connected directly to chemists.
                  </span>
                </>
              )}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              {landingPortalCategory === 'solo' &&
                'PharmaHub equips community pharmacies with 3-tier brand vs generic price intelligence, FEFO expiry safety, and patient trust loans with 1-click WhatsApp reminders.'
              }
              {landingPortalCategory === 'organization' &&
                'Designed for hospitals, clinics, and multi-branch pharmacy chains. Full role-based staff isolation (Veterinary, Ointments, Dispensing), professional domain emails, and complete financial accounting.'
              }
              {landingPortalCategory === 'wholesale' &&
                'Connect your bulk pharmaceutical warehouse directly to hundreds of ordering chemists and hospitals. Real-time stock visibility, phone call orders, and automated low-stock restock alerts.'
              }
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
                <span>30-Day Free Trial (1 Full Month)</span>
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
            <div className="liquid-glass text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden apple-spring">
              
              {/* Apple Segmented Control for Sign In vs Register */}
              <div className="flex bg-black/[0.05] dark:bg-white/[0.08] p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition apple-spring ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition apple-spring ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="mb-5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-2.5 bg-black/[0.04] dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                  <span>{landingPortalCategory === 'solo' ? '💊 Solo Pharmacy Portal' : landingPortalCategory === 'organization' ? '🏥 Enterprise Hospital Portal' : '🏭 Wholesale Distribution Portal'}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {authMode === 'login'
                    ? (landingPortalCategory === 'wholesale' ? 'Sign in to Wholesale Hub' : landingPortalCategory === 'organization' ? 'Sign in to Enterprise Hub' : 'Sign in to Pharmacy Hub')
                    : (landingPortalCategory === 'wholesale' ? 'Register Wholesale Depot' : landingPortalCategory === 'organization' ? 'Register Enterprise Account' : 'Set up your Solo Pharmacy')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {authMode === 'login'
                    ? 'Sign in with Google, phone number, or work email to access your workspace'
                    : 'Includes full-featured 30-Day Free Trial (1 Month) with zero card required'}
                </p>
              </div>

              {/* 1. Primary One-Click Google Sign In */}
              <div className="mb-4">
                <div id="google-btn-landing-official" className="flex justify-center empty:hidden min-h-[44px]"></div>
                {!googleButtonReady && (
                  <button
                    type="button"
                    onClick={triggerGoogleSignIn}
                    className="w-full py-3 px-4 bg-white/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] font-semibold text-sm text-slate-700 dark:text-slate-200 rounded-2xl flex items-center justify-center space-x-3 transition shadow-sm apple-press"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>

              {/* In Login mode: show sub-switcher for Email vs Phone login */}
              {authMode === 'login' && (
                <div className="flex bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition apple-spring flex items-center justify-center gap-1.5 ${
                      authMethod === 'email'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>✉️ Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition apple-spring flex items-center justify-center gap-1.5 ${
                      authMethod === 'phone'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>📱 Phone Number</span>
                  </button>
                </div>
              )}

              {authMode === 'register' && (
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/[0.08] dark:border-white/[0.1]"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white/80 dark:bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">or register with email</span>
                  </div>
                </div>
              )}

              {/* Login with Phone Number */}
              {authMode === 'login' && authMethod === 'phone' && (
                <form onSubmit={handlePhoneLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Registered Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 700 000 000"
                      value={phoneLoginForm.phone}
                      onChange={e => setPhoneLoginForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password / Security PIN</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={phoneLoginForm.password}
                      onChange={e => setPhoneLoginForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-600/30 text-sm mt-2 apple-spring"
                  >
                    Sign In with Phone
                  </button>
                </form>
              )}

              {/* Standard Email Form (Login or Register) */}
              {(authMode === 'register' || (authMode === 'login' && authMethod === 'email')) && (
                <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
                  {authMode === 'register' && (
                    <>
                      {/* Account Type Selector (Solo vs Organization vs Wholesale) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Portal & Account Category</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => { setAuthForm(f => ({ ...f, account_type: 'solo' })); setLandingPortalCategory('solo'); }}
                            className={`p-2 rounded-xl border text-left transition apple-spring ${
                              authForm.account_type === 'solo'
                                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                                : 'border-black/[0.08] dark:border-white/[0.1] bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="text-base block mb-0.5">💊</span>
                            <span className="text-xs block font-bold leading-tight">Pharmacy</span>
                            <span className="text-[9px] block opacity-75">Community Chemist</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => { setAuthForm(f => ({ ...f, account_type: 'organization' })); setLandingPortalCategory('organization'); }}
                            className={`p-2 rounded-xl border text-left transition apple-spring ${
                              authForm.account_type === 'organization'
                                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                                : 'border-black/[0.08] dark:border-white/[0.1] bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="text-base block mb-0.5">🏥</span>
                            <span className="text-xs block font-bold leading-tight">Enterprise</span>
                            <span className="text-[9px] block opacity-75">Hospitals & Chains</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => { setAuthForm(f => ({ ...f, account_type: 'wholesale' })); setLandingPortalCategory('wholesale'); }}
                            className={`p-2 rounded-xl border text-left transition apple-spring ${
                              authForm.account_type === 'wholesale'
                                ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                                : 'border-black/[0.08] dark:border-white/[0.1] bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="text-base block mb-0.5">🏭</span>
                            <span className="text-xs block font-bold leading-tight">Wholesale</span>
                            <span className="text-[9px] block opacity-75">Bulk Distributor</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Dr. Faith Mwangi"
                          value={authForm.name}
                          onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {authForm.account_type === 'organization' ? 'Organization / Hospital Name' : 'Pharmacy / Chemist Name'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={authForm.account_type === 'organization' ? 'Metro Health Hospital Network' : 'CarePoint Community Pharmacy'}
                          value={authForm.pharmacy_name}
                          onChange={e => setAuthForm(f => ({ ...f, pharmacy_name: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>

                      {authForm.account_type === 'organization' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Organization Professional Work Domain (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. metrohealth.org or nairobihospital.com"
                            value={authForm.work_domain}
                            onChange={e => setAuthForm(f => ({ ...f, work_domain: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Allows staff with professional emails to be auto-associated under your license.</p>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Genuine Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="pharmacist@example.com"
                      value={authForm.email}
                      onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder={authMode === 'register' ? 'Choose a secure password (min 6)' : 'Enter your password'}
                      value={authForm.password}
                      onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                        <select
                          value={authForm.currency_symbol || detectedLocale.currency}
                          onChange={e => setAuthForm(f => ({ ...f, currency_symbol: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
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
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+254 700 000 000"
                          value={authForm.phone}
                          onChange={e => setAuthForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white/70 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-600/30 text-sm mt-2 apple-spring"
                  >
                    {authMode === 'login' ? 'Sign In to My Pharmacy' : 'Create Free Account & Start'}
                  </button>
                </form>
              )}

              <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] text-center">
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

        {/* Blurred Background Portal Login / Register Modal Dialog */}
        {showPortalLoginModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4 my-8 relative">
              <button
                type="button"
                onClick={() => setShowPortalLoginModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${
                  landingPortalCategory === 'wholesale' ? 'bg-amber-500/20 text-amber-500' : landingPortalCategory === 'organization' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-emerald-500/20 text-emerald-500'
                }`}>
                  {landingPortalCategory === 'wholesale' ? '🏭' : landingPortalCategory === 'organization' ? '🏥' : '💊'}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {landingPortalCategory === 'wholesale' ? 'Wholesale Hub Access' : landingPortalCategory === 'organization' ? 'Enterprise Hospital Hub' : 'Solo Pharmacy Chemist'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {authMode === 'login' ? 'Input your account credentials below' : 'First-time setup: Create Administrator Account'}
                  </p>
                </div>
              </div>

              {/* Segmented Sign In vs Register toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs transition apple-spring ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In (Admin / Staff)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs transition apple-spring ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Register (First Time)
                </button>
              </div>

              {/* One-click Google Sign In */}
              <button
                type="button"
                onClick={triggerGoogleSignIn}
                className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 font-semibold text-xs text-slate-700 dark:text-slate-200 rounded-2xl flex items-center justify-center space-x-2 transition shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-bold">or use credentials</span>
                </div>
              </div>

              {/* Form Input for Name / Email & Password */}
              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Administrator Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. John Mwangi"
                        value={authForm.name}
                        onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {landingPortalCategory === 'wholesale' ? 'Distributor Depot Name' : landingPortalCategory === 'organization' ? 'Hospital / Organization Name' : 'Pharmacy / Chemist Name'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={landingPortalCategory === 'wholesale' ? 'Nairobi Med Distributors Ltd' : landingPortalCategory === 'organization' ? 'Metropolitan Health Hospital' : 'CarePoint Pharmacy'}
                        value={authForm.pharmacy_name}
                        onChange={e => setAuthForm(f => ({ ...f, pharmacy_name: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email / Work Account</label>
                  <input
                    type="email"
                    required
                    placeholder="user@hospital.com or pharmacist@domain.com"
                    value={authForm.email}
                    onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter account password (min 6 chars)"
                    value={authForm.password}
                    onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/30 transition apple-spring mt-2"
                >
                  {authMode === 'login' ? 'Sign In & Enter Hub' : 'Complete Setup & Start 30-Day Free Trial'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F7] dark:bg-[#0B0B0E] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Toast Notification — Apple-style */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-sm font-semibold apple-spring ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-500/30'
              : 'bg-emerald-600 text-white shadow-emerald-500/30'
          }`}
          style={{ boxShadow: notification.type === 'error' ? '0 8px 32px rgba(225,29,72,0.35)' : '0 8px 32px rgba(5,150,105,0.35)' }}
        >
          {notification.type === 'error' ? <AlertTriangle className="w-4.5 h-4.5 shrink-0" /> : <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 dark:bg-[#0D0D11] text-slate-300 border-r border-slate-800 dark:border-white/[0.06] select-none shrink-0">
        <div className="p-5 flex items-center space-x-3 border-b border-slate-800 dark:border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
            <Pill className="w-5 h-5 transform -rotate-45" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm leading-tight truncate">{settings.pharmacy_name}</h1>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isDemoGuest ? 'Demo Mode' : `${settings.currency_symbol} Active`}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5">
          {[
            { id: 'pos', icon: ShoppingCart, label: 'POS & Dispense', permission: 'pos', badge: cart.length > 0 ? cart.length : null, badgeColor: 'bg-emerald-400 text-slate-950' },
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard', badge: dashboardData?.expiringCount > 0 ? dashboardData.expiringCount : null, badgeColor: 'bg-amber-500 text-slate-950' },
            { id: 'loans', icon: HandCoins, label: 'Trust Loans', permission: 'loans', badge: overdueLoansCount > 0 ? `${overdueLoansCount} due` : null, badgeColor: 'bg-rose-500 text-white animate-pulse' },
            { id: 'inventory', icon: Pill, label: 'Medicines & Pricing', permission: 'inventory_read', badge: null },
            { id: 'batches', icon: Boxes, label: 'Batches & Expiry', permission: 'inventory_write', badge: null },
            { id: 'sales', icon: Receipt, label: 'Sales & Accounting', permission: 'accounting', badge: null },
            ...(currentUser?.role === 'admin' ? [{ id: 'staff', icon: Users, label: 'Staff & Roles', permission: 'staff_management', badge: staffList?.length ? `${staffList.length}` : null, badgeColor: 'bg-blue-500 text-white' }] : []),
            { id: 'wholesalers', icon: Building2, label: 'Wholesale Hub', permission: 'wholesalers', badge: 'Live', badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
            ...(currentUser?.role === 'admin' ? [{ id: 'settings', icon: Settings, label: 'Settings', permission: 'settings', badge: null }] : []),
          ].filter(({ permission }) => {
            // Admins see EVERYTHING
            if (!currentUser || currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;
            // Staff only see what the Admin permitted
            const userPerms = Array.isArray(currentUser.permissions) ? currentUser.permissions : [];
            if (permission === 'dashboard' || permission === 'wholesalers') return true;
            return userPerms.includes(permission);
          }).map(({ id, icon: Icon, label, badge, badgeColor }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all apple-spring ${
                activeTab === id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'hover:bg-slate-800 dark:hover:bg-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="truncate">{label}</span>
              {badge !== null && (
                <span className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Subscription & Free Trial Status Pill in Desktop Sidebar */}
        <div className="p-3 mx-2.5 mb-2 bg-gradient-to-br from-slate-800/80 to-slate-800/40 dark:from-white/[0.04] dark:to-white/[0.02] border border-white/10 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className={`px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
              currentUser?.subscription_tier?.includes('enterprise') || currentUser?.subscription_tier?.includes('premium')
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {currentUser?.subscription_tier ? currentUser.subscription_tier.replace('_', ' ').toUpperCase() : 'FREE TRIAL'}
            </span>
            {currentUser?.trial_days_remaining !== undefined && (
              <span className="text-[10px] text-slate-400">
                {currentUser.trial_days_remaining > 0 ? `${currentUser.trial_days_remaining}d trial left` : '30-Day Free Trial'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-[11px] truncate">
                {currentUser?.account_type === 'organization' ? 'Organization Plan' : 'Community Chemist'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.staff_title || (currentUser?.role === 'admin' ? 'Administrator' : 'Staff')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-[11px] transition text-center flex items-center justify-center space-x-1 shadow-xs"
          >
            <span>Upgrade Plan</span>
            <span>↗</span>
          </button>
        </div>

        {/* User Card in Sidebar Footer */}
        {currentUser && (
          <div className="p-3 border-t border-slate-800 dark:border-white/[0.06]">
            <div className="flex items-center space-x-2.5 p-2.5 bg-slate-800/70 dark:bg-white/[0.04] rounded-xl">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name?.split(' ')[0] || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
              </div>
              <button onClick={handleLogout} title="Sign Out" className="text-slate-500 hover:text-red-400 transition p-1">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header — Apple frosted glass */}
        <header className="h-14 apple-glass border-b border-black/[0.06] dark:border-white/[0.07] px-3 md:px-5 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
            <div className="md:hidden w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm active:scale-95 transition">
              <Pill className="w-4.5 h-4.5 transform -rotate-45" />
            </div>
            <div className="shrink-0">
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white capitalize flex items-center gap-1.5 leading-tight whitespace-nowrap">
                {activeTab === 'pos' && 'Dispensing Counter'}
                {activeTab === 'dashboard' && 'Pharmacy Dashboard'}
                {activeTab === 'loans' && 'Trust Loans & Credits'}
                {activeTab === 'inventory' && 'Medicines & Pricing'}
                {activeTab === 'batches' && 'Batches & Expiry'}
                {activeTab === 'sales' && 'Sales & Accounting'}
                {activeTab === 'staff' && 'Organization Staff & RBAC'}
                {activeTab === 'wholesalers' && 'Wholesale Catalog & Live Restock Hub'}
                {activeTab === 'settings' && 'Settings'}
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block whitespace-nowrap">PharmaHub • Smart Pharmacy OS</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 overflow-x-hidden">
            {/* Subscription & Trial Pill in Header */}
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition apple-spring min-h-[38px] active:scale-95"
              title="View Subscription & Free Trial Status"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">
                {currentUser?.subscription_tier ? currentUser.subscription_tier.replace('_', ' ').toUpperCase() : 'FREE TRIAL'}
              </span>
            </button>

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
              className="cursor-pointer hidden sm:flex items-center space-x-1 px-2 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold transition apple-spring min-h-[36px]"
              title="Click to apply detected local currency"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{settings.currency_symbol}</span>
            </div>

            {/* Quick Restock Trigger (Mobile Optimized Icon) */}
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="flex sm:hidden p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 bg-emerald-500/10 border border-emerald-300/60 dark:border-emerald-700/40 rounded-xl transition apple-spring min-w-[38px] min-h-[38px] items-center justify-center active:scale-95"
              title="Quick Receive Stock"
            >
              <Boxes className="w-4 h-4" />
            </button>

            <button
              onClick={fetchAllData}
              className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition apple-spring min-w-[38px] min-h-[38px] flex items-center justify-center active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => { setTourStep(0); setShowFeatureTour(true); }}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/60 dark:border-indigo-700/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold transition apple-spring shadow-xs min-h-[38px] min-w-[38px] justify-center active:scale-95"
              title="Interactive System & Feature Tour"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden lg:inline">Feature Tour</span>
            </button>

            <button
              onClick={() => setShowAddMedicineModal(true)}
              className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition apple-spring shadow-sm min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Drug</span>
            </button>

            <button
              onClick={() => setShowAddBatchModal(true)}
              className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition apple-spring shadow-sm min-h-[38px]"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Restock</span>
            </button>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center space-x-1">
                <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 rounded-xl min-h-[38px]">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 max-w-[80px] truncate">
                    {currentUser.name?.split(' ')[0] || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition apple-spring min-h-[38px] min-w-[38px] justify-center active:scale-95"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </div>
            ) : isDemoGuest ? (
              <button
                onClick={() => { setIsDemoGuest(false); setShowAuthModal(true); setAuthMode('register'); }}
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition apple-spring shadow-sm min-h-[38px] active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden xs:inline">Create Account</span>
              </button>
            ) : (
              <button
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition apple-spring shadow-sm min-h-[38px] active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden xs:inline">Sign In</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(d => !d)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition apple-spring min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* Trial & Subscription Status Bar */}
        {currentUser?.trial_days_remaining !== undefined && (
          <div className="bg-gradient-to-r from-emerald-950/20 via-teal-950/15 to-blue-950/20 dark:bg-emerald-950/30 border-b border-black/[0.04] dark:border-white/[0.06] px-3 md:px-5 py-1.5 flex items-center justify-between text-[11px] shrink-0 transition-all select-none">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 shrink-0 border border-emerald-500/30">
                {currentUser.subscription_tier ? currentUser.subscription_tier.replace('_', ' ').toUpperCase() : '30-DAY TRIAL'}
              </span>
              <span className="text-slate-700 dark:text-slate-300 truncate font-medium">
                {currentUser.trial_days_remaining > 0
                  ? `Active 30-Day Free Trial: ${currentUser.trial_days_remaining} days left. Full access enabled.`
                  : 'Free Trial Expired: Upgrade to maintain multi-user and inventory dispensing access.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSubscriptionModal(true)}
              className="ml-2 font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 flex items-center space-x-1 text-xs active:scale-95 transition"
            >
              <span>{currentUser.trial_days_remaining > 0 ? 'View Plans' : 'Upgrade Now'}</span>
              <span>↗</span>
            </button>
          </div>
        )}

        {/* Demo Mode Banner — Apple-style floating pill */}
        {isDemoGuest && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700/40 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              <span className="text-xs font-semibold">Demo Mode</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 hidden sm:inline">· Previewing sample pharmacy data. Changes won't be saved.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowAuthModal(true); setAuthMode('register'); }}
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition apple-press"
              >
                Create Free Account
              </button>
              <button
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-6 p-4 md:p-5 bg-[#F5F5F7] dark:bg-[#0B0B0E]">
          {/* ============================================================ */}
          {/* 1. POS & DISPENSING TAB (Apple Liquid Glass SoloPOS) */}
          {activeTab === 'pos' && (
            <SoloPOS
              drugs={medicines}
              currency={currentUser?.currency_symbol || 'KSh'}
              onCompleteSale={handleSoloSaleSubmit}
              showToast={showToast}
            />
          )}

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

              {/* Wholesaler Procurement Portal & SaaS Enterprise Hub Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-xs shrink-0 border border-emerald-200/50 dark:border-white/10">
                      🏭
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                          {currentUser?.account_type === 'organization' ? 'ENTERPRISE B2B' : 'WHOLESALER NETWORK'}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          Wholesaler Direct Procurement & Multi-User Cloud
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                        Bulk restock orders directly with verified pharma distributors, batch certificates & automated receiving.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowSubscriptionModal(true)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs transition shadow-sm apple-spring shrink-0 flex items-center space-x-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Manage Plan</span>
                    </button>
                    {currentUser?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('staff')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm apple-spring shrink-0 flex items-center space-x-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Manage Staff</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>🏢 Connected Entity: <strong className="text-slate-800 dark:text-slate-200">{settings.pharmacy_name}</strong></span>
                  <span>🔒 Multi-Tenant Data Isolation Enabled · PBKDF2 Encrypted</span>
                  <span>📦 Next Bulk Delivery Window: Tomorrow 10:00 AM</span>
                </div>
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
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Store Drug Catalog & Wholesaler Pricing Guide</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Formulary guide across all departments. Easily adjust wholesaler purchase cost and selling prices per pharmacy.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddBatchModal(true)}
                      className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Receive Stock</span>
                    </button>
                    <button
                      onClick={() => setShowAddMedicineModal(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm apple-press"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Medicine</span>
                    </button>
                  </div>
                </div>

                {/* Search & Department Filters */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="w-4.5 h-4.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter catalog by brand, generic molecule, or manufacturer..."
                      value={medCatalogSearch}
                      onChange={(e) => setMedCatalogSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-slate-800 border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    {medCatalogSearch && (
                      <button
                        onClick={() => setMedCatalogSearch('')}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Department Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setMedCatalogFormCategory(dept.id)}
                        className={`px-2.5 py-1.5 rounded-xl font-bold transition apple-press shrink-0 text-[11px] flex items-center space-x-1.5 ${
                          medCatalogFormCategory === dept.id
                            ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{dept.icon}</span>
                        <span>{dept.label}</span>
                      </button>
                    ))}
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="text-[11px] text-slate-400 shrink-0 self-center">
                      {filteredCatalogMeds.length} items
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3">Brand & Strength</th>
                        <th className="pb-3">Department & Molecule</th>
                        <th className="pb-3">Wholesale Cost</th>
                        <th className="pb-3">Retail Box Price</th>
                        <th className="pb-3">Profit Margin</th>
                        <th className="pb-3">Sub-units</th>
                        <th className="pb-3">Stock (Boxes)</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                      {filteredCatalogMeds.map((med) => {
                        const cost = med.wholesale_pack_price || med.avg_cost_price || 0;
                        const hasMargin = cost > 0 && med.pack_price > 0;
                        const marginPct = hasMargin ? (((med.pack_price - cost) / med.pack_price) * 100).toFixed(1) : null;
                        const profit = hasMargin ? (med.pack_price - cost).toFixed(2) : null;

                        return (
                          <tr key={med.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
                            <td className="py-3 pr-2">
                              <p className="font-bold text-slate-900 dark:text-white">{med.brand_name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{med.strength} • {med.manufacturer}</p>
                            </td>
                            <td className="py-3 pr-2">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 mb-0.5">
                                {med.form_category || med.dosage_form}
                              </span>
                              <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[180px]">{med.molecule_name}</p>
                            </td>
                            <td className="py-3 text-slate-700 dark:text-slate-300 font-semibold">
                              {cost > 0 ? (
                                <span>{curr}{Number(cost).toFixed(2)}</span>
                              ) : (
                                <span className="text-slate-400 italic">Not set</span>
                              )}
                            </td>
                            <td className="py-3 font-bold text-slate-900 dark:text-white text-sm">
                              {curr}{Number(med.pack_price).toFixed(2)}
                            </td>
                            <td className="py-3">
                              {hasMargin ? (
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  Number(marginPct) >= 25
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                    : Number(marginPct) > 0
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                                }`}>
                                  +{marginPct}% (+{curr}{profit})
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Set wholesale cost</span>
                              )}
                            </td>
                            <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                              {med.strip_price ? `Strip: ${curr}${Number(med.strip_price).toFixed(2)}` : ''}
                              <div>Unit: {curr}{Number(med.unit_price).toFixed(2)}</div>
                            </td>
                            <td className="py-3">
                              <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                                med.total_packs > 0
                                  ? med.total_packs <= med.min_stock_alert
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                              }`}>
                                {med.total_packs} packs
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenPriceEdit(med)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition apple-press inline-flex items-center gap-1"
                                title="Edit Wholesale Cost & Retail Selling Price"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Price</span>
                              </button>
                              <button
                                onClick={() => handleOpenAlternatives(med)}
                                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1"
                                title="Compare originator vs generic alternatives"
                              >
                                <span>Compare</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
          {/* 6. SALES & ACCOUNTING TAB                                    */}
          {/* ============================================================ */}
          {activeTab === 'sales' && (
            <div className="space-y-4">
              {/* Sub-view Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
                  <button
                    onClick={() => setSalesSubView('receipts')}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition apple-spring ${
                      salesSubView === 'receipts'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Dispensing Receipts</span>
                  </button>
                  <button
                    onClick={() => setSalesSubView('accounting')}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition apple-spring ${
                      salesSubView === 'accounting'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Executive P&L</span>
                  </button>
                </div>
                {salesSubView === 'accounting' && (
                  <button
                    onClick={exportAccountingCSV}
                    disabled={!accountingData}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition apple-spring"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>

              {/* Receipts View */}
              {salesSubView === 'receipts' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.07]">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Dispensing Sales Audit Trail</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Full receipt logs and doctor prescription records</p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{salesHistory.length} receipts</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/[0.07] text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="pb-3">Receipt #</th>
                          <th className="pb-3">Date & Time</th>
                          <th className="pb-3">Patient Name</th>
                          <th className="pb-3 hidden md:table-cell">Prescription Details</th>
                          <th className="pb-3">Payment</th>
                          <th className="pb-3">Total Amount</th>
                          <th className="pb-3 text-right">View / Print</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                        {salesHistory.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">No sales recorded yet.</td>
                          </tr>
                        )}
                        {salesHistory.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition">
                            <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{s.receipt_number}</td>
                            <td className="py-3 text-slate-600 dark:text-slate-400">{s.created_at}</td>
                            <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{s.customer_name}</td>
                            <td className="py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                              {s.prescribing_doctor ? `${s.prescribing_doctor} (Rx: ${s.prescription_number})` : 'Over the counter'}
                            </td>
                            <td className="py-3 capitalize">
                              <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                                s.payment_method === 'loan' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>
                                {s.payment_method === 'loan' ? 'Credit / Loan' : s.payment_method}
                              </span>
                            </td>
                            <td className="py-3 font-bold text-emerald-600 text-sm">{curr}{Number(s.total).toFixed(2)}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={async () => {
                                  const details = await authFetch(`/api/sales/${s.id}`).then(r => r.json());
                                  setCurrentReceipt(details);
                                  setShowReceiptModal(true);
                                }}
                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
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

              {/* Executive Accounting P&L View */}
              {salesSubView === 'accounting' && (
                <div className="space-y-4">
                  {accountingLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="ml-3 text-sm text-slate-500">Loading financial data...</span>
                    </div>
                  )}

                  {accountingData && !accountingLoading && (
                    <>
                      {/* P&L Summary Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { label: 'Gross Revenue', value: accountingData.revenue, icon: '📈', color: 'emerald', prefix: curr },
                          { label: 'Cost of Goods (COGS)', value: accountingData.cogs, icon: '📦', color: 'orange', prefix: curr },
                          { label: 'Gross Profit', value: accountingData.grossProfit, icon: '💰', color: 'blue', prefix: curr },
                          { label: 'Gross Margin', value: accountingData.margin, icon: '📊', color: 'purple', prefix: '', suffix: '%' },
                        ].map(({ label, value, icon, color, prefix, suffix }) => (
                          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xl">{icon}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300`}>
                                {label}
                              </span>
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {prefix}{Number(value || 0).toLocaleString()}{suffix}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Secondary Metrics */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Prescriptions</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">{accountingData.totalPrescriptions || 0}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Dispensed this period</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Average Order Value</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">{curr}{Number(accountingData.aov || 0).toFixed(0)}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Per prescription</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 col-span-2 lg:col-span-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Outstanding Trust Loans</p>
                          <p className="text-xl font-bold text-amber-600">{curr}{Number(accountingData.loansOutstanding || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Uncollected credit</p>
                        </div>
                      </div>

                      {/* Payment Methods Breakdown */}
                      {accountingData.paymentMethods && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Payment Method Breakdown</h4>
                          <div className="space-y-2.5">
                            {Object.entries(accountingData.paymentMethods).map(([method, amount]) => {
                              const total = accountingData.revenue || 1;
                              const pct = Math.round((Number(amount) / total) * 100);
                              return (
                                <div key={method} className="flex items-center space-x-3">
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize w-20 shrink-0">{method}</span>
                                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">{curr}{Number(amount).toLocaleString()}</span>
                                  <span className="text-[10px] text-slate-400 w-8 shrink-0">{pct}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 7-Day Revenue Trend */}
                      {accountingData.trend && accountingData.trend.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 p-5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4">7-Day Revenue Trend</h4>
                          <div className="flex items-end space-x-2 h-20">
                            {accountingData.trend.map((day, i) => {
                              const maxVal = Math.max(...accountingData.trend.map(d => d.total));
                              const heightPct = maxVal > 0 ? (day.total / maxVal) * 100 : 0;
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                                  <div className="w-full flex items-end justify-center" style={{ height: '64px' }}>
                                    <div
                                      className="w-full bg-emerald-500/80 dark:bg-emerald-500 rounded-t-md transition-all"
                                      style={{ height: `${heightPct}%` }}
                                      title={`${curr}${Number(day.total).toLocaleString()}`}
                                    />
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-medium">{day.label || `D${i+1}`}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <button
                          onClick={fetchAccounting}
                          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Refresh Financial Data</span>
                        </button>
                      </div>
                    </>
                  )}

                  {!accountingData && !accountingLoading && (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10">
                      <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No accounting data yet</p>
                      <p className="text-xs text-slate-400 mt-1">Make a few sales first, then return here.</p>
                      <button onClick={fetchAccounting} className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition">
                        Load Accounting Data
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 7. STAFF MANAGEMENT & RBAC TAB (Admin only)                  */}
          {/* ============================================================ */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              {!currentUser || currentUser.role !== 'admin' ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10">
                  <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Admin Access Required</p>
                  <p className="text-xs text-slate-400 mt-1">Only organization administrators can manage staff.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Organization Staff & Role Management</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Invite staff, assign departments, and control access permissions</p>
                    </div>
                    <button
                      onClick={() => setShowStaffModal(true)}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition apple-spring"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Staff</span>
                    </button>
                  </div>

                  {staffLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2 text-sm text-slate-500">Loading staff...</span>
                    </div>
                  )}

                  {!staffLoading && staffList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10">
                      <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No staff members yet</p>
                      <p className="text-xs text-slate-400 mt-1">Click "Add Staff" to invite your first team member.</p>
                    </div>
                  )}

                  {staffList.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/[0.07] text-slate-400 font-semibold uppercase tracking-wider">
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3">Role / Title</th>
                            <th className="px-5 py-3 hidden md:table-cell">Departments</th>
                            <th className="px-5 py-3 hidden lg:table-cell">Email</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                          {staffList.map((member) => (
                            <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition">
                              <td className="px-5 py-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {member.name ? member.name[0].toUpperCase() : 'S'}
                                  </div>
                                  <span className="font-semibold text-slate-900 dark:text-white">{member.name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  member.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {member.role?.toUpperCase()}
                                </span>
                                <span className="ml-2 text-slate-500 dark:text-slate-400">{member.staff_title}</span>
                              </td>
                              <td className="px-5 py-3 hidden md:table-cell">
                                <div className="flex flex-wrap gap-1">
                                  {(member.allowed_departments || ['All']).map(dept => (
                                    <span key={dept} className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-medium">
                                      {dept === 'All' ? '🌐 All Depts' : dept}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-5 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">{member.email}</td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteStaff(member.id)}
                                  className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold transition"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* WHOLESALE HUB & LIVE DISTRIBUTOR RESTOCK DIRECTORY           */}
          {/* ============================================================ */}
          {activeTab === 'wholesalers' && (
            <div className="space-y-6">
              {/* Header card with Apple Liquid Glass */}
              <div className="liquid-glass p-5 md:p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Live Wholesaler Restock Network</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Wholesale Depot & Fleet Dispatch Hub</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Industrial warehouse management: Real-time bulk inventory, vehicle fleet deliveries, driver assignments, and chemist orders.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Wholesale Warehouse Sub-navigation pills */}
                  <div className="flex bg-black/[0.05] dark:bg-white/[0.06] p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setWholesaleSubTab('inventory')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition apple-spring ${
                        wholesaleSubTab === 'inventory'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📦 Warehouse Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWholesaleSubTab('dispatch');
                        fetchWholesaleOrders(selectedWholesaler?.id || 1);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition apple-spring ${
                        wholesaleSubTab === 'dispatch'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🚚 Fleet & Deliveries
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      fetchWholesalers();
                      if (wholesaleSubTab === 'dispatch') fetchWholesaleOrders(selectedWholesaler?.id || 1);
                    }}
                    className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm apple-spring shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${wholesalerLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* FLEET & DELIVERY DISPATCH VIEW */}
              {wholesaleSubTab === 'dispatch' && (
                <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>🚚 Pharmacy Delivery & Fleet Tracking Hub</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {wholesaleOrders.length} Active Shipments
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Manage delivery vans, driver dispatches, and delivery status to community chemists and hospital chains.
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30">
                      <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Pending Packing</p>
                      <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-0.5">
                        {wholesaleOrders.filter(o => o.status === 'pending').length}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30">
                      <p className="text-[11px] font-bold text-blue-700 dark:text-blue-400">In Transit / On Delivery</p>
                      <p className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-0.5">
                        {wholesaleOrders.filter(o => o.status === 'dispatched').length}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Completed & Delivered</p>
                      <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                        {wholesaleOrders.filter(o => o.status === 'delivered').length}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                        <tr>
                          <th className="p-3">Order #</th>
                          <th className="p-3">Destination Pharmacy</th>
                          <th className="p-3">Delivery Address</th>
                          <th className="p-3">Driver & Vehicle</th>
                          <th className="p-3">Order Value</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Update Dispatch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                        {wholesaleOrders.map(order => (
                          <tr key={order.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition">
                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                              #WH-{order.id.toString().padStart(4, '0')}
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 dark:text-white block">{order.pharmacy_name}</span>
                              <span className="text-[11px] text-slate-500">{order.contact_phone}</span>
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                              {order.delivery_location}
                            </td>
                            <td className="p-3">
                              {order.driver_name ? (
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-white block">{order.driver_name}</span>
                                  <span className="text-[10px] font-mono text-slate-400">{order.vehicle_plate}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Unassigned Van</span>
                              )}
                            </td>
                            <td className="p-3 font-black text-slate-900 dark:text-white">
                              {curr}{Number(order.total_amount).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                  : order.status === 'dispatched'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex gap-1">
                                {order.status === 'pending' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'dispatched')}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition shadow-xs"
                                  >
                                    Dispatch Van
                                  </button>
                                )}
                                {order.status === 'dispatched' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow-xs"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                                {order.status === 'delivered' && (
                                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Complete</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* Fast Drug Stock Lookup Across ALL Wholesalers */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-emerald-500" />
                      <span>Instant Stock Lookup Across All Distributors</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Search any drug to see which warehouse has available stock and compare pack prices</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Augmentin, Panadol, Coartem, Amoxicillin..."
                      value={wholesalerSearchQuery}
                      onChange={e => {
                        setWholesalerSearchQuery(e.target.value);
                        searchWholesaleDrug(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] rounded-2xl text-xs md:text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500 transition"
                    />
                  </div>
                </div>

                {/* Search Results Display */}
                {wholesalerDrugMatches.length > 0 && (
                  <div className="mt-3 overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                        <tr>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Strength & Form</th>
                          <th className="p-3">Distributor</th>
                          <th className="p-3">Available Packs</th>
                          <th className="p-3">Cost Price / Pack</th>
                          <th className="p-3 text-right">Order Direct</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                        {wholesalerDrugMatches.map(item => (
                          <tr key={item.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                              {item.brand_name ? `${item.brand_name} (${item.medicine_name})` : item.medicine_name}
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">
                              {item.strength} • {item.dosage_form} (Pack of {item.pack_size})
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-900 dark:text-white">{item.wholesaler_name}</span>
                              <span className="block text-[10px] text-slate-400">{item.wholesaler_county}</span>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                item.packs_available > 50 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                              }`}>
                                {item.packs_available} packs
                              </span>
                            </td>
                            <td className="p-3 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              {curr}{Number(item.cost_price_per_pack).toLocaleString()}
                            </td>
                            <td className="p-3 text-right">
                              <a
                                href={`tel:${item.wholesaler_phone}`}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition apple-spring"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call {item.wholesaler_phone}</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Verified Distributors Cards Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {wholesalersList.map(w => (
                  <div
                    key={w.id}
                    className={`p-5 rounded-3xl border transition apple-spring flex flex-col justify-between ${
                      selectedWholesaler?.id === w.id
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500/50 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-white dark:bg-slate-900 border-black/[0.06] dark:border-white/[0.08] hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Verified Distributor
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight mb-1">{w.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{w.address}, {w.county}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{w.description}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Direct Contact:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{w.contact_person}</span>
                      </div>
                      
                      <div className="flex gap-2 pt-1">
                        <a
                          href={`tel:${w.phone}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm apple-spring"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {w.phone}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => fetchWholesalerCatalog(w)}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition apple-spring"
                        >
                          View Catalog
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Wholesaler Specific Catalog Table */}
              {selectedWholesaler && (
                <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>📦 {selectedWholesaler.name} Live Warehouse Inventory</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {wholesalerCatalog.length} listed medicines in stock • Call {selectedWholesaler.phone} to order
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedWholesaler(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition"
                    >
                      Close Catalog
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                        <tr>
                          <th className="p-3">Medicine & Brand</th>
                          <th className="p-3">Strength & Form</th>
                          <th className="p-3">Pack Size</th>
                          <th className="p-3">Available Packs</th>
                          <th className="p-3">Expiry Date</th>
                          <th className="p-3">Wholesale Price</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                        {wholesalerCatalog.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                              {item.brand_name ? `${item.brand_name} (${item.medicine_name})` : item.medicine_name}
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">{item.strength} • {item.dosage_form}</td>
                            <td className="p-3">{item.pack_size} units/pack</td>
                            <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{item.packs_available} packs</td>
                            <td className="p-3 text-slate-500">{item.expiry_date || 'N/A'}</td>
                            <td className="p-3 font-black text-sm text-slate-900 dark:text-white">
                              {curr}{Number(item.cost_price_per_pack).toLocaleString()}
                            </td>
                            <td className="p-3 text-right">
                              <a
                                href={`tel:${selectedWholesaler.phone}`}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Order Now</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 8. SETTINGS & CUSTOMIZATION TAB                             */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Pharmacy Customization</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure store headers, currency symbols, and inventory alert parameters.
                </p>
              </div>

              {/* Automatic Location Detection Banner */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">🌍 Auto-Detected Location: {detectedLocale.country}</p>
                  <p className="text-emerald-700 dark:text-emerald-400">Timezone: {detectedLocale.timezone || 'Local'} • Standard Currency: {detectedLocale.currency}</p>
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
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Pharmacy / Store Name</label>
                  <input
                    type="text"
                    value={settings.pharmacy_name}
                    onChange={(e) => setSettings({ ...settings, pharmacy_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={settings.currency_symbol}
                      onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                      placeholder="e.g. KSh, $, €, £, NGN"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-emerald-800 dark:text-emerald-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Expiry Warning Threshold (Days)</label>
                    <input
                      type="number"
                      value={settings.expiry_warning_days}
                      onChange={(e) => setSettings({ ...settings, expiry_warning_days: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
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

        {/* Mobile Navigation Bar (Apple iOS Frosted Glass & Touch Safe Area) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 apple-glass border-t border-black/[0.08] dark:border-white/[0.08] px-1 py-1 flex justify-around items-center z-40 ios-safe-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          {/* 1. POS */}
          <button
            type="button"
            onClick={() => { setActiveTab('pos'); setShowMobileMoreMenu(false); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-2xl transition apple-spring relative touch-manipulation active:scale-95 ${
              activeTab === 'pos' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-0.5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">POS</span>
          </button>

          {/* 2. Drugs & Pricing */}
          <button
            type="button"
            onClick={() => { setActiveTab('inventory'); setShowMobileMoreMenu(false); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-2xl transition apple-spring touch-manipulation active:scale-95 ${
              activeTab === 'inventory' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Pill className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Drugs</span>
          </button>

          {/* 3. Batches & Expiry */}
          <button
            type="button"
            onClick={() => { setActiveTab('batches'); setShowMobileMoreMenu(false); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-2xl transition apple-spring relative touch-manipulation active:scale-95 ${
              activeTab === 'batches' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className="relative">
              <Boxes className="w-5 h-5 mb-0.5" />
              {dashboardData?.expiringCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {dashboardData.expiringCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Batches</span>
          </button>

          {/* 4. Trust Loans */}
          <button
            type="button"
            onClick={() => { setActiveTab('loans'); setShowMobileMoreMenu(false); }}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-2xl transition apple-spring relative touch-manipulation active:scale-95 ${
              activeTab === 'loans' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className="relative">
              <HandCoins className="w-5 h-5 mb-0.5" />
              {overdueLoansCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {overdueLoansCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Loans</span>
          </button>

          {/* 5. More Menu */}
          <button
            type="button"
            onClick={() => setShowMobileMoreMenu(prev => !prev)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[48px] rounded-2xl transition apple-spring relative touch-manipulation active:scale-95 ${
              ['dashboard', 'sales', 'settings'].includes(activeTab) || showMobileMoreMenu
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              {['dashboard', 'sales', 'settings'].includes(activeTab) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </nav>

        {/* Mobile "More" Bottom Sheet Drawer */}
        {showMobileMoreMenu && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setShowMobileMoreMenu(false)}
            />
            <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl border-t border-black/[0.08] dark:border-white/10 p-5 z-10 max-h-[85vh] flex flex-col overflow-y-auto">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 shrink-0" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">PharmaHub Navigation & Tools</h3>
                <button
                  onClick={() => setShowMobileMoreMenu(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => { setActiveTab('dashboard'); setShowMobileMoreMenu(false); }}
                  className={`p-3 rounded-2xl border flex items-center space-x-3 text-left transition apple-spring ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Dashboard</p>
                    <p className="text-[10px] text-slate-400">KPIs & Expiry</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('sales'); setShowMobileMoreMenu(false); }}
                  className={`p-3 rounded-2xl border flex items-center space-x-3 text-left transition apple-spring ${
                    activeTab === 'sales'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Sales & P&L</p>
                    <p className="text-[10px] text-slate-400">Past Receipts & Accounting</p>
                  </div>
                </button>

                {currentUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab('staff'); setShowMobileMoreMenu(false); }}
                    className={`p-3 rounded-2xl border flex items-center space-x-3 text-left transition apple-spring ${
                      activeTab === 'staff'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Staff & Roles</p>
                      <p className="text-[10px] text-slate-400">Manage Team Access</p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setActiveTab('wholesalers'); setShowMobileMoreMenu(false); }}
                  className={`p-3 rounded-2xl border flex items-center space-x-3 text-left transition apple-spring ${
                    activeTab === 'wholesalers'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Wholesale Hub</p>
                    <p className="text-[10px] text-slate-400">Restock & Call Suppliers</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('settings'); setShowMobileMoreMenu(false); }}
                  className={`p-3 rounded-2xl border flex items-center space-x-3 text-left transition apple-spring ${
                    activeTab === 'settings'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Settings</p>
                    <p className="text-[10px] text-slate-400">Store Profile</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setShowMobileMoreMenu(false); setTourStep(0); setShowFeatureTour(true); }}
                  className="p-3 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 flex items-center space-x-3 text-left transition apple-spring"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Feature Tour</p>
                    <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">Interactive Guide</p>
                  </div>
                </button>
              </div>

              {/* Subscription & Free Trial Status Pill in Mobile Drawer */}
              <div className="p-3.5 mb-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                    currentUser?.subscription_tier?.includes('enterprise') || currentUser?.subscription_tier?.includes('premium')
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {currentUser?.subscription_tier ? currentUser.subscription_tier.replace('_', ' ').toUpperCase() : 'FREE TRIAL'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {currentUser?.trial_days_remaining !== undefined && currentUser.trial_days_remaining > 0
                      ? `${currentUser.trial_days_remaining}d trial left`
                      : '30-Day Free Trial'}
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {currentUser?.account_type === 'organization' ? 'Organization Enterprise Plan' : 'Community Chemist Plan'}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                      Multi-user seats, department isolation & wholesale procurement.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileMoreMenu(false);
                    setShowSubscriptionModal(true);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition text-center flex items-center justify-center space-x-1 shadow-xs"
                >
                  <span>View Subscription Plans</span>
                  <span>↗</span>
                </button>
              </div>

              {/* User Profile / Auth Action */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                {currentUser ? (
                  <>
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowMobileMoreMenu(false); handleLogout(); }}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs border border-rose-200 dark:border-rose-800/40 flex items-center space-x-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setShowMobileMoreMenu(false); setShowAuthModal(true); setAuthMode('login'); }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Pharmacy Account</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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
      {/* ============================================================ */}
      {/* ADD BATCH / SMART RESTOCK MODAL                             */}
      {/* ============================================================ */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col my-8">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-600/10 via-transparent to-transparent">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Inventory Intake & Dual Pricing</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Receive Stock Batch (FEFO)</h3>
              </div>
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-400 hover:text-slate-600 dark:text-slate-300 flex items-center justify-center transition apple-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
              
              {/* Medicine Selector */}
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Select Medicine / Product *</label>
                <select
                  required
                  value={newBatchForm.medicine_id}
                  onChange={(e) => handleBatchMedicineSelect(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white font-medium"
                >
                  <option value="">-- Choose from Pharmacy Formulary (61 Templates) --</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.form_category || 'Formulary'}] {m.brand_name} ({m.strength}) - {m.manufacturer || m.molecule_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Smart Medicine Detection Card */}
              {(() => {
                const selectedBatchMed = medicines.find(m => String(m.id) === String(newBatchForm.medicine_id));
                if (!selectedBatchMed) return null;

                return (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>📦 Current On-Hand Stock:</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">{selectedBatchMed.total_packs || 0} boxes</span>
                          <span className="text-slate-500 text-[11px]">({selectedBatchMed.total_loose_units || 0} {selectedBatchMed.unit_name || 'units'})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedBatchMed.form_category || 'Tablets & Capsules'}</span> • Form: {selectedBatchMed.dosage_form}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Prev. Buying Cost:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {selectedBatchMed.wholesale_pack_price || selectedBatchMed.avg_cost_price ? `${curr}${Number(selectedBatchMed.wholesale_pack_price || selectedBatchMed.avg_cost_price).toFixed(2)}` : 'First intake'}
                        </span>
                      </div>
                    </div>
                    {newBatchForm.batch_number?.trim() && (
                      <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl text-xs text-blue-800 dark:text-blue-200">
                        <span className="font-bold">⚡ Smart Batch:</span> If lot <span className="font-mono font-bold">#{newBatchForm.batch_number}</span> already exists, stock will be topped up automatically.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Batch & Expiry Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Batch / Lot Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-2026-X8"
                    value={newBatchForm.batch_number}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batch_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newBatchForm.expiry_date}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Quantity & Supplier */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Packs Received *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={newBatchForm.packs_received}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, packs_received: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Supplier / Wholesaler</label>
                  <input
                    type="text"
                    placeholder="e.g. Meds Wholesalers Ltd"
                    value={newBatchForm.supplier}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Dual Pricing: Cost Price & Retail Selling Price */}
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Set Wholesaler Cost & Retail Selling Price</h4>
                    <p className="text-[10px] text-slate-400">Lock in your profit margin for this batch</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoCalcBatchPrices}
                    className="px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 rounded-lg apple-press"
                  >
                    ⚡ Auto-Calculate
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Wholesale Buying Cost ({curr})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 500"
                      value={newBatchForm.cost_price_per_pack}
                      onChange={(e) => setNewBatchForm({ ...newBatchForm, cost_price_per_pack: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Retail Selling Pack Price ({curr}) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="e.g. 850"
                      value={newBatchForm.pack_price}
                      onChange={(e) => setNewBatchForm({ ...newBatchForm, pack_price: e.target.value })}
                      className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300"
                    />
                  </div>
                </div>

                {/* Live Profit Margin Pill */}
                {(() => {
                  const cost = Number(newBatchForm.cost_price_per_pack);
                  const retail = Number(newBatchForm.pack_price);
                  if (retail > 0 && cost > 0) {
                    const profit = retail - cost;
                    const marginPct = ((profit / retail) * 100).toFixed(1);
                    const isPositive = profit >= 0;
                    return (
                      <div className={`p-2 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        isPositive ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        <span>{isPositive ? '📈 Profit per Pack:' : '📉 Loss:'}</span>
                        <span className="font-bold">{isPositive ? '+' : ''}{curr} {profit.toFixed(2)} ({marginPct}% Margin)</span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Sub-Unit Retail Prices */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Price per Strip ({curr})</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 85"
                      value={newBatchForm.strip_price}
                      onChange={(e) => setNewBatchForm({ ...newBatchForm, strip_price: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Single Pill / Unit ({curr})</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 10"
                      value={newBatchForm.unit_price}
                      onChange={(e) => setNewBatchForm({ ...newBatchForm, unit_price: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white"
                    />
                  </div>
                </div>

                {/* Selling Unit Freedom Toggles */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={newBatchForm.allow_strip_sales !== false}
                      onChange={e => setNewBatchForm(f => ({ ...f, allow_strip_sales: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Allow Blister Strip Dispensing (+ Strip)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={newBatchForm.allow_unit_sales !== false}
                      onChange={e => setNewBatchForm(f => ({ ...f, allow_unit_sales: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Allow Loose Pill Dispensing (+ 1)</span>
                  </label>
                </div>

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-600/30 apple-spring text-xs flex items-center justify-center gap-2"
              >
                <span>Complete Stock Intake & Save Prices</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBSCRIPTION PLANS MODAL                                    */}
      {/* ============================================================ */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 my-6">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">PharmaHub Subscription Plans</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentUser?.trial_days_remaining > 0
                    ? `🟢 Free Trial: ${currentUser.trial_days_remaining} days remaining. Full access enabled.`
                    : '⚠️ Trial expired — upgrade to restore full access.'}
                </p>
              </div>
              <button onClick={() => setShowSubscriptionModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Type Sub-toggle (Solo vs Organization vs Wholesale) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 m-6 rounded-2xl gap-1 max-w-md">
              <button
                onClick={() => setAuthForm(f => ({ ...f, account_type: 'solo' }))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition apple-spring ${
                  authForm.account_type === 'solo'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                💊 Solo Pharmacy
              </button>
              <button
                onClick={() => setAuthForm(f => ({ ...f, account_type: 'organization' }))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition apple-spring ${
                  authForm.account_type === 'organization'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏥 Organization
              </button>
              <button
                onClick={() => setAuthForm(f => ({ ...f, account_type: 'wholesale' }))}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition apple-spring ${
                  authForm.account_type === 'wholesale'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏭 Wholesale Hub
              </button>
            </div>

            {/* Solo Plans */}
            {authForm.account_type === 'solo' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 pb-6">
                {SUBSCRIPTION_PLANS.solo.map((plan) => (
                  <div key={plan.id} className={`rounded-2xl border p-5 space-y-4 transition relative flex flex-col justify-between ${
                    plan.popular
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50'
                  }`}>
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                        Most Popular
                      </span>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{plan.tag}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-0.5">{plan.name}</h3>
                      <div className="flex items-baseline space-x-1 mt-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">KSh {plan.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-500">/month</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{plan.description}</p>
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setMpesaCheckoutPlan(plan)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition apple-spring ${
                        currentUser?.subscription_tier === plan.id
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-default'
                          : plan.popular
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900'
                      }`}
                      disabled={currentUser?.subscription_tier === plan.id}
                    >
                      {currentUser?.subscription_tier === plan.id ? '✓ Current Plan' : `Select & Pay KSh ${plan.price.toLocaleString()}`}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Organization Plans */}
            {authForm.account_type === 'organization' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6">
                {SUBSCRIPTION_PLANS.organization.map((plan) => (
                  <div key={plan.id} className={`rounded-2xl border p-5 space-y-4 transition relative flex flex-col justify-between ${
                    plan.popular
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50'
                  }`}>
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                        Enterprise Choice
                      </span>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{plan.tag}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-0.5">{plan.name}</h3>
                      <div className="flex items-baseline space-x-1 mt-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">KSh {plan.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-500">/month</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{plan.description}</p>
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setMpesaCheckoutPlan(plan)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition apple-spring ${
                        currentUser?.subscription_tier === plan.id
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-default'
                          : plan.popular
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900'
                      }`}
                      disabled={currentUser?.subscription_tier === plan.id}
                    >
                      {currentUser?.subscription_tier === plan.id ? '✓ Current Plan' : `Select & Pay KSh ${plan.price.toLocaleString()}`}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Wholesale Plans */}
            {authForm.account_type === 'wholesale' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 pb-6">
                {SUBSCRIPTION_PLANS.wholesale.map((plan) => (
                  <div key={plan.id} className={`rounded-2xl border p-5 space-y-4 transition relative flex flex-col justify-between ${
                    plan.popular
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-lg shadow-amber-500/10'
                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50'
                  }`}>
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                        Distributor Standard
                      </span>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{plan.tag}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-0.5">{plan.name}</h3>
                      <div className="flex items-baseline space-x-1 mt-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">KSh {plan.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-500">/month</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{plan.description}</p>
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setMpesaCheckoutPlan(plan)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition apple-spring ${
                        currentUser?.subscription_tier === plan.id
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-sm font-black'
                      }`}
                      disabled={currentUser?.subscription_tier === plan.id}
                    >
                      {currentUser?.subscription_tier === plan.id ? '✓ Current Plan' : `Select & Pay KSh ${plan.price.toLocaleString()}`}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* M-Pesa Interactive STK Push Modal Overlay */}
            {mpesaCheckoutPlan && (
              <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                        M
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Lipa Na M-Pesa Online</h4>
                        <p className="text-[11px] text-slate-500">Instant STK Push Subscription</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMpesaCheckoutPlan(null)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selected Plan:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{mpesaCheckoutPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subscription Amount:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">KSh {mpesaCheckoutPlan.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Reference:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser?.pharmacy_name || 'PharmaHub'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Enter Safaricom M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="07XX XXX XXX or 2547XXXXXXXX"
                      value={mpesaPhone}
                      onChange={e => setMpesaPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    <p className="text-[10px] text-slate-400">
                      An STK PIN prompt will be sent to this phone. Enter your M-Pesa PIN on your phone to complete payment.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMpesaCheckoutPlan(null)}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={mpesaCheckoutLoading}
                      onClick={() => handleSimulateMpesaPayment(mpesaCheckoutPlan)}
                      className="flex-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 font-bold text-xs text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition apple-spring"
                    >
                      {mpesaCheckoutLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sending STK Prompt...</span>
                        </>
                      ) : (
                        <span>Send STK Push (KSh {mpesaCheckoutPlan.price.toLocaleString()})</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* M-Pesa Success Receipt Modal */}
            {mpesaSuccessReceipt && (
              <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-emerald-500/40 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">Payment Confirmed!</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your subscription is now active</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 text-xs text-left space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">M-Pesa Receipt:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{mpesaSuccessReceipt.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Amount Paid:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">KSh {mpesaSuccessReceipt.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Plan Activated:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{mpesaSuccessReceipt.tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Timestamp:</span>
                      <span className="text-slate-600 dark:text-slate-400">{mpesaSuccessReceipt.date}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMpesaSuccessReceipt(null);
                      setShowSubscriptionModal(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition apple-spring"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* M-Pesa Payment Note */}
            <div className="mx-6 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start space-x-3">
              <span className="text-xl shrink-0">📱</span>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Payment via M-Pesa</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  After selecting a plan, send payment to <strong className="text-slate-700 dark:text-slate-300">M-Pesa Paybill: 247 247</strong> with your email as the account reference, then WhatsApp <strong>+254 700 000 000</strong> with your receipt for instant activation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD STAFF MODAL                                              */}
      {/* ============================================================ */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Add Staff Member</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Invite a team member with specific department access</p>
              </div>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" required placeholder="Dr. Jane Kamau" value={newStaffForm.name}
                    onChange={e => setNewStaffForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select value={newStaffForm.role} onChange={e => setNewStaffForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="staff">Staff</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                <input type="email" required placeholder="jane@yourhospital.com" value={newStaffForm.email}
                  onChange={e => setNewStaffForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
                <input type="password" required minLength={6} placeholder="Min 6 characters" value={newStaffForm.password}
                  onChange={e => setNewStaffForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                <input type="text" placeholder="Staff Pharmacist" value={newStaffForm.staff_title}
                  onChange={e => setNewStaffForm(f => ({ ...f, staff_title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Department Access</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[{ id: 'All', label: '🌐 All Departments' }, ...DEPARTMENTS].map(dept => (
                    <label key={dept.id} className="flex items-center space-x-2 p-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                      <input type="checkbox"
                        checked={newStaffForm.allowed_departments.includes(dept.id)}
                        onChange={e => {
                          const depts = e.target.checked
                            ? [...newStaffForm.allowed_departments.filter(d => d !== 'All'), dept.id]
                            : newStaffForm.allowed_departments.filter(d => d !== dept.id);
                          setNewStaffForm(f => ({ ...f, allowed_departments: depts.length ? depts : ['All'] }));
                        }}
                        className="w-3.5 h-3.5 accent-emerald-500" />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">{dept.label || dept.id}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 pt-1">
                <button type="button" onClick={() => setShowStaffModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition apple-spring">
                  Add Staff Member
                </button>
              </div>
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
      {/* AUTH MODAL — Login / Register (Apple Cupertino Style)       */}
      {/* ============================================================ */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16161A] text-slate-900 dark:text-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-black/[0.08] dark:border-white/[0.08] apple-spring">

            {/* Modal Header */}
            <div className="relative bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 px-6 pt-6 pb-6 text-white">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition apple-spring"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    {authMode === 'login' ? 'Welcome back' : 'Create pharmacy account'}
                  </h2>
                  <p className="text-xs text-emerald-100">
                    {authMode === 'login'
                      ? 'Sign in to access your pharmacy catalog & sales'
                      : 'Free cloud OS — no credit card needed'}
                  </p>
                </div>
              </div>

              {/* Segmented Control / Tab switcher */}
              <div className="flex mt-3 bg-black/20 backdrop-blur-sm rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition apple-spring ${
                    authMode === 'login' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition apple-spring ${
                    authMode === 'register' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5 space-y-3.5">
              {/* Google Sign In option */}
              <div>
                <div id="google-btn-modal-official" className="flex justify-center empty:hidden min-h-[40px]"></div>
                {!googleButtonReady && (
                  <button
                    type="button"
                    onClick={triggerGoogleSignIn}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 font-semibold text-xs text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center space-x-2.5 transition apple-press"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                )}
              </div>

              {/* In Login mode: show sub-switcher for Email vs Phone login */}
              {authMode === 'login' && (
                <div className="flex bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition apple-spring flex items-center justify-center gap-1.5 ${
                      authMethod === 'email'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>✉️ Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition apple-spring flex items-center justify-center gap-1.5 ${
                      authMethod === 'phone'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>📱 Phone Number</span>
                  </button>
                </div>
              )}

              {/* Login with Phone Number inside Modal */}
              {authMode === 'login' && authMethod === 'phone' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Your Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 700 000 000"
                      value={phoneLoginForm.phone}
                      onChange={e => setPhoneLoginForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Password / Security PIN</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={phoneLoginForm.password}
                      onChange={e => setPhoneLoginForm(f => ({ ...f, password: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handlePhoneLogin(e)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePhoneLogin}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-600/30 apple-spring mt-2"
                  >
                    Sign In with Phone
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pharmacist Full Name</label>
                        <input
                          type="text"
                          placeholder="Dr. Jane Wambui"
                          value={authForm.name}
                          onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Pharmacy / Chemist Name</label>
                        <input
                          type="text"
                          placeholder="HealthFirst Community Chemist"
                          value={authForm.pharmacy_name}
                          onChange={e => setAuthForm(f => ({ ...f, pharmacy_name: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Genuine Email Address</label>
                    <input
                      type="email"
                      placeholder="name@pharmacy.com"
                      value={authForm.email}
                      onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder={authMode === 'register' ? 'Minimum 6 characters' : 'Enter password'}
                      value={authForm.password}
                      onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && (authMode === 'login' ? handleLogin(e) : handleRegister(e))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+254 700 000 000"
                          value={authForm.phone}
                          onChange={e => setAuthForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Currency</label>
                        <select
                          value={authForm.currency_symbol || detectedLocale.currency}
                          onChange={e => setAuthForm(f => ({ ...f, currency_symbol: e.target.value }))}
                          className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
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
                    type="button"
                    onClick={authMode === 'login' ? handleLogin : handleRegister}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-600/30 apple-spring"
                  >
                    {authMode === 'login' ? 'Sign In to My Pharmacy' : 'Create Free Account & Start'}
                  </button>
                </div>
              )}

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                {authMode === 'login' ? (
                  <>Don't have an account?{' '}
                    <button type="button" onClick={() => setAuthMode('register')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                      Sign up free
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => setAuthMode('login')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </div>

              {authMode === 'register' && (
                <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  🔒 Data is protected with PBKDF2 encryption. Safe, fast, and multi-device synced.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Price & Wholesale Cost Edit Modal */}
      {showPriceEditModal && editingPriceMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 mb-1.5">
                  <span>🏷️ {editingPriceMed.form_category || 'Formulary Item'}</span>
                  <span>•</span>
                  <span>{editingPriceMed.dosage_form || 'Medicine'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{editingPriceMed.brand_name}</span>
                  <span className="text-xs font-normal text-slate-500">{editingPriceMed.strength}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generic: <span className="italic">{editingPriceMed.molecule_name}</span> • Tier: <span className="capitalize font-medium">{editingPriceMed.brand_tier}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 flex items-center justify-center transition apple-press"
              >
                ✕
              </button>
            </div>

            {/* Note banner on Multi-Wholesale Price Flexibility */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <span className="text-base">💡</span>
              <p className="leading-relaxed">
                Wholesaler prices vary between distributors. Set your actual purchase cost and custom retail prices below. These prices will automatically apply to your POS and register.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePriceEdit} className="space-y-4">
              
              {/* Cost & Selling Pack Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Wholesale Cost ({curr})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 500"
                    value={priceEditForm.wholesale_pack_price}
                    onChange={e => setPriceEditForm(f => ({ ...f, wholesale_pack_price: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                  <span className="text-[10px] text-slate-400">Buying price from wholesaler</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Retail Pack Price ({curr}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 850"
                    value={priceEditForm.pack_price}
                    onChange={e => setPriceEditForm(f => ({ ...f, pack_price: e.target.value }))}
                    className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                  <span className="text-[10px] text-slate-400">Customer counter price</span>
                </div>
              </div>

              {/* Profit & Margin Calculator Pill */}
              {(() => {
                const wholesale = Number(priceEditForm.wholesale_pack_price);
                const retail = Number(priceEditForm.pack_price);
                if (retail > 0 && wholesale > 0) {
                  const profit = retail - wholesale;
                  const marginPct = ((profit / retail) * 100).toFixed(1);
                  const isPositive = profit >= 0;
                  return (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                      isPositive
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border-rose-200 dark:border-rose-800/40'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <span>{isPositive ? '📈' : '📉'}</span>
                        <span>{isPositive ? 'Gross Profit per Pack:' : 'Loss per Pack:'}</span>
                      </span>
                      <span className="font-bold">
                        {isPositive ? '+' : ''}{curr} {profit.toFixed(2)} ({marginPct}% Margin)
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Sub-Unit Auto Calculation Header */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Sub-Unit Selling Prices</h4>
                  <p className="text-[10px] text-slate-400">
                    Pack contains {editingPriceMed.units_per_pack || 100} {editingPriceMed.unit_name || 'units'} ({editingPriceMed.units_per_strip || 10}/strip)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoCalculatePrices}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200/50 rounded-lg transition apple-press"
                  title="Auto-calculate strip and unit price based on pack price"
                >
                  ⚡ Auto-Calculate
                </button>
              </div>

              {/* Strip Price & Unit Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Price per Strip ({curr})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 85"
                    value={priceEditForm.strip_price}
                    onChange={e => setPriceEditForm(f => ({ ...f, strip_price: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 1 Blister / Strip</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Single Unit / Pill ({curr})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 10"
                    value={priceEditForm.unit_price}
                    onChange={e => setPriceEditForm(f => ({ ...f, unit_price: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                  <span className="text-[10px] text-slate-400">1 loose tablet or vial</span>
                </div>
              </div>

              {/* Low Stock Alert Threshold */}
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Minimum Stock Alert Level (Packs)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="10"
                  value={priceEditForm.min_stock_alert}
                  onChange={e => setPriceEditForm(f => ({ ...f, min_stock_alert: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
                <span className="text-[10px] text-slate-400">Dashboard alerts when available packs fall below this number</span>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPriceEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={priceSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition apple-spring flex items-center gap-1.5"
                >
                  {priceSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving Prices...</span>
                    </>
                  ) : (
                    <span>Save & Apply Custom Prices</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* INTERACTIVE FEATURE TOUR & SYSTEM WALKTHROUGH MODAL          */}
      {/* ============================================================ */}
      {showFeatureTour && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
            {/* Header with Step indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">PharmaHub Feature Tour</h3>
                  <p className="text-[11px] text-slate-400">Step {tourStep + 1} of 5 • Interactive Walkthrough</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFeatureTour(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tour Step Cards */}
            <div className="min-h-[200px] flex flex-col justify-center text-center space-y-4 px-2">
              {tourStep === 0 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    💊
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">Smart Pharmacy Operating System</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                    Welcome to PharmaHub! Built for high-volume pharmacies and community drugstores. Fast POS, multi-tenant stock isolation, dual pricing, and mobile-ready responsive controls.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>✨ Fast Dispensing</span> • <span>📦 Batch Sensing</span> • <span>🤝 Trust Loans</span>
                  </div>
                </div>
              )}

              {tourStep === 1 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    🛒
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">Unit-Selling Freedom (Box, Strip & Pill)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                    Sell medications however your patients need them: dispense a full box, an individual blister strip, or loose single tablets with automatic unit conversion and profit tracking.
                  </p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center justify-around text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span className="text-emerald-600 dark:text-emerald-400">+ Box</span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span className="text-blue-600 dark:text-blue-400">+ Strip</span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span className="text-purple-600 dark:text-purple-400">+ 1 Unit</span>
                  </div>
                </div>
              )}

              {tourStep === 2 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    📦
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">Smart Batch Sensing & Intake Pricing</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                    When receiving stock, enter your lot number. PharmaHub automatically senses if that batch already exists on shelf and tops it up. Set your wholesaler buying cost and retail price on the spot.
                  </p>
                  <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-xl text-xs text-blue-800 dark:text-blue-200 font-medium">
                    ⚡ Zero duplicate lots • Dynamic profit margins calculated live
                  </div>
                </div>
              )}

              {tourStep === 3 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    🤝
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">Trust Loans & 1-Click WhatsApp Reminders</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                    Support trusted patients with partial credit dispensing. Track repayment dates, partial settlements, and dispatch courteous pre-formatted WhatsApp reminders directly from your ledger.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-bold">
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp reminders with pre-filled balance and promise dates</span>
                  </div>
                </div>
              )}

              {tourStep === 4 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    🌐
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">24/7 Verified Supply Network & Market Intel</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                    Compare originator brands against pure generics and nationwide hospital formularies. Access exclusive 24/7 wholesaler bulk discounts from verified medical supply partners.
                  </p>
                  <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                    🌍 Real-time market intelligence • 24/7 verified pharmacy supply network
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center space-x-2 pt-2">
              {[0, 1, 2, 3, 4].map(idx => (
                <button
                  key={idx}
                  onClick={() => setTourStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    tourStep === idx ? 'w-8 bg-emerald-600 dark:bg-emerald-400' : 'w-2 bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowFeatureTour(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setTourStep(s => s - 1)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Previous
                  </button>
                )}

                {tourStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setTourStep(s => s + 1)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition apple-spring flex items-center gap-1.5"
                  >
                    <span>Next Feature</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowFeatureTour(false);
                      showToast('Ready to go! Start dispensing or explore your inventory.', 'success');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition apple-spring flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Interactive Onboarding Assistant Avatar */}
      <PharmaGuide isSolo={currentUser?.account_type === 'solo'} />

    </div>
  );
}

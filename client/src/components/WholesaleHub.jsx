import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Package,
  ShoppingCart,
  Truck,
  DollarSign,
  PhoneCall,
  Users2,
  RefreshCw,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Download,
  FileText,
  MapPin,
  ChevronRight,
  Shield,
  Layers,
  ArrowUpRight,
  X,
  CreditCard,
  TrendingUp,
  Boxes,
  Send,
  UserCheck
} from 'lucide-react';

export default function WholesaleHub({
  currentUser,
  authFetch,
  showToast,
  isDarkMode,
  setIsDarkMode,
  handleLogout,
  handleSwitchAccountType,
  setShowSubscriptionModal
}) {
  // Navigation Tabs for Wholesale Hub
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, catalog, orders, deliveries, finance, teleseller, connections, returns, restock, staff, settings
  const [loading, setLoading] = useState(false);

  // Core Data States
  const [depot, setDepot] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Filter & Search states
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderFilter, setOrderFilter] = useState('all');

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showBulkRestockModal, setShowBulkRestockModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);

  // Forms
  const [productForm, setProductForm] = useState({
    brand_name: '',
    generic_name: '',
    strength: '',
    dosage_form: 'Tablet',
    manufacturer: '',
    category: 'Prescription',
    carton_size: 100,
    units_per_inner_pack: 10,
    carton_price: '',
    unit_price: '',
    stock_cartons: '',
    expiry_date: '',
    reorder_carton_level: 10
  });

  const [bulkRestockForm, setBulkRestockForm] = useState({
    supplier_name: '',
    invoice_ref: '',
    total_cost: '',
    items: [
      { brand_name: '', catalog_item_id: '', qty_cartons: 10, cost_per_carton: 0, batch_number: '', expiry_date: '' }
    ]
  });

  const [deliveryForm, setDeliveryForm] = useState({
    driver_name: '',
    driver_phone: '',
    vehicle_plate: '',
    scheduled_date: new Date().toISOString().slice(0, 10),
    scheduled_time: '10:00 AM',
    delivery_address: '',
    delivery_notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'mpesa',
    reference: '',
    paid_by: '',
    notes: ''
  });

  const [callLogForm, setCallLogForm] = useState({
    pharmacy_name: '',
    phone_called: '',
    outcome: 'interested',
    follow_up_date: '',
    notes: ''
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teleseller',
    custom_permissions: ['orders', 'teleseller']
  });

  const [connectionForm, setConnectionForm] = useState({
    pharmacy_name: '',
    contact_name: '',
    contact_phone: '',
    county: 'Nairobi',
    payment_terms: 'COD',
    credit_limit: 100000
  });

  // Current Currency Symbol
  const curr = depot?.currency || 'KSh';

  // Determine user role and permissions
  const userRole = currentUser?.role || 'admin';
  const isDriver = userRole === 'driver';
  const isTeleseller = userRole === 'teleseller';
  const isAccountant = userRole === 'accountant';
  const isWarehouse = userRole === 'warehouse';

  // 1. Fetch Depot Profile & KPIs
  const fetchDepotData = async () => {
    try {
      setLoading(true);
      const [depotRes, kpiRes] = await Promise.all([
        authFetch('/api/depot/me').then(r => r.json()),
        authFetch('/api/depot/analytics').then(r => r.json())
      ]);
      setDepot(depotRes);
      setAnalytics(kpiRes);
    } catch (err) {
      console.error(err);
      showToast('Error loading wholesale depot profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Tab Specific Data
  const fetchTabData = async () => {
    try {
      if (activeTab === 'catalog') {
        const res = await authFetch('/api/depot/catalog').then(r => r.json());
        setCatalog(Array.isArray(res) ? res : []);
      } else if (activeTab === 'orders') {
        const res = await authFetch('/api/depot/orders').then(r => r.json());
        setOrders(Array.isArray(res) ? res : []);
      } else if (activeTab === 'deliveries') {
        const res = await authFetch('/api/depot/deliveries').then(r => r.json());
        setDeliveries(Array.isArray(res) ? res : []);
      } else if (activeTab === 'finance') {
        const res = await authFetch('/api/depot/invoices').then(r => r.json());
        setInvoices(Array.isArray(res) ? res : []);
      } else if (activeTab === 'teleseller') {
        const res = await authFetch('/api/depot/call-logs').then(r => r.json());
        setCallLogs(Array.isArray(res) ? res : []);
      } else if (activeTab === 'connections') {
        const res = await authFetch('/api/depot/connections').then(r => r.json());
        setConnections(Array.isArray(res) ? res : []);
      } else if (activeTab === 'returns') {
        const res = await authFetch('/api/depot/returns').then(r => r.json());
        setReturnsList(Array.isArray(res) ? res : []);
      } else if (activeTab === 'staff') {
        const res = await authFetch('/api/depot/staff').then(r => r.json());
        setStaffList(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepotData();
  }, []);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // 3. Real-time Stock & Order Broadcast (SSE Connection)
  useEffect(() => {
    if (!depot?.id) return;
    const sse = new EventSource(`/api/depot/stream?depot_id=${depot.id}`);

    sse.addEventListener('stock_updated', () => {
      fetchTabData();
      fetchDepotData();
      showToast('Live warehouse stock updated', 'info');
    });

    sse.addEventListener('new_order', (e) => {
      try {
        const data = JSON.parse(e.data);
        showToast(`🔔 New bulk order received from ${data.pharmacy}!`, 'success');
        fetchTabData();
        fetchDepotData();
      } catch (err) {}
    });

    sse.addEventListener('delivery_updated', () => {
      fetchTabData();
    });

    return () => {
      sse.close();
    };
  }, [depot?.id, activeTab]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      const matchQ = catalogSearch.trim() === '' ||
        item.brand_name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (item.generic_name && item.generic_name.toLowerCase().includes(catalogSearch.toLowerCase()));
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchQ && matchCat;
    });
  }, [catalog, catalogSearch, selectedCategory]);

  // Handlers for Order Operations
  const handleOrderStatusUpdate = async (orderId, newStatus, cancelReason = '') => {
    try {
      const res = await authFetch(`/api/depot/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, cancel_reason: cancelReason })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
        fetchTabData();
        fetchDepotData();
      } else {
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch {
      showToast('Server connection error', 'error');
    }
  };

  // Schedule Delivery for an order
  const handleScheduleDelivery = async (e) => {
    e.preventDefault();
    if (!selectedOrderForDelivery) return;
    try {
      const res = await authFetch('/api/depot/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrderForDelivery.id,
          ...deliveryForm
        })
      });
      if (res.ok) {
        showToast('Delivery scheduled and order marked as Packed!', 'success');
        setShowDeliveryModal(false);
        setSelectedOrderForDelivery(null);
        fetchTabData();
      }
    } catch {
      showToast('Error scheduling delivery', 'error');
    }
  };

  // Record Invoice Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    try {
      const res = await authFetch(`/api/depot/invoices/${selectedInvoiceForPayment.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });
      if (res.ok) {
        showToast('Payment recorded successfully', 'success');
        setShowPaymentModal(false);
        setSelectedInvoiceForPayment(null);
        fetchTabData();
      }
    } catch {
      showToast('Error recording payment', 'error');
    }
  };

  // Add Product to Wholesale Catalog
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/depot/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      if (res.ok) {
        showToast('Product added to wholesale catalog', 'success');
        setShowAddProductModal(false);
        setProductForm({
          brand_name: '', generic_name: '', strength: '', dosage_form: 'Tablet',
          manufacturer: '', category: 'Prescription', carton_size: 100, units_per_inner_pack: 10,
          carton_price: '', unit_price: '', stock_cartons: '', expiry_date: '', reorder_carton_level: 10
        });
        fetchTabData();
      }
    } catch {
      showToast('Error adding product', 'error');
    }
  };

  // Bulk Inbound Stock Receive
  const handleBulkRestock = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/depot/stock-receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkRestockForm)
      });
      if (res.ok) {
        showToast('Bulk stock received and inventory updated', 'success');
        setShowBulkRestockModal(false);
        fetchTabData();
        fetchDepotData();
      }
    } catch {
      showToast('Error processing bulk receiving', 'error');
    }
  };

  // Log Teleseller Call
  const handleLogCall = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/depot/call-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callLogForm)
      });
      if (res.ok) {
        showToast('Call log saved', 'success');
        setShowCallLogModal(false);
        setCallLogForm({ pharmacy_name: '', phone_called: '', outcome: 'interested', follow_up_date: '', notes: '' });
        fetchTabData();
      }
    } catch {
      showToast('Error logging call', 'error');
    }
  };

  // Add Wholesale Staff Member
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/depot/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      });
      if (res.ok) {
        showToast('Wholesale staff member added', 'success');
        setShowAddStaffModal(false);
        setStaffForm({ name: '', email: '', phone: '', role: 'teleseller', custom_permissions: ['orders'] });
        fetchTabData();
      }
    } catch {
      showToast('Error adding staff', 'error');
    }
  };

  // Connect Pharmacy
  const handleAddConnection = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/depot/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionForm)
      });
      if (res.ok) {
        showToast('Pharmacy connected to wholesale depot', 'success');
        setShowNewConnectionModal(false);
        fetchTabData();
      }
    } catch {
      showToast('Error connecting pharmacy', 'error');
    }
  };

  // Export PDF / Price List Simulator
  const handleExportPriceList = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Brand Name,Generic,Strength,Form,Carton Size,Carton Price (" + curr + "),Stock (Cartons),Expiry"]
        .concat(catalog.map(c => `"${c.brand_name}","${c.generic_name || ''}","${c.strength || ''}","${c.dosage_form || ''}",${c.carton_size},${c.carton_price},${c.stock_cartons},"${c.expiry_date || ''}"`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${depot?.depot_name || 'Wholesale'}_Price_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Official Wholesale Price List exported', 'success');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* ════════════════════════════════════════════════════════════ */}
      {/* 1. DEDICATED WHOLESALE DEPOT SIDEBAR                         */}
      {/* ════════════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#0c0d12] border-r border-amber-500/20 shadow-2xl h-screen sticky top-0 z-30">
        {/* Depot Branding */}
        <div className="p-5 border-b border-amber-500/15">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-600/30">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white truncate tracking-tight">
                {depot?.depot_name || 'Wholesale Depot'}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  B2B Distribution
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Switcher Pill in Sidebar */}
        <div className="px-5 py-2.5 bg-amber-500/5 border-b border-amber-500/10 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400 text-[11px]">Depot Currency:</span>
          <span className="font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
            {curr} ({depot?.country || 'East Africa'})
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard',   label: 'Operations Hub',   icon: TrendingUp,  badge: analytics?.pending_orders },
            { id: 'catalog',     label: 'Bulk Catalog',      icon: Package,     badge: analytics?.low_stock_count, badgeColor: 'rose' },
            { id: 'orders',      label: 'Pharmacy Orders',  icon: ShoppingCart,badge: analytics?.pending_orders, badgeColor: 'amber' },
            { id: 'deliveries',  label: 'Fleet & Dispatch',  icon: Truck },
            { id: 'finance',     label: 'Invoices & P&L',    icon: DollarSign,  badge: analytics?.overdue_count, badgeColor: 'rose' },
            { id: 'teleseller',  label: 'Teleseller CRM',   icon: PhoneCall },
            { id: 'connections', label: 'Connected Pharmacies', icon: Users2, badge: analytics?.active_connections },
            { id: 'returns',     label: 'Returns & Credit',  icon: RefreshCw },
            { id: 'staff',       label: 'Depot Staff',      icon: UserCheck },
          ].map(({ id, label, icon: Icon, badge, badgeColor }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition apple-press group ${
                activeTab === id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${activeTab === id ? 'text-slate-950' : 'text-amber-400 group-hover:text-amber-300'}`} />
                <span>{label}</span>
              </div>
              {badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === id ? 'bg-slate-950 text-amber-400' :
                  badgeColor === 'rose' ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Portal Switcher & User Profile Bottom Segment */}
        <div className="p-4 border-t border-amber-500/15 bg-black/40 space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
              Switch Workspace
            </span>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => handleSwitchAccountType('solo')}
                className="py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                Solo
              </button>
              <button
                onClick={() => handleSwitchAccountType('organization')}
                className="py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                Hospital
              </button>
              <button
                className="py-1 rounded-lg bg-amber-500 text-slate-950 font-black shadow-xs"
              >
                Wholesale
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-white truncate">{currentUser?.name || 'Depot Admin'}</p>
              <p className="text-[10px] text-amber-400/80 uppercase font-semibold">{userRole} access</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition"
              title="Sign out"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN WORKSPACE AREA                                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[#090a0f]">
        {/* Top Header */}
        <header className="h-16 border-b border-amber-500/15 bg-[#0c0d12]/90 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="md:hidden flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-white">{depot?.depot_name || 'Wholesale'}</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-base font-black text-white capitalize flex items-center gap-2">
                <span>{activeTab === 'dashboard' ? '📊 Wholesale Operations & Fleet Overview' :
                       activeTab === 'catalog' ? '📦 Bulk Pharmaceutical Inventory' :
                       activeTab === 'orders' ? '🛒 Pharmacy Orders & Restock Dispatch' :
                       activeTab === 'deliveries' ? '🚚 Logistics, Drivers & Fleet Schedule' :
                       activeTab === 'finance' ? '💰 Financial Accounts, Invoices & COD Tracking' :
                       activeTab === 'teleseller' ? '📞 Telesales Desk & Outbound Calls CRM' :
                       activeTab === 'connections' ? '🤝 Retail Pharmacy Partner Accounts' :
                       activeTab === 'returns' ? '↩️ Returns & Damage Claims' :
                       activeTab === 'staff' ? '👥 Staff & Custom Permissions Matrix' : 'Wholesale Hub'}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Action buttons depending on active tab */}
            {activeTab === 'catalog' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportPriceList}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs flex items-center space-x-1.5 border border-white/10 transition apple-press"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export Price List</span>
                </button>
                <button
                  onClick={() => setShowBulkRestockModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center space-x-1.5 border border-amber-500/30 transition apple-press"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Receive Bulk Stock</span>
                </button>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-lg shadow-amber-500/20 apple-press"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add SKU</span>
                </button>
              </div>
            )}

            {activeTab === 'teleseller' && (
              <button
                onClick={() => setShowCallLogModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-lg shadow-amber-500/20 apple-press"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Log Pharmacy Call</span>
              </button>
            )}

            {activeTab === 'connections' && (
              <button
                onClick={() => setShowNewConnectionModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-lg shadow-amber-500/20 apple-press"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Pharmacy</span>
              </button>
            )}

            {activeTab === 'staff' && (
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-lg shadow-amber-500/20 apple-press"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Staff Member</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ============================================================ */}
          {/* TAB 1: OPERATIONS DASHBOARD (KPIs & High-Impact Alerts)      */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Critical Alerts Banner (Expiry + Overdue payments) */}
              {(analytics?.expiry_next_30 > 0 || analytics?.overdue_count > 0 || analytics?.low_stock_count > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics?.expiry_next_30 > 0 && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider">Expiry Alert (Next 30 Days)</h4>
                        <p className="text-xs text-rose-200 mt-0.5">
                          <strong>{analytics.expiry_next_30} batches</strong> expire within 30 days. Discount or prioritize dispatch.
                        </p>
                      </div>
                    </div>
                  )}

                  {analytics?.overdue_count > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Overdue Invoices</h4>
                        <p className="text-xs text-amber-200 mt-0.5">
                          <strong>{curr} {analytics.overdue_amount?.toLocaleString()}</strong> overdue across {analytics.overdue_count} pharmacies.
                        </p>
                      </div>
                    </div>
                  )}

                  {analytics?.low_stock_count > 0 && (
                    <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-start space-x-3">
                      <Boxes className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-yellow-300 uppercase tracking-wider">Warehouse Low Stock</h4>
                        <p className="text-xs text-yellow-200 mt-0.5">
                          <strong>{analytics.low_stock_count} SKUs</strong> have reached warehouse reorder levels.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4 Primary KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/20 shadow-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Wholesale Volume</span>
                  <p className="text-2xl font-black text-amber-400">{curr} {analytics?.today_revenue?.toLocaleString() || '0'}</p>
                  <p className="text-[11px] text-slate-500">{analytics?.today_orders || 0} orders received today</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/20 shadow-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
                  <p className="text-2xl font-black text-white">{analytics?.pending_orders || 0}</p>
                  <p className="text-[11px] text-amber-400 font-semibold">Requires confirmation & packing</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/20 shadow-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Connected Pharmacies</span>
                  <p className="text-2xl font-black text-white">{analytics?.active_connections || 0}</p>
                  <p className="text-[11px] text-slate-500">Retail clients ordering in bulk</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/20 shadow-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue Invoiced</span>
                  <p className="text-2xl font-black text-emerald-400">{curr} {analytics?.total_revenue?.toLocaleString() || '0'}</p>
                  <p className="text-[11px] text-slate-500">Paid & active invoices</p>
                </div>
              </div>

              {/* Quick Actions & Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders List */}
                <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/80 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber-400" />
                      <span>Live Incoming Pharmacy Restock Orders</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {analytics?.recent_orders && analytics.recent_orders.length > 0 ? (
                      analytics.recent_orders.map(o => (
                        <div key={o.order_ref} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.06] transition">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white">{o.pharmacy_name}</span>
                              <span className="text-[10px] font-mono text-slate-400">#{o.order_ref}</span>
                            </div>
                            <span className="text-[11px] text-slate-500">{new Date(o.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-amber-300 text-sm">{curr} {o.total?.toLocaleString()}</span>
                            <div className="mt-0.5">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                                o.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-6 text-center">No orders received yet.</p>
                    )}
                  </div>
                </div>

                {/* Top Buying Pharmacies */}
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/5 space-y-4">
                  <div className="pb-3 border-b border-white/5">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-amber-400" />
                      <span>Top Retail Partners</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {analytics?.top_pharmacies && analytics.top_pharmacies.length > 0 ? (
                      analytics.top_pharmacies.map((p, idx) => (
                        <div key={p.pharmacy_name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-200">{p.pharmacy_name}</span>
                          </div>
                          <span className="font-black text-amber-300">{curr} {p.total_spent?.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-6 text-center">No client purchase data yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: BULK PHARMACEUTICAL CATALOG                          */}
          {/* ============================================================ */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search bulk medicines, generic molecules, manufacturers..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  {['All', 'Prescription', 'OTC', 'Controlled'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards Table */}
              <div className="rounded-3xl bg-slate-900/90 border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                        <th className="py-3 px-4">Product Name & Molecule</th>
                        <th className="py-3 px-4">Packaging</th>
                        <th className="py-3 px-4">Carton Price</th>
                        <th className="py-3 px-4">Warehouse Stock</th>
                        <th className="py-3 px-4">Batch & Expiry</th>
                        <th className="py-3 px-4 text-right">Visibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCatalog.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4">
                            <p className="font-extrabold text-white text-sm">{item.brand_name}</p>
                            <p className="text-[11px] text-slate-400">{item.generic_name} • {item.strength}</p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 font-semibold">
                              {item.manufacturer || 'Standard'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-200">{item.carton_size} units/carton</p>
                            <p className="text-[10px] text-slate-500">{item.dosage_form}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-black text-amber-300 text-sm">{curr} {item.carton_price?.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">~{curr} {item.unit_price || (item.carton_price / item.carton_size).toFixed(1)}/unit</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-black text-xs px-2 py-0.5 rounded-full ${
                              item.stock_cartons <= item.reorder_carton_level
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {item.stock_cartons} cartons
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                item.expiry_status === 'critical' ? 'bg-rose-500 animate-ping' :
                                item.expiry_status === 'warning' ? 'bg-yellow-400' : 'bg-emerald-400'
                              }`} />
                              <span className="font-medium text-slate-300">{item.expiry_date || 'No Expiry'}</span>
                            </div>
                            {item.days_to_expiry !== null && item.days_to_expiry <= 90 && (
                              <p className="text-[10px] font-bold text-rose-400 mt-0.5">Expires in {item.days_to_expiry} days</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.is_visible
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-500'
                            }`}>
                              {item.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{item.is_visible ? 'Live to Pharmacies' : 'Hidden'}</span>
                            </span>
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
          {/* TAB 3: PHARMACY ORDERS (Kanban & Action Pipeline)           */}
          {/* ============================================================ */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['pending', 'confirmed', 'packed', 'dispatched'].map(statusKey => {
                  const statusOrders = orders.filter(o => o.status === statusKey);
                  return (
                    <div key={statusKey} className="rounded-3xl bg-slate-900/90 border border-white/5 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            statusKey === 'pending' ? 'bg-amber-400' :
                            statusKey === 'confirmed' ? 'bg-blue-400' :
                            statusKey === 'packed' ? 'bg-purple-400' : 'bg-emerald-400'
                          }`} />
                          <span>{statusKey}</span>
                        </h4>
                        <span className="text-xs font-bold text-slate-400">{statusOrders.length}</span>
                      </div>

                      <div className="space-y-2.5 overflow-y-auto max-h-[70vh]">
                        {statusOrders.map(o => (
                          <div key={o.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 hover:border-amber-500/30 transition">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-amber-400 font-bold">{o.order_ref}</span>
                              <span className="text-[10px] text-slate-500">{new Date(o.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <p className="font-extrabold text-sm text-white">{o.pharmacy_name}</p>

                            <div className="space-y-1 text-[11px] text-slate-400 bg-black/30 p-2 rounded-xl">
                              {o.items?.map((it, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span className="truncate max-w-[120px]">{it.brand_name}</span>
                                  <span className="font-bold text-slate-300">x{it.qty_cartons} ctn</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs font-black text-amber-300">{curr} {o.total?.toLocaleString()}</span>
                              <span className="text-[10px] font-bold uppercase text-slate-400">{o.payment_method}</span>
                            </div>

                            {/* Action Buttons depending on current state */}
                            <div className="pt-2 border-t border-white/5 flex gap-1.5">
                              {statusKey === 'pending' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(o.id, 'confirmed')}
                                  className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition apple-press"
                                >
                                  Confirm & Deduct Stock
                                </button>
                              )}

                              {statusKey === 'confirmed' && (
                                <button
                                  onClick={() => {
                                    setSelectedOrderForDelivery(o);
                                    setShowDeliveryModal(true);
                                  }}
                                  className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition apple-press"
                                >
                                  Schedule Dispatch 🚚
                                </button>
                              )}

                              {statusKey === 'dispatched' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(o.id, 'delivered')}
                                  className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition apple-press"
                                >
                                  Mark as Delivered
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: DELIVERIES & FLEET SCHEDULE                          */}
          {/* ============================================================ */}
          {activeTab === 'deliveries' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-2xl">
                <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Scheduled Delivery Fleet & Dispatches</span>
                </h3>

                <div className="divide-y divide-white/5">
                  {deliveries.length > 0 ? (
                    deliveries.map(d => (
                      <div key={d.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">{d.pharmacy_name}</span>
                            <span className="text-xs font-mono text-amber-400 font-bold">#{d.order_ref}</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              d.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                              d.status === 'dispatched' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <span>{d.delivery_address || 'Address provided at checkout'}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Driver: <strong>{d.driver_name || 'Unassigned'}</strong> ({d.driver_phone || 'No phone'}) • Vehicle: {d.vehicle_plate || 'Van'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-amber-300 text-sm">{curr} {d.total?.toLocaleString()}</span>
                          {d.status === 'scheduled' && (
                            <button
                              onClick={async () => {
                                await authFetch(`/api/depot/deliveries/${d.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'dispatched' })
                                });
                                fetchTabData();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                            >
                              Dispatch Van
                            </button>
                          )}
                          {d.status === 'dispatched' && (
                            <button
                              onClick={async () => {
                                await authFetch(`/api/depot/deliveries/${d.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'delivered', proof_note: 'Handed to Pharmacist' })
                                });
                                fetchTabData();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              Confirm Handover
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-8 text-center">No delivery dispatches scheduled.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: FINANCE & INVOICES (COD, Credit, Overdue Tracking)    */}
          {/* ============================================================ */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Pharmacy Invoices & Credit Ledger</span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Pharmacy Client</th>
                        <th className="py-3 px-4">Terms</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Balance Due</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">{inv.invoice_ref}</td>
                          <td className="py-3 px-4 font-bold text-white">{inv.pharmacy_name}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                              {inv.payment_terms}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-white">{curr} {inv.amount?.toLocaleString()}</td>
                          <td className="py-3 px-4 font-black text-rose-400">{curr} {inv.balance?.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-400">{inv.due_date || 'Upon Delivery (COD)'}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                              inv.status === 'overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  setSelectedInvoiceForPayment(inv);
                                  setPaymentForm({ ...paymentForm, amount: inv.balance });
                                  setShowPaymentModal(true);
                                }}
                                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                              >
                                Record Payment
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
          {/* TAB 6: TELESELLER CRM & OUTBOUND LOGS                       */}
          {/* ============================================================ */}
          {activeTab === 'teleseller' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-2xl space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Outbound Teleseller CRM & Pharmacy Call Logs</span>
                </h3>

                <div className="space-y-3">
                  {callLogs.length > 0 ? (
                    callLogs.map(l => (
                      <div key={l.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">{l.pharmacy_name}</span>
                            <span className="text-xs text-slate-400 font-mono">({l.phone_called})</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              l.outcome === 'placed_order' ? 'bg-emerald-500/20 text-emerald-400' :
                              l.outcome === 'interested' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {l.outcome}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{l.notes || 'No call notes recorded.'}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Logged by {l.staff_name} • {new Date(l.called_at).toLocaleString()}</p>
                        </div>
                        {l.follow_up_date && (
                          <div className="text-right">
                            <span className="text-[10px] text-amber-400 uppercase font-bold">Follow-Up Scheduled</span>
                            <p className="text-xs font-extrabold text-white">{l.follow_up_date}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-8 text-center">No teleseller calls logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: CONNECTED PHARMACIES & CREDIT LIMITS                 */}
          {/* ============================================================ */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-2xl space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-amber-400" />
                  <span>Verified Pharmacy Partner Directory</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map(c => (
                    <div key={c.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-black text-sm text-white">{c.pharmacy_name}</h4>
                          <p className="text-xs text-slate-400">{c.contact_name} • {c.county}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          {c.status}
                        </span>
                      </div>

                      <div className="bg-black/30 p-2.5 rounded-xl space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Payment Terms:</span>
                          <span className="font-bold text-amber-300 uppercase">{c.payment_terms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Credit Limit:</span>
                          <span className="font-bold text-white">{curr} {c.credit_limit?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Balance:</span>
                          <span className="font-black text-rose-400">{curr} {c.outstanding_balance?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs pt-1">
                        <a
                          href={`tel:${c.contact_phone}`}
                          className="w-full py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-center transition"
                        >
                          📞 Call Client
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 8: STAFF & CUSTOM PERMISSIONS MATRIX                     */}
          {/* ============================================================ */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-2xl space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Depot Staff & Role-Based Access Control</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                        <th className="py-3 px-4">Staff Name</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {staffList.map(s => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {s.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{s.email || s.phone || 'No direct contact'}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold text-emerald-400">Active</span>
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
          {/* TAB 9: RETURNS & CREDIT NOTES                                */}
          {/* ============================================================ */}
          {activeTab === 'returns' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-5 shadow-2xl space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Pharmacy Damage & Expiry Return Requests</span>
                </h3>

                <div className="space-y-3">
                  {returnsList.length > 0 ? (
                    returnsList.map(r => (
                      <div key={r.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">{r.pharmacy_name}</span>
                            <span className="text-xs font-mono text-amber-400">#{r.return_ref}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                              {r.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">Reason: {r.reason}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-rose-400">Claim: {curr} {r.credit_note_amount}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-8 text-center">No return claims filed.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 3. MODALS (Add Product, Bulk Restock, Schedule Delivery)     */}
      {/* ════════════════════════════════════════════════════════════ */}

      {/* Modal: Add New SKU */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10111a] border border-amber-500/30 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-black text-white text-base">Add Product to Wholesale Catalog</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Augmentin 625mg Tabs (GSK)"
                  value={productForm.brand_name}
                  onChange={e => setProductForm({ ...productForm, brand_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Generic Molecule</label>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin + Clavulanate"
                    value={productForm.generic_name}
                    onChange={e => setProductForm({ ...productForm, generic_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Strength</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg+125mg"
                    value={productForm.strength}
                    onChange={e => setProductForm({ ...productForm, strength: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Carton Size (Units)</label>
                  <input
                    type="number"
                    value={productForm.carton_size}
                    onChange={e => setProductForm({ ...productForm, carton_size: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Carton Price ({curr}) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 12500"
                    value={productForm.carton_price}
                    onChange={e => setProductForm({ ...productForm, carton_price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500 font-bold text-amber-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Initial Stock (Cartons)</label>
                  <input
                    type="number"
                    value={productForm.stock_cartons}
                    onChange={e => setProductForm({ ...productForm, stock_cartons: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Batch Expiry Date</label>
                  <input
                    type="date"
                    value={productForm.expiry_date}
                    onChange={e => setProductForm({ ...productForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition mt-2 shadow-lg shadow-amber-500/20"
              >
                Save & Broadcast to Pharmacies
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Dispatch */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10111a] border border-blue-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-black text-white text-base">Schedule Fleet Dispatch</h3>
              <button onClick={() => setShowDeliveryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleDelivery} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Mwangi"
                  value={deliveryForm.driver_name}
                  onChange={e => setDeliveryForm({ ...deliveryForm, driver_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Driver Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0712345678"
                    value={deliveryForm.driver_phone}
                    onChange={e => setDeliveryForm({ ...deliveryForm, driver_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vehicle Plate</label>
                  <input
                    type="text"
                    placeholder="e.g. KDF 123A"
                    value={deliveryForm.vehicle_plate}
                    onChange={e => setDeliveryForm({ ...deliveryForm, vehicle_plate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Delivery Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Kimathi Street, Nairobi CBD"
                  value={deliveryForm.delivery_address}
                  onChange={e => setDeliveryForm({ ...deliveryForm, delivery_address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition mt-2 shadow-lg"
              >
                Confirm Dispatch & Notify Driver
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Invoice Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10111a] border border-emerald-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-black text-white text-base">Record Payment Receipt</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Amount Paid ({curr}) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-emerald-400 font-black text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Payment Method</label>
                  <select
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer / RTGS</option>
                    <option value="cash">Cash on Delivery (COD)</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">M-Pesa / Bank Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. QX88299A"
                    value={paymentForm.reference}
                    onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition mt-2 shadow-lg"
              >
                Mark Paid & Update Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Receive Inbound Stock */}
      {showBulkRestockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10111a] border border-amber-500/30 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-black text-white text-base">Bulk Warehouse Restocking</h3>
              <button onClick={() => setShowBulkRestockModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkRestock} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Manufacturer / Importer</label>
                  <input
                    type="text"
                    placeholder="e.g. GSK Kenya / Laborex"
                    value={bulkRestockForm.supplier_name}
                    onChange={e => setBulkRestockForm({ ...bulkRestockForm, supplier_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Inbound Invoice Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-99"
                    value={bulkRestockForm.invoice_ref}
                    onChange={e => setBulkRestockForm({ ...bulkRestockForm, invoice_ref: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Catalog Product *</label>
                <select
                  required
                  value={bulkRestockForm.items[0]?.catalog_item_id || ''}
                  onChange={e => {
                    const sel = catalog.find(c => c.id === Number(e.target.value));
                    setBulkRestockForm({
                      ...bulkRestockForm,
                      items: [{
                        ...bulkRestockForm.items[0],
                        catalog_item_id: Number(e.target.value),
                        brand_name: sel?.brand_name || ''
                      }]
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                >
                  <option value="">-- Choose Existing SKU --</option>
                  {catalog.map(c => (
                    <option key={c.id} value={c.id}>{c.brand_name} (Current: {c.stock_cartons} ctn)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cartons Received</label>
                  <input
                    type="number"
                    value={bulkRestockForm.items[0]?.qty_cartons || 10}
                    onChange={e => {
                      const itms = [...bulkRestockForm.items];
                      itms[0].qty_cartons = Number(e.target.value);
                      setBulkRestockForm({ ...bulkRestockForm, items: itms });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Batch Number</label>
                  <input
                    type="text"
                    placeholder="e.g. B88102"
                    value={bulkRestockForm.items[0]?.batch_number || ''}
                    onChange={e => {
                      const itms = [...bulkRestockForm.items];
                      itms[0].batch_number = e.target.value;
                      setBulkRestockForm({ ...bulkRestockForm, items: itms });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Batch Expiry Date</label>
                  <input
                    type="date"
                    value={bulkRestockForm.items[0]?.expiry_date || ''}
                    onChange={e => {
                      const itms = [...bulkRestockForm.items];
                      itms[0].expiry_date = e.target.value;
                      setBulkRestockForm({ ...bulkRestockForm, items: itms });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition mt-2 shadow-lg"
              >
                Commit Inbound Stock & Broadcast Live
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Teleseller Call */}
      {showCallLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10111a] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-black text-white text-base">Record Pharmacy Outbound Call</h3>
              <button onClick={() => setShowCallLogModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogCall} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Pharmacy Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Chemist Nairobi"
                  value={callLogForm.pharmacy_name}
                  onChange={e => setCallLogForm({ ...callLogForm, pharmacy_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 0722000000"
                    value={callLogForm.phone_called}
                    onChange={e => setCallLogForm({ ...callLogForm, phone_called: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Call Outcome</label>
                  <select
                    value={callLogForm.outcome}
                    onChange={e => setCallLogForm({ ...callLogForm, outcome: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none font-bold"
                  >
                    <option value="interested">Interested in Restock</option>
                    <option value="placed_order">Placed Bulk Order</option>
                    <option value="no_answer">No Answer / Busy</option>
                    <option value="callback">Callback Requested</option>
                    <option value="declined">Stock Sufficient</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  value={callLogForm.follow_up_date}
                  onChange={e => setCallLogForm({ ...callLogForm, follow_up_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Call Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Needs 50 cartons of Augmentin next Monday when grant is disbursed."
                  value={callLogForm.notes}
                  onChange={e => setCallLogForm({ ...callLogForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition mt-2 shadow-lg"
              >
                Save Call Entry to CRM
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Staff */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10111a] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-black text-white text-base">Add Depot Team Member</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Ochieng"
                  value={staffForm.name}
                  onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role in Wholesale</label>
                  <select
                    value={staffForm.role}
                    onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none font-bold"
                  >
                    <option value="teleseller">Teleseller / Sales Rep</option>
                    <option value="warehouse">Warehouse Manager</option>
                    <option value="driver">Delivery Driver</option>
                    <option value="accountant">Accountant / Finance</option>
                    <option value="admin">Depot Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="07..."
                    value={staffForm.phone}
                    onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email</label>
                <input
                  type="email"
                  placeholder="staff@depot.co.ke"
                  value={staffForm.email}
                  onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition mt-2 shadow-lg"
              >
                Create Staff Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link Pharmacy */}
      {showNewConnectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10111a] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-black text-white text-base">Connect Retail Pharmacy</h3>
              <button onClick={() => setShowNewConnectionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddConnection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Pharmacy Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crown Community Pharmacy"
                  value={connectionForm.pharmacy_name}
                  onChange={e => setConnectionForm({ ...connectionForm, pharmacy_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Kamau"
                    value={connectionForm.contact_name}
                    onChange={e => setConnectionForm({ ...connectionForm, contact_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="07..."
                    value={connectionForm.contact_phone}
                    onChange={e => setConnectionForm({ ...connectionForm, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Payment Terms</label>
                  <select
                    value={connectionForm.payment_terms}
                    onChange={e => setConnectionForm({ ...connectionForm, payment_terms: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none font-bold"
                  >
                    <option value="COD">Cash On Delivery (COD)</option>
                    <option value="credit_30">Credit 30 Days</option>
                    <option value="credit_60">Credit 60 Days</option>
                    <option value="upfront">Upfront Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Credit Limit ({curr})</label>
                  <input
                    type="number"
                    value={connectionForm.credit_limit}
                    onChange={e => setConnectionForm({ ...connectionForm, credit_limit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white outline-none font-bold text-amber-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition mt-2 shadow-lg"
              >
                Approve & Link Partner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

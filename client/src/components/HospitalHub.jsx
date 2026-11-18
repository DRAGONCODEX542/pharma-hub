import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartPulse,
  UserPlus,
  Users,
  Stethoscope,
  Activity,
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  ArrowRight,
  ChevronRight,
  Calendar,
  Phone,
  Shield,
  FileText,
  Thermometer,
  Send,
  Building,
  RefreshCw,
  Bed,
  Check,
  X,
  DollarSign,
  CreditCard,
  Receipt,
  Printer,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  Layers,
  ArrowUpRight,
  UserCheck,
  Lock,
  Eye,
  AlertTriangle,
  Building2,
  Filter
} from 'lucide-react';
import SoloPOS from './SoloPOS';

// Hospital Staff Role Presets
export const HOSPITAL_ROLE_PRESETS = [
  {
    id: 'doctor_general',
    label: '👨‍⚕️ General Practitioner (MO)',
    role: 'doctor_general',
    title: 'Medical Officer',
    desc: 'Conduct OPD consultations, view triage vitals, and issue hospital e-prescriptions'
  },
  {
    id: 'doctor_specialist',
    label: '🩺 Specialist Physician / Surgeon',
    role: 'doctor_specialist',
    title: 'Specialist Consultant',
    desc: 'Specialized clinic appointments, surgical reviews, and prescription authorization'
  },
  {
    id: 'nurse_triage',
    label: '💉 Triage & Outpatient Nurse',
    role: 'nurse_triage',
    title: 'Triage Nurse',
    desc: 'Capture vitals (BP, pulse, temp, SpO2, sugar), assign priority, and route to doctor'
  },
  {
    id: 'nurse_ward',
    label: '🏥 Inpatient / Ward Nurse',
    role: 'nurse_ward',
    title: 'Ward Staff Nurse',
    desc: 'Bed allocation, patient vitals monitoring, and ward medication charting'
  },
  {
    id: 'pharmacist',
    label: '💊 Hospital Pharmacist',
    role: 'pharmacist',
    title: 'Hospital Pharmacist',
    desc: 'Review live doctor e-prescriptions, dispense medicines, and check drug formulary stock'
  },
  {
    id: 'receptionist',
    label: '📋 Front Desk & OPD Receptionist',
    role: 'receptionist',
    title: 'Reception Officer',
    desc: 'Register new patients, issue OPD numbers, manage insurance, and check patients into queues'
  },
  {
    id: 'cashier',
    label: '💰 Hospital Cashier & Billing',
    role: 'cashier',
    title: 'Billing Cashier',
    desc: 'Collect consultation & drug payments via Cash, M-Pesa, or SHA/NHIF, and issue receipts'
  },
  {
    id: 'admin',
    label: '👑 Hospital Medical Director / Admin',
    role: 'admin',
    title: 'Hospital Administrator',
    desc: 'Full administrative access across all departments, staff duty roster, and financial oversight'
  }
];

export default function HospitalHub({
  currentUser,
  authFetch,
  showToast,
  isDarkMode,
  setIsDarkMode,
  handleLogout,
  handleSwitchAccountType,
  setShowSubscriptionModal
}) {
  // Navigation tabs in Hospital Hub
  const [activeTab, setActiveTab] = useState('reception'); // 'dashboard', 'reception', 'triage', 'doctor', 'pharmacy', 'billing', 'staff', 'settings'
  const [loading, setLoading] = useState(false);

  // Core Data States
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [billingQueue, setBillingQueue] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [hospitalStats, setHospitalStats] = useState({
    total_patients: 0,
    today_visits: 0,
    active_queue: 0,
    dispensed_prescriptions: 0
  });

  // Filter & Search states
  const [patientSearch, setPatientSearch] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');

  // Dual-mode Hospital Pharmacy states
  const [pharmacySubTab, setPharmacySubTab] = useState('prescriptions'); // 'prescriptions' | 'pos' | 'stock'
  const [posLoadedCart, setPosLoadedCart] = useState([]);
  const [posLoadedCustomer, setPosLoadedCustomer] = useState(null);
  const [activeLoadedPrescription, setActiveLoadedPrescription] = useState(null);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('All');

  // Modals
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  // Selected Records for Actions
  const [selectedVisitForTriage, setSelectedVisitForTriage] = useState(null);
  const [selectedVisitForDoctor, setSelectedVisitForDoctor] = useState(null);
  const [selectedVisitForBilling, setSelectedVisitForBilling] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  // Forms
  const [newPatientForm, setNewPatientForm] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    phone: '',
    national_id: '',
    address: '',
    emergency_contact: '',
    insurance_provider: 'Cash',
    insurance_policy_no: '',
    blood_group: 'O+',
    allergies: ''
  });

  const [triageForm, setTriageForm] = useState({
    bp_systolic: 120,
    bp_diastolic: 80,
    pulse_rate: 72,
    temperature: 36.6,
    weight_kg: 68,
    spo2: 98,
    blood_sugar: 5.5,
    triage_priority: 'normal',
    triage_notes: '',
    assigned_doctor: 'Dr. General Duty'
  });

  const [consultForm, setConsultForm] = useState({
    doctor_notes: '',
    diagnosis: ''
  });

  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicine_id: '', medicine_name: '', dosage: '1 tab', frequency: 'TID (3x daily)', duration_days: 5, quantity: 15, instructions: 'Take after meals' }
  ]);

  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'Cash',
    reference_code: '',
    amount_paid: ''
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor_general',
    staff_title: 'Medical Officer',
    specialization: 'General Practice',
    pin_code: ''
  });

  const [facilitySettings, setFacilitySettings] = useState({
    name: currentUser?.pharmacy_name || 'Metropolitan Hospital',
    mfl_code: 'MFL-29481',
    address: currentUser?.address || 'Nairobi, Kenya',
    phone: currentUser?.phone || '+254 700 000 000',
    currency: currentUser?.currency_symbol || 'KSh'
  });

  const curr = facilitySettings.currency || 'KSh';

  // Permissions helper
  const isHospitalAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const userRole = currentUser?.role || 'staff';

  // --- API DATA FETCHERS ---
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/hospital/queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async (query = '') => {
    try {
      const res = await authFetch(`/api/hospital/patients${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPendingPrescriptions = async () => {
    try {
      const res = await authFetch('/api/hospital/prescriptions/pending');
      if (res.ok) {
        const data = await res.json();
        setPendingPrescriptions(data.prescriptions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBillingQueue = async () => {
    try {
      const res = await authFetch('/api/hospital/billing/pending');
      if (res.ok) {
        const data = await res.json();
        setBillingQueue(data.billing_queue || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await authFetch('/api/medicines');
      if (res.ok) {
        const data = await res.json();
        setMedicines(Array.isArray(data) ? data : data.medicines || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await authFetch('/api/organization/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHospitalStats = async () => {
    try {
      const res = await authFetch('/api/hospital/stats');
      if (res.ok) {
        const data = await res.json();
        setHospitalStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Initial load
  useEffect(() => {
    fetchQueue();
    fetchPatients();
    fetchMedicines();
    fetchHospitalStats();
  }, []);

  // Fetch when switching tabs
  useEffect(() => {
    if (activeTab === 'pharmacy') fetchPendingPrescriptions();
    if (activeTab === 'billing') fetchBillingQueue();
    if (activeTab === 'staff') fetchStaff();
    if (activeTab === 'dashboard') {
      fetchHospitalStats();
      fetchQueue();
    }
  }, [activeTab]);

  // --- ACTIONS ---

  // 1. Patient Registration (Reception)
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!newPatientForm.full_name.trim()) {
      showToast('Patient full name is required', 'error');
      return;
    }
    try {
      const res = await authFetch('/api/hospital/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientForm)
      });
      const data = await res.json();
      if (res.ok && data.patient) {
        showToast(`Patient registered! OPD: ${data.patient.opd_number}`, 'success');
        setShowNewPatientModal(false);
        // Automatically check-in to triage queue
        await authFetch('/api/hospital/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: data.patient.id, initial_stage: 'triage' })
        });
        fetchQueue();
        fetchPatients();
        fetchHospitalStats();
        setNewPatientForm({
          full_name: '', age: '', gender: 'Male', phone: '',
          national_id: '', address: '', emergency_contact: '',
          insurance_provider: 'Cash', insurance_policy_no: '',
          blood_group: 'O+', allergies: ''
        });
      } else {
        showToast(data.error || 'Failed to register patient', 'error');
      }
    } catch {
      showToast('Error registering patient', 'error');
    }
  };

  // 2. Check-in Existing Patient (Reception)
  const handleCheckInPatient = async (patientId) => {
    try {
      const res = await authFetch('/api/hospital/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, initial_stage: 'triage' })
      });
      if (res.ok) {
        showToast('Patient queued for Triage', 'success');
        fetchQueue();
        fetchHospitalStats();
      }
    } catch {
      showToast('Error checking in patient', 'error');
    }
  };

  // 3. Submit Triage (Nursing Station)
  const handleSubmitTriage = async (e) => {
    e.preventDefault();
    if (!selectedVisitForTriage) return;
    try {
      const res = await authFetch(`/api/hospital/visits/${selectedVisitForTriage.id}/triage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...triageForm,
          next_stage: 'doctor'
        })
      });
      if (res.ok) {
        showToast('Vitals captured! Patient forwarded to Doctor Clinic', 'success');
        setShowTriageModal(false);
        setSelectedVisitForTriage(null);
        fetchQueue();
        fetchHospitalStats();
      } else {
        showToast('Failed to save triage', 'error');
      }
    } catch {
      showToast('Error submitting triage', 'error');
    }
  };

  // 4. Doctor Prescription Items Builder
  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicine_id: '', medicine_name: '', dosage: '1 tab', frequency: 'TID (3x daily)', duration_days: 5, quantity: 15, instructions: 'Take after meals' }
    ]);
  };

  const handleRemovePrescriptionItem = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handlePrescriptionItemChange = (index, field, value) => {
    const next = [...prescriptionItems];
    next[index][field] = value;
    if (field === 'medicine_id') {
      const med = medicines.find(m => String(m.id) === String(value));
      if (med) {
        next[index].medicine_name = med.brand_name || med.molecule_name;
      }
    }
    setPrescriptionItems(next);
  };

  // 5. Submit Doctor Consultation & E-Prescription
  const handleSubmitDoctorConsultation = async (e) => {
    e.preventDefault();
    if (!selectedVisitForDoctor) return;
    try {
      // 1. Save doctor notes
      await authFetch(`/api/hospital/visits/${selectedVisitForDoctor.id}/consultation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_notes: consultForm.doctor_notes,
          diagnosis: consultForm.diagnosis,
          next_stage: prescriptionItems.some(it => it.medicine_name.trim().length > 0) ? 'pharmacy' : 'completed'
        })
      });

      // 2. Transmit e-prescription to in-house pharmacy
      const validItems = prescriptionItems.filter(it => it.medicine_name.trim().length > 0);
      if (validItems.length > 0) {
        await authFetch('/api/hospital/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visit_id: selectedVisitForDoctor.id,
            patient_id: selectedVisitForDoctor.patient_id,
            prescribing_doctor: currentUser?.name || 'Dr. On Duty',
            items: validItems
          })
        });
        showToast('E-Prescription transmitted to Hospital Pharmacy in real time!', 'success');
      } else {
        showToast('Consultation saved successfully', 'success');
      }

      setShowConsultModal(false);
      setSelectedVisitForDoctor(null);
      setConsultForm({ doctor_notes: '', diagnosis: '' });
      setPrescriptionItems([{ medicine_id: '', medicine_name: '', dosage: '1 tab', frequency: 'TID (3x daily)', duration_days: 5, quantity: 15, instructions: 'Take after meals' }]);
      fetchQueue();
      fetchHospitalStats();
    } catch {
      showToast('Error saving consultation', 'error');
    }
  };

  // 6. Dispense Prescription in Hospital Pharmacy (Route to Cashier)
  const handleDispensePrescription = async (prescriptionId) => {
    try {
      const res = await authFetch(`/api/hospital/prescriptions/${prescriptionId}/dispense`, {
        method: 'PUT'
      });
      if (res.ok) {
        showToast('Prescription dispensed! Patient routed to Reception Cashier for billing', 'success');
        fetchPendingPrescriptions();
        fetchQueue();
        fetchHospitalStats();
        fetchMedicines();
      }
    } catch {
      showToast('Error dispensing prescription', 'error');
    }
  };

  // 6B. Load Doctor Prescription directly into POS Counter for immediate checkout
  const handleLoadPrescriptionIntoPOS = (presc) => {
    const loadedItems = (presc.items || []).map(it => {
      const drug = medicines.find(m =>
        (it.medicine_id && String(m.id) === String(it.medicine_id)) ||
        (m.brand_name && m.brand_name.toLowerCase() === (it.medication_name || '').toLowerCase()) ||
        (m.molecule_name && m.molecule_name.toLowerCase() === (it.medication_name || '').toLowerCase())
      );

      const unitPrice = drug?.unit_price || drug?.pack_price || 50;
      const drugName = drug?.brand_name || it.medication_name || 'Prescribed Medicine';
      const drugDosage = drug?.strength || it.dosage || '';
      const maxStock = drug?.total_packs ?? drug?.stock_boxes ?? 999;

      return {
        drugId: drug?.id || it.medicine_id || Math.floor(Math.random() * 10000),
        name: drugName,
        dosage: drugDosage,
        unitType: 'unit',
        unitPrice: Number(unitPrice),
        quantity: Number(it.quantity || 1),
        maxStock: Number(maxStock)
      };
    });

    setPosLoadedCart(loadedItems);
    setPosLoadedCustomer({
      name: `${presc.patient_name} (${presc.opd_number})`,
      phone: presc.phone || ''
    });
    setActiveLoadedPrescription(presc);
    setPharmacySubTab('pos');
    showToast(`Loaded prescription for ${presc.patient_name} into POS Counter! 🛒`, 'success');
  };

  // 6C. Complete POS Sale at Hospital Pharmacy Counter
  const handleHospitalPOSSale = async (salePayload) => {
    try {
      const payload = {
        customer_name: salePayload.customer_name || 'Walk-in Patient',
        customer_phone: salePayload.customer_phone || '',
        payment_method: salePayload.payment_method === 'credit' ? 'loan' : salePayload.payment_method,
        prescribing_doctor: activeLoadedPrescription?.doctor_name || '',
        prescription_number: activeLoadedPrescription?.opd_number || '',
        discount: Number(salePayload.discount || 0),
        items: salePayload.items.map(it => ({
          medicine_id: it.drug_id,
          unit_type: it.unit_type || 'unit',
          quantity: it.quantity,
          unit_price: it.unit_price,
          total_price: it.total_price || (it.unit_price * it.quantity),
          dosage_instruction: it.dosage || ''
        }))
      };

      const res = await authFetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        if (activeLoadedPrescription?.id) {
          try {
            await authFetch(`/api/hospital/prescriptions/${activeLoadedPrescription.id}/dispense`, {
              method: 'PUT'
            });
          } catch (e) {
            console.warn('Prescription dispense fallback:', e);
          }
          setActiveLoadedPrescription(null);
          setPosLoadedCart([]);
          setPosLoadedCustomer(null);
          fetchPendingPrescriptions();
        }

        showToast(
          salePayload.payment_method === 'credit'
            ? 'Customer loan recorded!'
            : `Sale completed & medicines dispensed! Receipt #${data.receipt_number || data.sale_id}`,
          'success'
        );

        fetchMedicines();
        fetchQueue();
        fetchHospitalStats();
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

  // 7. Collect Billing & Discharge Patient
  const handleSettleBilling = async (e) => {
    e.preventDefault();
    if (!selectedVisitForBilling) return;
    try {
      const res = await authFetch('/api/hospital/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_id: selectedVisitForBilling.id,
          payment_method: paymentForm.payment_method,
          reference_code: paymentForm.reference_code,
          amount_paid: selectedVisitForBilling.total_amount
        })
      });
      if (res.ok) {
        showToast('Payment settled! Patient visit discharged and completed', 'success');
        setShowBillingModal(false);
        setReceiptData({
          ...selectedVisitForBilling,
          payment_method: paymentForm.payment_method,
          reference_code: paymentForm.reference_code,
          paid_at: new Date().toLocaleString()
        });
        setShowReceiptModal(true);
        fetchBillingQueue();
        fetchQueue();
        fetchHospitalStats();
      } else {
        showToast('Failed to settle billing', 'error');
      }
    } catch {
      showToast('Error processing payment', 'error');
    }
  };

  // 8. Add Hospital Staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) {
      showToast('Staff name and email are required', 'error');
      return;
    }
    try {
      const res = await authFetch('/api/organization/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffForm.name,
          email: staffForm.email,
          phone: staffForm.phone,
          role: staffForm.role,
          staff_title: staffForm.staff_title,
          pin_code: staffForm.pin_code,
          permissions: ['hospital', 'pos']
        })
      });
      if (res.ok) {
        showToast('Hospital staff member added successfully', 'success');
        setShowAddStaffModal(false);
        setStaffForm({
          name: '', email: '', phone: '', role: 'doctor_general',
          staff_title: 'Medical Officer', specialization: 'General Practice', pin_code: ''
        });
        fetchStaff();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to add staff', 'error');
      }
    } catch {
      showToast('Error saving staff member', 'error');
    }
  };

  // Filtered views
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter(p =>
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.opd_number || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q)
    );
  }, [patients, patientSearch]);

  const triageWaiting = queue.filter(q => q.stage === 'triage');
  const doctorWaiting = queue.filter(q => q.stage === 'doctor');
  const pharmacyWaiting = queue.filter(q => q.stage === 'pharmacy');
  const billingWaiting = queue.filter(q => q.stage === 'billing' || q.status === 'pending_payment');

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f5f7fb] text-slate-900'
    }`}>
      {/* ════════════════════════════════════════════════════════════ */}
      {/* 1. DEDICATED HOSPITAL HUB SIDEBAR                           */}
      {/* ════════════════════════════════════════════════════════════ */}
      <aside className={`hidden md:flex flex-col w-64 shrink-0 transition-colors duration-300 shadow-2xl h-screen sticky top-0 z-30 ${
        isDarkMode ? 'bg-[#0c0f17] border-r border-blue-500/20' : 'bg-white border-r border-slate-200'
      }`}>
        {/* Hospital Branding */}
        <div className={`p-5 border-b ${isDarkMode ? 'border-blue-500/15' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-sky-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-sm font-black truncate tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {facilitySettings.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Hospital Hub (HIS)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Dark Mode Bar */}
        <div className={`px-5 py-2.5 border-b flex items-center justify-between text-xs font-semibold ${
          isDarkMode ? 'bg-blue-500/5 border-blue-500/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Facility Base:</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-600 dark:text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-md border border-blue-500/30 text-[11px]">
              {curr}
            </span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded-lg transition ${
                isDarkMode ? 'text-blue-400 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-200'
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Hospital Overview', icon: Layers, badge: null },
            { id: 'reception', label: 'Reception & OPD', icon: UserPlus, badge: queue.length > 0 ? queue.length : null },
            { id: 'triage', label: 'Nurse Station (Triage)', icon: Activity, badge: triageWaiting.length > 0 ? triageWaiting.length : null, badgeColor: 'bg-emerald-500' },
            { id: 'doctor', label: 'Doctor Clinic (EHR)', icon: Stethoscope, badge: doctorWaiting.length > 0 ? doctorWaiting.length : null, badgeColor: 'bg-blue-500' },
            { id: 'pharmacy', label: 'Hospital Pharmacy', icon: Pill, badge: pendingPrescriptions.length > 0 ? pendingPrescriptions.length : null, badgeColor: 'bg-purple-500' },
            { id: 'billing', label: 'Cashier & Billing', icon: DollarSign, badge: billingWaiting.length > 0 ? billingWaiting.length : null, badgeColor: 'bg-amber-500' },
            { id: 'staff', label: 'Staff & Duty Roster', icon: Users, badge: null },
            { id: 'settings', label: 'Hospital Settings', icon: Building, badge: null }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition apple-spring ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full text-white ${tab.badgeColor || 'bg-blue-500'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Portal Switcher & Logout */}
        <div className={`p-3 border-t space-y-1.5 ${isDarkMode ? 'border-blue-500/15 bg-blue-950/20' : 'border-slate-200 bg-slate-50/70'}`}>
          <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged In As</p>
            <p className="text-xs font-black truncate text-slate-800 dark:text-slate-200 mt-0.5">{currentUser?.name || 'Dr. Administrator'}</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{currentUser?.staff_title || 'Hospital Administrator'}</p>
          </div>

          <button
            onClick={() => setShowWorkspaceModal(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
              isDarkMode ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Switch Hub / Portal</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN VIEW AREA                                            */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className={`h-16 px-4 md:px-6 border-b flex items-center justify-between shrink-0 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#0c0f17] border-blue-500/15' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                🏥
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base md:text-lg font-black tracking-tight capitalize text-slate-900 dark:text-white">
                  {activeTab.replace('_', ' ')}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {facilitySettings.mfl_code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Hospital Information System &bull; Unified Clinical & Pharmacy Flow
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => {
                fetchQueue();
                fetchHospitalStats();
                if (activeTab === 'pharmacy') fetchPendingPrescriptions();
                if (activeTab === 'billing') fetchBillingQueue();
                showToast('Refreshed data', 'success');
              }}
              className="p-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'reception' && (
              <button
                onClick={() => setShowNewPatientModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition apple-spring flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Register Patient</span>
              </button>
            )}

            {activeTab === 'staff' && (
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition apple-spring flex items-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Hospital Staff</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex overflow-x-auto gap-1 p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          {[
            { id: 'dashboard', label: 'Overview' },
            { id: 'reception', label: 'Reception' },
            { id: 'triage', label: 'Triage' },
            { id: 'doctor', label: 'Doctor' },
            { id: 'pharmacy', label: 'Pharmacy' },
            { id: 'billing', label: 'Cashier' },
            { id: 'staff', label: 'Staff' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 1: DASHBOARD & WORKFLOW OVERVIEW                       */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Patients</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{hospitalStats.total_patients}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Registered OPD records</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Today's Visits</span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{hospitalStats.today_visits}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Checked in today</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Queue</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{hospitalStats.active_queue}</p>
                  <p className="text-[11px] text-slate-400 mt-1">In triage, doctor, or pharmacy</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Dispensed Rx</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{hospitalStats.dispensed_prescriptions}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Fulfilled in pharmacy</p>
                </div>
              </div>

              {/* Visual Synchronized Hospital Workflow Journey */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-cyan-950/30 border border-blue-500/30 text-white shadow-xl">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Integrated Synchronized Clinical Architecture</span>
                </div>
                <h3 className="text-lg font-black">Patient Care Flow & In-House Pharmacy Synchronization</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Every step is connected in real-time. Doctors inspect real-time in-house drug stock, nurses record vitals, prescriptions route directly to the dispensary, and cashier billing settles all accounts before patient exit.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-6">
                  {[
                    { step: '1', title: 'Reception OPD', desc: 'Patient arrives, registers, and gets queued', count: queue.length },
                    { step: '2', title: 'Nursing Triage', desc: 'Vitals captured: BP, temp, pulse, SpO2 & sugar', count: triageWaiting.length },
                    { step: '3', title: 'Doctor Clinic', desc: 'Clinical notes, stock check & e-prescription', count: doctorWaiting.length },
                    { step: '4', title: 'Hospital Pharmacy', desc: 'Pharmacist dispenses medications from stock', count: pendingPrescriptions.length },
                    { step: '5', title: 'Reception Billing', desc: 'Cashier collects payment & discharges patient', count: billingWaiting.length }
                  ].map((s, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center font-black text-xs">
                          {s.step}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                          {s.count} in line
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{s.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Hospital Live Queue */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">Active Patient Queue Across All Stations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status of patients currently inside the hospital</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {queue.length} Active
                  </span>
                </div>

                {queue.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <HeartPulse className="w-10 h-10 mx-auto opacity-30 text-blue-500" />
                    <p className="text-sm font-semibold">No patients currently in the hospital queue</p>
                    <p className="text-xs">Go to Reception OPD to register or check in a patient.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Patient</th>
                          <th className="py-3 px-4">OPD #</th>
                          <th className="py-3 px-4">Station</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Vitals Summary</th>
                          <th className="py-3 px-4">Waiting Since</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                        {queue.map(q => (
                          <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {q.patient_name}
                              <span className="block text-[10px] text-slate-400 font-normal">{q.gender}, {q.age} yrs</span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{q.opd_number}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[9px] tracking-wider ${
                                q.stage === 'triage' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                q.stage === 'doctor' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                                q.stage === 'pharmacy' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' :
                                q.stage === 'billing' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                                'bg-slate-500/15 text-slate-600'
                              }`}>
                                {q.stage}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                q.triage_priority === 'critical' ? 'bg-rose-500 text-white' :
                                q.triage_priority === 'urgent' ? 'bg-amber-500 text-white' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}>
                                {q.triage_priority || 'normal'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[11px] text-slate-500">
                              {q.bp_systolic ? `${q.bp_systolic}/${q.bp_diastolic} mmHg, ${q.pulse_rate} bpm` : 'Pending triage'}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">{new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="py-3 px-4 text-right">
                              {q.stage === 'triage' && (
                                <button
                                  onClick={() => {
                                    setSelectedVisitForTriage(q);
                                    setShowTriageModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                                >
                                  Triage Now
                                </button>
                              )}
                              {q.stage === 'doctor' && (
                                <button
                                  onClick={() => {
                                    setSelectedVisitForDoctor(q);
                                    setShowConsultModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition"
                                >
                                  Consult
                                </button>
                              )}
                              {q.stage === 'pharmacy' && (
                                <button
                                  onClick={() => setActiveTab('pharmacy')}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition"
                                >
                                  View Rx
                                </button>
                              )}
                              {q.stage === 'billing' && (
                                <button
                                  onClick={() => setActiveTab('billing')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition"
                                >
                                  Settle Bill
                                </button>
                              )}
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

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 2: RECEPTION & OPD                                     */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'reception' && (
            <div className="space-y-6">
              {/* Header and Quick Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patient by name, OPD number, or phone..."
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowNewPatientModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition apple-spring flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register New Patient</span>
                </button>
              </div>

              {/* Patient Directory Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Registered Hospital Patients ({filteredPatients.length})</h3>
                  <span className="text-xs text-slate-400">Click Check-in to start OPD visit</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">OPD Number</th>
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">Demographics</th>
                        <th className="py-3 px-4">Phone / Contact</th>
                        <th className="py-3 px-4">Insurance Provider</th>
                        <th className="py-3 px-4">Blood Group</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                      {filteredPatients.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{p.opd_number}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.full_name}</td>
                          <td className="py-3 px-4 text-slate-500">{p.gender}, {p.age} years</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{p.phone || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                              {p.insurance_provider || 'Cash'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-rose-500">{p.blood_group || 'O+'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleCheckInPatient(p.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition apple-press"
                            >
                              Check-In OPD &rarr;
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

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 3: NURSE STATION (TRIAGE)                              */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'triage' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Nursing Triage Station:</strong> Measure and record patient vitals before doctor consultation. Patients are tagged as Normal, Urgent, or Critical.</span>
                </div>
                <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
                  {triageWaiting.length} Awaiting Vitals
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {triageWaiting.map(visit => (
                  <div key={visit.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-500">{visit.opd_number}</span>
                        <h4 className="font-black text-slate-900 dark:text-white text-base mt-0.5">{visit.patient_name}</h4>
                        <p className="text-xs text-slate-400">{visit.gender}, {visit.age} yrs &bull; {visit.insurance_provider || 'Cash'}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600">
                        In Triage
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
                      <span>Waiting: {new Date(visit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => {
                          setSelectedVisitForTriage(visit);
                          setShowTriageModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition apple-spring flex items-center space-x-1"
                      >
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>Record Vitals &rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {triageWaiting.length === 0 && (
                <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10">
                  <Activity className="w-10 h-10 mx-auto opacity-30 text-emerald-500 mb-2" />
                  <p className="font-bold text-sm">No patients waiting in Triage queue</p>
                  <p className="text-xs mt-1">Patients checked in from Reception OPD will appear here automatically.</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 4: DOCTOR CLINIC (EHR & E-PRESCRIPTIONS)                */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'doctor' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-blue-500 shrink-0" />
                  <span><strong>Doctor Consultation & EHR:</strong> Review recorded triage vitals, conduct clinical examination, check live in-house pharmacy formulary stock, and transmit e-prescriptions directly to the dispensary.</span>
                </div>
                <span className="font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px]">
                  {doctorWaiting.length} Awaiting Doctor
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctorWaiting.map(visit => (
                  <div key={visit.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-500">{visit.opd_number}</span>
                        <h4 className="font-black text-slate-900 dark:text-white text-base mt-0.5">{visit.patient_name}</h4>
                        <p className="text-xs text-slate-400">{visit.gender}, {visit.age} yrs &bull; {visit.insurance_provider || 'Cash'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        visit.triage_priority === 'critical' ? 'bg-rose-500 text-white' :
                        visit.triage_priority === 'urgent' ? 'bg-amber-500 text-white' :
                        'bg-blue-500/15 text-blue-600'
                      }`}>
                        {visit.triage_priority || 'Normal'}
                      </span>
                    </div>

                    {/* Vitals summary badges */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">BP (mmHg)</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{visit.bp_systolic || 120}/{visit.bp_diastolic || 80}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Pulse</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{visit.pulse_rate || 72} bpm</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Temp</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{visit.temperature || 36.6} °C</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedVisitForDoctor(visit);
                        setShowConsultModal(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition apple-spring flex items-center justify-center space-x-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Start EHR Consultation & Prescription &rarr;</span>
                    </button>
                  </div>
                ))}
              </div>

              {doctorWaiting.length === 0 && (
                <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10">
                  <Stethoscope className="w-10 h-10 mx-auto opacity-30 text-blue-500 mb-2" />
                  <p className="font-bold text-sm">No patients waiting for Doctor consultation</p>
                  <p className="text-xs mt-1">Once nurses complete triage vitals, patients appear here immediately.</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 5: IN-HOUSE HOSPITAL PHARMACY & DISPENSING             */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'pharmacy' && (
            <div className="space-y-6">
              {/* Dual-Mode Pharmacy Sub-Navigation Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setPharmacySubTab('prescriptions')}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition apple-spring flex items-center space-x-2 shrink-0 ${
                      pharmacySubTab === 'prescriptions'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Doctor Prescriptions Queue</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      pharmacySubTab === 'prescriptions' ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                    }`}>
                      {pendingPrescriptions.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPharmacySubTab('pos')}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition apple-spring flex items-center space-x-2 shrink-0 ${
                      pharmacySubTab === 'pos'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Walk-In POS Dispensing Counter</span>
                    {activeLoadedPrescription && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPharmacySubTab('stock')}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition apple-spring flex items-center space-x-2 shrink-0 ${
                      pharmacySubTab === 'stock'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Hospital Formulary & Stock</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      pharmacySubTab === 'stock' ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      {medicines.length}
                    </span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 pr-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-[11px]">Live Stock Sync Active</span>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* SUB-VIEW 1: DOCTOR PRESCRIPTIONS LIVE STREAM QUEUE        */}
              {/* ────────────────────────────────────────────────────────── */}
              {pharmacySubTab === 'prescriptions' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent border border-purple-500/20 text-purple-900 dark:text-purple-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                        Rx
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Doctor E-Prescriptions Stream</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Prescriptions sent from Doctor Clinic rooms appear here live. Dispense directly to Reception Cashier or load into POS Counter.
                        </p>
                      </div>
                    </div>
                    <span className="font-black px-3 py-1 rounded-full bg-purple-600 text-white text-xs self-start sm:self-center shadow-xs">
                      {pendingPrescriptions.length} Waiting
                    </span>
                  </div>

                  <div className="space-y-4">
                    {pendingPrescriptions.map(presc => (
                      <div key={presc.id} className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 transition hover:border-purple-500/40">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                          <div>
                            <div className="flex items-center space-x-2.5 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                {presc.opd_number}
                              </span>
                              <h4 className="font-black text-slate-900 dark:text-white text-lg">{presc.patient_name}</h4>
                              <span className="text-xs text-slate-500 dark:text-slate-400">({presc.age} yrs &bull; {presc.gender})</span>
                              {presc.insurance_provider && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                                  {presc.insurance_provider}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                              <span>Prescribed by: <strong className="text-slate-800 dark:text-slate-200">{presc.doctor_name || 'Dr. On Duty'}</strong></span>
                              <span>&bull;</span>
                              <span>{new Date(presc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {presc.diagnosis && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-purple-600 dark:text-purple-400 font-semibold italic">Dx: {presc.diagnosis}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Dual Action Buttons */}
                          <div className="flex items-center space-x-2 w-full lg:w-auto">
                            <button
                              type="button"
                              onClick={() => handleLoadPrescriptionIntoPOS(presc)}
                              className="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition apple-spring flex items-center justify-center space-x-1.5"
                              title="Load prescribed items into Walk-in POS counter to collect payment right here"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Load into POS & Charge Here</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDispensePrescription(presc.id)}
                              className="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition apple-spring flex items-center justify-center space-x-1.5"
                              title="Dispense medicines and route patient to Reception Billing desk"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Dispense & Route to Cashier</span>
                            </button>
                          </div>
                        </div>

                        {/* Prescribed Items Table with Live Stock Verification */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-black text-[9px] tracking-wider rounded-xl">
                              <tr>
                                <th className="py-2.5 px-3">Medication</th>
                                <th className="py-2.5 px-3">Dosage & Frequency</th>
                                <th className="py-2.5 px-3">Duration</th>
                                <th className="py-2.5 px-3">Qty Prescribed</th>
                                <th className="py-2.5 px-3">Hospital Stock Availability</th>
                                <th className="py-2.5 px-3">Instructions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                              {(presc.items || []).map((it, idx) => {
                                const stockMatch = medicines.find(m =>
                                  (it.medicine_id && String(m.id) === String(it.medicine_id)) ||
                                  (m.brand_name && m.brand_name.toLowerCase() === (it.medication_name || '').toLowerCase()) ||
                                  (m.molecule_name && m.molecule_name.toLowerCase() === (it.medication_name || '').toLowerCase())
                                );
                                const availablePacks = stockMatch?.total_packs ?? stockMatch?.stock_boxes ?? 0;
                                const isAvailable = availablePacks > 0 || (stockMatch?.loose_units_available || 0) > 0;

                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                      <div className="flex items-center space-x-1.5">
                                        <Pill className="w-3 h-3 text-purple-500 shrink-0" />
                                        <span>{it.medication_name}</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                                      {it.dosage} &bull; {it.frequency}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{it.duration_days} days</td>
                                    <td className="py-2.5 px-3 font-bold text-blue-600">{it.quantity} units</td>
                                    <td className="py-2.5 px-3">
                                      {isAvailable ? (
                                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                          <Check className="w-3 h-3" />
                                          <span>In Stock ({availablePacks} packs)</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                          <AlertTriangle className="w-3 h-3" />
                                          <span>Out of Stock / Restock</span>
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-500 italic">{it.instructions || 'As directed'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {pendingPrescriptions.length === 0 && (
                      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10">
                        <Pill className="w-10 h-10 mx-auto opacity-30 text-purple-500 mb-2" />
                        <p className="font-bold text-sm">No doctor prescriptions awaiting dispense</p>
                        <p className="text-xs mt-1">When doctors write electronic prescriptions in the Clinic room, they stream here live in real time.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* SUB-VIEW 2: FULL STANDALONE WALK-IN POS COUNTER            */}
              {/* ────────────────────────────────────────────────────────── */}
              {pharmacySubTab === 'pos' && (
                <div className="space-y-4">
                  {/* Alert banner if loaded from a doctor's prescription */}
                  {activeLoadedPrescription && (
                    <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
                      <div className="flex items-center space-x-2.5 text-xs">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                          Rx
                        </div>
                        <div>
                          <p className="font-bold">
                            Prescription Loaded for Patient: {activeLoadedPrescription.patient_name} ({activeLoadedPrescription.opd_number})
                          </p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-300">
                            Prescribed by {activeLoadedPrescription.doctor_name || 'Dr. On Duty'}. Adjust quantities if needed, then complete sale to deduct stock and fulfill.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveLoadedPrescription(null);
                          setPosLoadedCart([]);
                          setPosLoadedCustomer(null);
                          showToast('Cleared active prescription from counter', 'info');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition shadow-xs shrink-0"
                      >
                        Clear Prescription
                      </button>
                    </div>
                  )}

                  {/* Render Full SoloPOS Counter Engine */}
                  <div className="rounded-3xl overflow-hidden">
                    <SoloPOS
                      drugs={medicines}
                      currency={currentUser?.currency_symbol || 'KSh'}
                      onCompleteSale={handleHospitalPOSSale}
                      showToast={showToast}
                      externalCart={posLoadedCart}
                      externalCustomer={posLoadedCustomer}
                    />
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* SUB-VIEW 3: HOSPITAL FORMULARY & STOCK INVENTORY           */}
              {/* ────────────────────────────────────────────────────────── */}
              {pharmacySubTab === 'stock' && (
                <div className="space-y-4">
                  {/* Search and Category Filters */}
                  <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search medicines by brand name, generic molecule, manufacturer..."
                        value={stockSearchQuery}
                        onChange={e => setStockSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
                      {['All', 'OTC', 'Prescription', 'Antibiotics', 'Pain Relief', 'Vitamins', 'Cough & Cold'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStockCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                            stockCategoryFilter === cat
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stock Table */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase font-black text-[9px] tracking-wider border-b border-slate-100 dark:border-white/5">
                          <tr>
                            <th className="py-3 px-4">Brand / Medication</th>
                            <th className="py-3 px-4">Generic Molecule</th>
                            <th className="py-3 px-4">Form & Strength</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4 text-center">Stock Level</th>
                            <th className="py-3 px-4 text-right">Pack Price</th>
                            <th className="py-3 px-4 text-right">Unit Price</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                          {medicines
                            .filter(m => {
                              const q = stockSearchQuery.toLowerCase().trim();
                              const name = (m.brand_name || m.name || '').toLowerCase();
                              const generic = (m.molecule_name || m.generic_name || '').toLowerCase();
                              const matchSearch = !q || name.includes(q) || generic.includes(q);
                              const matchCat = stockCategoryFilter === 'All' || (m.category && m.category.toLowerCase() === stockCategoryFilter.toLowerCase());
                              return matchSearch && matchCat;
                            })
                            .map(med => {
                              const totalPacks = med.total_packs ?? med.stock_boxes ?? 0;
                              const isLow = totalPacks <= (med.min_stock_alert || 5);

                              return (
                                <tr key={med.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                    <div className="flex items-center space-x-2">
                                      <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                        💊
                                      </span>
                                      <span>{med.brand_name || med.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                    {med.molecule_name || med.generic_name || '—'}
                                  </td>
                                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                    {med.form_category || 'Tablet'} &bull; {med.strength || 'Standard'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {med.category || 'General'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="font-extrabold text-slate-900 dark:text-white">
                                      {totalPacks} packs
                                    </span>
                                    {med.loose_units_available > 0 && (
                                      <span className="text-[10px] text-slate-400 block">+{med.loose_units_available} units</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                                    {currentUser?.currency_symbol || 'KSh'} {(med.pack_price || 0).toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                                    {currentUser?.currency_symbol || 'KSh'} {(med.unit_price || 0).toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {isLow ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/20">
                                        Low Stock
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                                        Available
                                      </span>
                                    )}
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
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 6: CASHIER & PATIENT BILLING                           */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
                  <span><strong>Reception Cashier & Patient Billing:</strong> Review dispensed medicines, calculate total bill (Consultation + Pharmacy), accept payment (Cash, M-Pesa, Insurance), and issue receipt.</span>
                </div>
                <span className="font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px]">
                  {billingQueue.length} Pending Settlement
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {billingQueue.map(bill => (
                  <div key={bill.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-500">{bill.opd_number}</span>
                        <h4 className="font-black text-slate-900 dark:text-white text-base mt-0.5">{bill.patient_name}</h4>
                        <p className="text-xs text-slate-400">Insurance: <strong>{bill.insurance_provider || 'Cash'}</strong></p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600">
                        Pending Payment
                      </span>
                    </div>

                    {/* Breakdown */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>OPD Consultation Fee:</span>
                        <span>{curr} {bill.consultation_fee?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Dispensed Medications ({bill.items?.length || 0}):</span>
                        <span>{curr} {bill.drug_total?.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between font-black text-slate-900 dark:text-white text-sm">
                        <span>Total Due:</span>
                        <span className="text-amber-600 dark:text-amber-400">{curr} {bill.total_amount?.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedVisitForBilling(bill);
                        setPaymentForm({ payment_method: 'Cash', reference_code: '', amount_paid: bill.total_amount });
                        setShowBillingModal(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition apple-spring flex items-center justify-center space-x-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect Payment & Discharge &rarr;</span>
                    </button>
                  </div>
                ))}
              </div>

              {billingQueue.length === 0 && (
                <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10">
                  <DollarSign className="w-10 h-10 mx-auto opacity-30 text-amber-500 mb-2" />
                  <p className="font-bold text-sm">No bills currently pending settlement</p>
                  <p className="text-xs mt-1">When pharmacy dispenses medicines, patient invoices appear here immediately.</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 7: STAFF & DUTY ROSTER                                 */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Hospital Clinical & Administrative Staff</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage Doctors, Nurses, Pharmacists, and Receptionists with departmental credentials</p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition apple-spring flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Staff Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffList.map(s => (
                  <div key={s.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-sm">
                          {s.name?.slice(0, 2).toUpperCase() || 'DR'}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm">{s.name}</h4>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{s.staff_title || s.role}</p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-white/5">
                      <p>Email: <span className="font-mono text-slate-700 dark:text-slate-300">{s.email}</span></p>
                      {s.phone && <p>Phone: <span className="font-mono text-slate-700 dark:text-slate-300">{s.phone}</span></p>}
                      <p>Fast PIN Login: <span className="font-bold text-emerald-600">{s.has_pin ? 'Configured' : 'Not Set'}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB 8: HOSPITAL SETTINGS                                   */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <h3 className="font-black text-base text-slate-900 dark:text-white">Hospital Facility Profile & Regulatory Info</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Facility Name</label>
                    <input
                      type="text"
                      value={facilitySettings.name}
                      onChange={e => setFacilitySettings({ ...facilitySettings, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">MFL Facility Code</label>
                    <input
                      type="text"
                      value={facilitySettings.mfl_code}
                      onChange={e => setFacilitySettings({ ...facilitySettings, mfl_code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address / Location</label>
                    <input
                      type="text"
                      value={facilitySettings.address}
                      onChange={e => setFacilitySettings({ ...facilitySettings, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Code</label>
                    <input
                      type="text"
                      value={facilitySettings.currency}
                      onChange={e => setFacilitySettings({ ...facilitySettings, currency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => showToast('Hospital facility settings updated', 'success')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Save Facility Details
                  </button>
                </div>
              </div>

              {/* Subscription Status Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/20 to-slate-900 border border-blue-500/20 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Active License</span>
                  <h4 className="font-black text-lg text-white mt-0.5">Hospital Clinical Suite & Integrated Pharmacy</h4>
                  <p className="text-xs text-slate-400 mt-1">All hospital modules (Reception, Triage, EHR, Pharmacy, Billing) included under single subscription.</p>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition apple-spring shadow-lg shadow-blue-500/20"
                >
                  Manage Subscription
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: NEW PATIENT REGISTRATION (RECEPTION)               */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
                  🏥
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">New Patient Registration</h3>
                  <p className="text-[11px] text-slate-400">Issues permanent OPD record and queues for triage</p>
                </div>
              </div>
              <button onClick={() => setShowNewPatientModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mary Wanjiku Kamau"
                  value={newPatientForm.full_name}
                  onChange={e => setNewPatientForm({ ...newPatientForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 34"
                    value={newPatientForm.age}
                    onChange={e => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={e => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={newPatientForm.phone}
                    onChange={e => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">National ID / Passport</label>
                  <input
                    type="text"
                    placeholder="e.g. 29482910"
                    value={newPatientForm.national_id}
                    onChange={e => setNewPatientForm({ ...newPatientForm, national_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Insurance Scheme</label>
                  <select
                    value={newPatientForm.insurance_provider}
                    onChange={e => setNewPatientForm({ ...newPatientForm, insurance_provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    <option value="Cash">Cash / Self-Pay</option>
                    <option value="SHA / NHIF">SHA / NHIF</option>
                    <option value="Jubilee Insurance">Jubilee Insurance</option>
                    <option value="AAR Insurance">AAR Insurance</option>
                    <option value="Britam">Britam</option>
                    <option value="APA Insurance">APA Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={newPatientForm.blood_group}
                    onChange={e => setNewPatientForm({ ...newPatientForm, blood_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Known Drug Allergies (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Aspirin"
                  value={newPatientForm.allergies}
                  onChange={e => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 apple-press"
                >
                  Register & Queue for Triage &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: TRIAGE & VITALS CAPTURE (NURSING)                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showTriageModal && selectedVisitForTriage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-500">{selectedVisitForTriage.opd_number}</span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Record Vitals & Triage: {selectedVisitForTriage.patient_name}</h3>
                <p className="text-[11px] text-slate-400">{selectedVisitForTriage.gender}, {selectedVisitForTriage.age} yrs</p>
              </div>
              <button onClick={() => setShowTriageModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTriage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Pressure Systolic (mmHg)</label>
                  <input
                    type="number"
                    value={triageForm.bp_systolic}
                    onChange={e => setTriageForm({ ...triageForm, bp_systolic: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">BP Diastolic (mmHg)</label>
                  <input
                    type="number"
                    value={triageForm.bp_diastolic}
                    onChange={e => setTriageForm({ ...triageForm, bp_diastolic: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={triageForm.pulse_rate}
                    onChange={e => setTriageForm({ ...triageForm, pulse_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={triageForm.temperature}
                    onChange={e => setTriageForm({ ...triageForm, temperature: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={triageForm.spo2}
                    onChange={e => setTriageForm({ ...triageForm, spo2: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={triageForm.weight_kg}
                    onChange={e => setTriageForm({ ...triageForm, weight_kg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Triage Priority Tag</label>
                  <select
                    value={triageForm.triage_priority}
                    onChange={e => setTriageForm({ ...triageForm, triage_priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-bold"
                  >
                    <option value="normal">Normal (Routine OPD)</option>
                    <option value="urgent">Urgent (Fast-Track Doctor)</option>
                    <option value="critical">Critical / Emergency Resuscitation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nursing Observation Notes</label>
                <textarea
                  rows="2"
                  placeholder="Patient complains of severe headache, fever for 3 days..."
                  value={triageForm.triage_notes}
                  onChange={e => setTriageForm({ ...triageForm, triage_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTriageModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 apple-press"
                >
                  Forward to Doctor Clinic &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: DOCTOR CONSULTATION & E-PRESCRIPTION               */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showConsultModal && selectedVisitForDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-500">{selectedVisitForDoctor.opd_number}</span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Doctor Consultation: {selectedVisitForDoctor.patient_name}</h3>
                <p className="text-[11px] text-slate-400">{selectedVisitForDoctor.gender}, {selectedVisitForDoctor.age} yrs &bull; Triage Vitals: {selectedVisitForDoctor.bp_systolic}/{selectedVisitForDoctor.bp_diastolic} mmHg, {selectedVisitForDoctor.pulse_rate} bpm, {selectedVisitForDoctor.temperature} °C</p>
              </div>
              <button onClick={() => setShowConsultModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDoctorConsultation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Impression / Diagnosis *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI)"
                    value={consultForm.diagnosis}
                    onChange={e => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Doctor Consultation Notes</label>
                  <input
                    type="text"
                    placeholder="Physical examination notes, symptoms history..."
                    value={consultForm.doctor_notes}
                    onChange={e => setConsultForm({ ...consultForm, doctor_notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* In-House Pharmacy Formulary E-Prescription Builder */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-extrabold text-slate-900 dark:text-white">In-House Pharmacy E-Prescription</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPrescriptionItem}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {prescriptionItems.map((item, index) => (
                    <div key={index} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Select Drug from Hospital Formulary</label>
                          <input
                            type="text"
                            placeholder="Drug name (e.g. Amoxicillin 500mg)"
                            value={item.medicine_name}
                            onChange={e => handlePrescriptionItemChange(index, 'medicine_name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Dosage</label>
                          <input
                            type="text"
                            placeholder="1 tab"
                            value={item.dosage}
                            onChange={e => handlePrescriptionItemChange(index, 'dosage', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Frequency</label>
                          <select
                            value={item.frequency}
                            onChange={e => handlePrescriptionItemChange(index, 'frequency', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                          >
                            <option value="OD (Once daily)">OD (1x daily)</option>
                            <option value="BD (2x daily)">BD (2x daily)</option>
                            <option value="TID (3x daily)">TID (3x daily)</option>
                            <option value="QID (4x daily)">QID (4x daily)</option>
                            <option value="PRN (As needed)">PRN (As needed)</option>
                            <option value="Stat (Immediately)">Stat</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Days</label>
                          <input
                            type="number"
                            min="1"
                            value={item.duration_days}
                            onChange={e => handlePrescriptionItemChange(index, 'duration_days', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handlePrescriptionItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-bold"
                          />
                        </div>
                        <div className="flex items-end">
                          {prescriptionItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePrescriptionItem(index)}
                              className="w-full py-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg font-bold text-[10px]"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowConsultModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 apple-press"
                >
                  Transmit E-Prescription to Hospital Pharmacy &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 4: CASHIER BILLING SETTLEMENT                         */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showBillingModal && selectedVisitForBilling && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-500">{selectedVisitForBilling.opd_number}</span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Collect Payment & Settle Bill</h3>
                <p className="text-[11px] text-slate-400">{selectedVisitForBilling.patient_name}</p>
              </div>
              <button onClick={() => setShowBillingModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleBilling} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Consultation Fee:</span>
                  <span>{curr} {selectedVisitForBilling.consultation_fee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Pharmacy Medications:</span>
                  <span>{curr} {selectedVisitForBilling.drug_total?.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-amber-500/30 flex justify-between font-black text-base text-amber-700 dark:text-amber-300">
                  <span>Total Amount Due:</span>
                  <span>{curr} {selectedVisitForBilling.total_amount?.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'M-Pesa', 'SHA / NHIF'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, payment_method: m })}
                      className={`py-2 rounded-xl font-bold border transition ${
                        paymentForm.payment_method === m
                          ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'border-slate-200 dark:border-white/10 text-slate-500'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {paymentForm.payment_method === 'M-Pesa' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">M-Pesa Confirmation Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QKH839210"
                    value={paymentForm.reference_code}
                    onChange={e => setPaymentForm({ ...paymentForm, reference_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 uppercase font-mono font-bold"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBillingModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20 apple-press"
                >
                  Confirm Payment & Discharge Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 5: RECEIPT / DISCHARGE CLEARANCE                     */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Payment Clearance Receipt</h3>
              <p className="text-xs text-slate-400">{facilitySettings.name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold">{receiptData.patient_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OPD No:</span>
                <span>{receiptData.opd_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paid Amount:</span>
                <span className="font-bold text-emerald-600">{curr} {receiptData.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span>{receiptData.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-blue-600">Discharged & Complete</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowReceiptModal(false);
                setReceiptData(null);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 6: ADD HOSPITAL STAFF                                */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
                  👥
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Add Hospital Staff Member</h3>
                  <p className="text-[11px] text-slate-400">Assign role credentials and login PIN</p>
                </div>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Agnes Mutua"
                  value={staffForm.name}
                  onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="doctor@hospital.com"
                  value={staffForm.email}
                  onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role Preset *</label>
                  <select
                    value={staffForm.role}
                    onChange={e => {
                      const matched = HOSPITAL_ROLE_PRESETS.find(p => p.role === e.target.value);
                      setStaffForm({
                        ...staffForm,
                        role: e.target.value,
                        staff_title: matched?.title || 'Staff'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                  >
                    {HOSPITAL_ROLE_PRESETS.map(p => (
                      <option key={p.id} value={p.role}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fast Tablet PIN (4-Digits)</label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="e.g. 1234"
                    value={staffForm.pin_code}
                    onChange={e => setStaffForm({ ...staffForm, pin_code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-center tracking-widest"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 apple-press"
                >
                  Save Staff Member &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL 7: MULTI-WORKSPACE / SWITCH PORTAL                   */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Switch Active PharmaHub Portal</h3>
                <p className="text-xs text-slate-500">Select the ecosystem hub you want to manage</p>
              </div>
              <button onClick={() => setShowWorkspaceModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setShowWorkspaceModal(false);
                  handleSwitchAccountType('solo');
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-base mb-2">
                  💊
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500">Solo Pharmacy</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Community chemist POS</p>
              </button>

              <button
                onClick={() => {
                  setShowWorkspaceModal(false);
                  handleSwitchAccountType('organization');
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-cyan-500 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-base mb-2">
                  🏢
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-500">Enterprise Hub</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Multi-branch pharmacy chain</p>
              </button>

              <button
                onClick={() => {
                  setShowWorkspaceModal(false);
                  handleSwitchAccountType('wholesale');
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-base mb-2">
                  🏭
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-500">Wholesale Hub</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Bulk warehouse distribution</p>
              </button>

              <button
                onClick={() => {
                  setShowWorkspaceModal(false);
                  handleSwitchAccountType('hospital');
                }}
                className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-500/10 text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-base mb-2">
                  🏥
                </div>
                <h4 className="font-bold text-xs text-blue-500">Hospital Hub</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Active Workspace</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

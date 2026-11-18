import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  UserPlus,
  Users,
  Stethoscope,
  Activity,
  Pill,
  FlaskConical,
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
  X
} from 'lucide-react';

export default function HospitalHub({ currentUser, authFetch, showToast, curr = 'KSh', medicines = [] }) {
  const [activeStation, setActiveStation] = useState('reception'); // 'reception', 'triage', 'doctor', 'lab', 'pharmacy_queue'
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  // 1. New Patient Registration Form (Reception)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
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

  // 2. Triage Modal (Nursing Station)
  const [selectedVisitForTriage, setSelectedVisitForTriage] = useState(null);
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
    assigned_doctor: 'Dr. On Duty',
    ward_bed: ''
  });

  // 3. Doctor Consultation & E-Prescription Form
  const [selectedVisitForDoctor, setSelectedVisitForDoctor] = useState(null);
  const [consultForm, setConsultForm] = useState({
    doctor_notes: '',
    diagnosis: ''
  });
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicine_id: '', medicine_name: '', dosage: '1 tab', frequency: 'TID (3x daily)', duration_days: 5, quantity: 15, instructions: 'Take after meals' }
  ]);
  const [labTestName, setLabTestName] = useState('');

  // 4. Pharmacy Pending Prescriptions Queue
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);

  // Fetch Hospital Live Queue
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/hospital/queue');
      const data = await res.json();
      if (res.ok) {
        setQueue(data.queue || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Patients List
  const fetchPatients = async (query = '') => {
    try {
      const res = await authFetch(`/api/hospital/patients${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Pending Hospital Prescriptions for Pharmacy
  const fetchPendingPrescriptions = async () => {
    try {
      const res = await authFetch('/api/hospital/prescriptions/pending');
      const data = await res.json();
      if (res.ok) {
        setPendingPrescriptions(data.prescriptions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchPatients();
    if (activeStation === 'pharmacy_queue') {
      fetchPendingPrescriptions();
    }
  }, [activeStation]);

  // Handle Register Patient & Queue
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
        showToast(`Patient registered: ${data.patient.opd_number}`, 'success');
        setShowNewPatientModal(false);
        // Automatically check-in to triage queue
        await authFetch('/api/hospital/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: data.patient.id, initial_stage: 'triage' })
        });
        fetchQueue();
        fetchPatients();
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

  // Handle Existing Patient Check-in
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
      }
    } catch {
      showToast('Error checking in patient', 'error');
    }
  };

  // Submit Triage Vitals
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
        showToast('Vitals captured! Patient forwarded to Doctor', 'success');
        setSelectedVisitForTriage(null);
        fetchQueue();
      } else {
        showToast('Failed to save triage', 'error');
      }
    } catch {
      showToast('Error submitting triage', 'error');
    }
  };

  // Doctor Consultation: Add E-Prescription item
  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicine_id: '', medicine_name: '', dosage: '1 tab', frequency: 'TID (3x daily)', duration_days: 5, quantity: 15, instructions: '' }
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
      if (med) next[index].medicine_name = med.brand_name || med.generic_name;
    }
    setPrescriptionItems(next);
  };

  // Doctor Consultation: Complete & Send E-Prescription
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
          next_stage: prescriptionItems.length > 0 ? 'pharmacy' : 'completed'
        })
      });

      // 2. If medicines prescribed, transmit e-prescription to Hospital Pharmacy POS
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

      setSelectedVisitForDoctor(null);
      setConsultForm({ doctor_notes: '', diagnosis: '' });
      setPrescriptionItems([{ medicine_id: '', medicine_name: '', dosage: '1 tab', frequency: 'TID (3x daily)', duration_days: 5, quantity: 15, instructions: 'Take after meals' }]);
      fetchQueue();
    } catch {
      showToast('Error saving consultation', 'error');
    }
  };

  // Dispense Prescription at Pharmacy Station
  const handleDispensePrescription = async (prescriptionId) => {
    try {
      const res = await authFetch(`/api/hospital/prescriptions/${prescriptionId}/dispense`, {
        method: 'PUT'
      });
      if (res.ok) {
        showToast('Prescription dispensed & patient visit finalized', 'success');
        fetchPendingPrescriptions();
        fetchQueue();
      }
    } catch {
      showToast('Error dispensing prescription', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Hospital Control Center Banner ──────────────────────────── */}
      <div className="liquid-glass p-5 md:p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Integrated Hospital Information System (HIS)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Hospital Clinical & Departmental Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized patient workflow: Front Desk Reception ➔ Nursing Triage ➔ Doctor EHR & Diagnosis ➔ Real-Time Pharmacy POS Dispense.
          </p>
        </div>

        {/* Quick Station Switcher Tabs */}
        <div className="flex flex-wrap gap-1 bg-black/[0.05] dark:bg-white/[0.06] p-1.5 rounded-2xl">
          {[
            { id: 'reception', label: 'Reception & OPD', icon: UserPlus },
            { id: 'triage', label: 'Nursing & Triage', icon: Activity },
            { id: 'doctor', label: 'Doctor Clinic (EHR)', icon: Stethoscope },
            { id: 'pharmacy_queue', label: 'Hospital Pharmacy', icon: Pill }
          ].map(st => {
            const Icon = st.icon;
            const count = st.id === 'pharmacy_queue' 
              ? pendingPrescriptions.length 
              : queue.filter(q => q.stage === (st.id === 'reception' ? 'triage' : st.id)).length;
            return (
              <button
                key={st.id}
                onClick={() => setActiveStation(st.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition apple-spring ${
                  activeStation === st.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/40 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{st.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeStation === st.id ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 1. RECEPTION & FRONT DESK STATION ───────────────────────────── */}
      {activeStation === 'reception' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Registered Patients & Check-in */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Patient Directory & Daily OPD Check-In</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Search existing hospital records or register a new walk-in / insurance patient.</p>
                </div>
                <button
                  onClick={() => setShowNewPatientModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 apple-spring shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Patient</span>
                </button>
              </div>

              {/* Patient Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search patient by name, OPD number (HOSP-...), or phone..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    fetchPatients(e.target.value);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Patient List Table */}
              <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                    <tr>
                      <th className="p-3">OPD File #</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Age / Gender</th>
                      <th className="p-3">Insurance / Payment</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-400">
                          No patients found. Click "Register Patient" to add one.
                        </td>
                      </tr>
                    ) : (
                      patients.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                          <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{p.opd_number}</td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{p.full_name}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{p.age ? `${p.age} yrs` : '—'} • {p.gender}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.insurance_provider === 'Cash' 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                                : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {p.insurance_provider}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">{p.phone || '—'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleCheckInPatient(p.id)}
                              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-lg transition inline-flex items-center gap-1"
                            >
                              <span>Send to Triage</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Live Triage & Clinic Waiting Queue */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Active Hospital Queue ({queue.length})</span>
                </h3>
                <button
                  onClick={fetchQueue}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2.5">
                {queue.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Hospital queue is currently empty.</p>
                ) : (
                  queue.map(q => (
                    <div
                      key={q.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-black/[0.04] dark:border-white/[0.05] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{q.patient_name}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          q.stage === 'triage' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                          q.stage === 'doctor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                          q.stage === 'pharmacy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        }`}>
                          {q.stage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{q.opd_number}</span>
                        <span>{q.assigned_doctor || 'Unassigned'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. NURSING & TRIAGE STATION ─────────────────────────────────── */}
      {activeStation === 'triage' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span>Nursing Station: Vitals Assessment & Triage</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Capture blood pressure, pulse, SpO2, and temperature before sending to the doctor.</p>
              </div>
            </div>

            {/* Waiting for Triage Queue */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queue.filter(q => q.stage === 'triage').length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  No patients waiting for triage right now.
                </div>
              ) : (
                queue.filter(q => q.stage === 'triage').map(q => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{q.opd_number}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 uppercase">
                          Waiting Vitals
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{q.patient_name}</h4>
                      <p className="text-xs text-slate-500">{q.age ? `${q.age} yrs` : ''} • {q.gender} • {q.insurance_provider}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedVisitForTriage(q);
                        setTriageForm({
                          bp_systolic: 120,
                          bp_diastolic: 80,
                          pulse_rate: 72,
                          temperature: 36.6,
                          weight_kg: 68,
                          spo2: 98,
                          blood_sugar: 5.5,
                          triage_priority: 'normal',
                          triage_notes: '',
                          assigned_doctor: q.assigned_doctor || 'Dr. On Duty',
                          ward_bed: ''
                        });
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 apple-press"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Record Vitals & Send to Doctor</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. DOCTOR CLINIC & EHR (E-PRESCRIPTION) ──────────────────────── */}
      {activeStation === 'doctor' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-500" />
                <span>Doctor Consultation Room & Real-Time E-Prescribing</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Diagnose patients with live triage vitals and transmit electronic prescriptions directly to the Hospital Pharmacy POS.
              </p>
            </div>

            {/* Patients Waiting for Doctor */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queue.filter(q => q.stage === 'doctor').length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  No patients waiting for doctor consultation.
                </div>
              ) : (
                queue.filter(q => q.stage === 'doctor').map(q => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{q.opd_number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          q.triage_priority === 'emergency' ? 'bg-red-500 text-white' :
                          q.triage_priority === 'urgent' ? 'bg-amber-500 text-slate-950' :
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}>
                          {q.triage_priority}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{q.patient_name}</h4>
                      <p className="text-xs text-slate-500">{q.age} yrs • {q.gender}</p>

                      {/* Display Vitals preview */}
                      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.05] text-[11px]">
                        <div>
                          <span className="text-slate-400 block">BP:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{q.bp_systolic}/{q.bp_diastolic}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Pulse:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{q.pulse_rate} bpm</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Temp:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{q.temperature}°C</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedVisitForDoctor(q);
                        setConsultForm({ doctor_notes: q.doctor_notes || '', diagnosis: q.diagnosis || '' });
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 apple-press"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Open Consultation & Prescribe</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. HOSPITAL PHARMACY REAL-TIME SYNC QUEUE ───────────────────── */}
      {activeStation === 'pharmacy_queue' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-500" />
                  <span>Hospital Pharmacy: Live E-Prescriptions ({pendingPrescriptions.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Electronic prescriptions transmitted directly from doctors' rooms for dispensing.
                </p>
              </div>
              <button
                onClick={fetchPendingPrescriptions}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>

            <div className="space-y-3">
              {pendingPrescriptions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No pending prescriptions in the pharmacy queue.
                </div>
              ) : (
                pendingPrescriptions.map(p => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{p.patient_name}</span>
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{p.opd_number}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          {p.insurance_provider}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Prescribed by: <strong className="text-slate-700 dark:text-slate-300">{p.prescribing_doctor}</strong> • Diagnosis: <em className="text-slate-600 dark:text-slate-400">{p.diagnosis || 'Routine'}</em>
                      </p>

                      {/* Prescribed Items */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(p.items || []).map((it, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white dark:bg-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 border border-black/[0.05] dark:border-white/[0.05]"
                          >
                            💊 {it.medicine_name} — {it.dosage} ({it.frequency}, {it.duration_days} days) • Qty: {it.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDispensePrescription(p.id)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 apple-press shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Dispense & Complete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTER PATIENT ─────────────────────────────────────── */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.05]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                <span>Register New Hospital Patient</span>
              </h3>
              <button onClick={() => setShowNewPatientModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Mwangi"
                  value={newPatientForm.full_name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 34"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="07..."
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Insurance Provider</label>
                  <select
                    value={newPatientForm.insurance_provider}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, insurance_provider: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  >
                    <option value="Cash">Cash / Self-Pay</option>
                    <option value="SHA / NHIF">SHA / NHIF</option>
                    <option value="Jubilee Insurance">Jubilee Insurance</option>
                    <option value="AAR Insurance">AAR Insurance</option>
                    <option value="Britam">Britam</option>
                    <option value="APA Insurance">APA Insurance</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition"
                >
                  Save & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: NURSING TRIAGE & VITALS ───────────────────────────────── */}
      {selectedVisitForTriage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full p-6 rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.05]">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span>Record Vitals: {selectedVisitForTriage.patient_name}</span>
                </h3>
                <p className="text-xs text-slate-500">{selectedVisitForTriage.opd_number}</p>
              </div>
              <button onClick={() => setSelectedVisitForTriage(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTriage} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">BP Systolic / Diastolic (mmHg)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="120"
                      value={triageForm.bp_systolic}
                      onChange={(e) => setTriageForm({ ...triageForm, bp_systolic: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      placeholder="80"
                      value={triageForm.bp_diastolic}
                      onChange={(e) => setTriageForm({ ...triageForm, bp_diastolic: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={triageForm.pulse_rate}
                    onChange={(e) => setTriageForm({ ...triageForm, pulse_rate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={triageForm.temperature}
                    onChange={(e) => setTriageForm({ ...triageForm, temperature: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={triageForm.spo2}
                    onChange={(e) => setTriageForm({ ...triageForm, spo2: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="70"
                    value={triageForm.weight_kg}
                    onChange={(e) => setTriageForm({ ...triageForm, weight_kg: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Triage Priority Level</label>
                <select
                  value={triageForm.triage_priority}
                  onChange={(e) => setTriageForm({ ...triageForm, triage_priority: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                >
                  <option value="normal">Normal (Routine OPD Consultation)</option>
                  <option value="urgent">Urgent (Elevated vitals, high fever)</option>
                  <option value="emergency">Emergency (Critical / Immediate Resuscitation)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVisitForTriage(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                >
                  Forward to Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DOCTOR CONSULTATION & E-PRESCRIBE ─────────────────────── */}
      {selectedVisitForDoctor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full p-6 rounded-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] dark:border-white/[0.05]">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                  <span>Consultation: {selectedVisitForDoctor.patient_name}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedVisitForDoctor.opd_number} • BP: {selectedVisitForDoctor.bp_systolic}/{selectedVisitForDoctor.bp_diastolic} • Pulse: {selectedVisitForDoctor.pulse_rate} • Temp: {selectedVisitForDoctor.temperature}°C
                </p>
              </div>
              <button onClick={() => setSelectedVisitForDoctor(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDoctorConsultation} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bacterial Tonsillitis / Upper Respiratory Tract Infection"
                  value={consultForm.diagnosis}
                  onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Doctor's Clinical Notes</label>
                <textarea
                  rows="2"
                  placeholder="Patient presented with sore throat and fever for 3 days..."
                  value={consultForm.doctor_notes}
                  onChange={(e) => setConsultForm({ ...consultForm, doctor_notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                />
              </div>

              {/* Electronic Prescription Builder */}
              <div className="space-y-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-emerald-500" />
                    <span>Direct E-Prescription (Real-Time Pharmacy POS Sync)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPrescriptionItem}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                  >
                    + Add Medication
                  </button>
                </div>

                <div className="space-y-2">
                  {prescriptionItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-black/[0.04]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Select Medication from Pharmacy Stock</label>
                          <select
                            value={item.medicine_id}
                            onChange={(e) => handlePrescriptionItemChange(idx, 'medicine_id', e.target.value)}
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs"
                          >
                            <option value="">-- Choose Formulary Drug or Custom --</option>
                            {medicines.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.brand_name || m.generic_name} ({m.strength || 'Standard'})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Medication Name (or Custom)</label>
                          <input
                            type="text"
                            placeholder="e.g. Amoxicillin 500mg"
                            value={item.medicine_name}
                            onChange={(e) => handlePrescriptionItemChange(idx, 'medicine_name', e.target.value)}
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Dosage</label>
                          <input
                            type="text"
                            placeholder="1 tab"
                            value={item.dosage}
                            onChange={(e) => handlePrescriptionItemChange(idx, 'dosage', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Frequency</label>
                          <input
                            type="text"
                            placeholder="TID (3x daily)"
                            value={item.frequency}
                            onChange={(e) => handlePrescriptionItemChange(idx, 'frequency', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Days</label>
                          <input
                            type="number"
                            placeholder="5"
                            value={item.duration_days}
                            onChange={(e) => handlePrescriptionItemChange(idx, 'duration_days', e.target.value)}
                            className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-xs"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemovePrescriptionItem(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/[0.05]">
                <button
                  type="button"
                  onClick={() => setSelectedVisitForDoctor(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit to Pharmacy POS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, User, Stethoscope, ClipboardList, Activity, LogOut, History, LogIn } from 'lucide-react';
import { MedicalRecord, initialRecord } from './types';
import { exportToWord } from './lib/export-word';
import { Auth } from './components/Auth';
import { SavedRecords } from './components/SavedRecords';
import { SectionTitle, InputGroup, TextAreaGroup, SelectGroup, TimeInput, DateInput, TestResultTable, DrugOrderTable, DynamicList } from './components/FormElements';

export default function App() {
  const [formData, setFormData] = useState<MedicalRecord>(initialRecord);
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'khcs' | 'history' | 'account'>('khcs');

  const getAiSuggestions = async () => {
    if (!formData.diagnosisCurrent) {
      alert('Vui lòng nhập chẩn đoán trước khi yêu cầu gợi ý.');
      return;
    }
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis: formData.diagnosisCurrent }),
      });
      const data = await response.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const numericFields = [
    'age', 'smokingPacksPerYear', 'smokingYears', 'pulse', 'respiration', 'bloodPressure', 
    'spo2', 'temperature', 'treatmentDay',
    'admissionHour', 'admissionMinute', 'admissionDay', 'admissionMonth', 'admissionYear',
    'departmentHour', 'departmentMinute', 'departmentDay', 'departmentMonth', 'departmentYear',
    'admissionStateHour', 'admissionStateMinute', 'admissionStateDay', 'admissionStateMonth', 'admissionStateYear',
    'currentStateDay', 'currentStateMonth', 'currentStateYear'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    // Fixed uppercase for full name
    if (name === 'fullName') {
      newValue = value.toUpperCase();
    } 
    // Numeric only validation
    else if (numericFields.includes(name)) {
      if (name === 'bloodPressure') {
        newValue = value.replace(/[^0-9/]/g, '');
      } else if (name === 'temperature') {
        newValue = value.replace(/[^0-9.]/g, '');
      } else {
        newValue = value.replace(/[^0-9]/g, '');
      }
    }
    // Auto-capitalize first letter of lines
    else if (e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLInputElement && !['fullName', 'gender', 'title'].includes(name))) {
      newValue = value.split('\n').map(line => {
        if (line.length > 0) {
          return line.charAt(0).toUpperCase() + line.slice(1);
        }
        return line;
      }).join('\n');
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleDynamicListChange = (field: 'nursingDiagnoses' | 'nursingInterventions' | 'nursingEvaluations', index: number, value: string) => {
    setFormData(prev => {
      const newList = [...prev[field]];
      newList[index] = value;
      return { ...prev, [field]: newList };
    });
  };

  const addDynamicListItem = (field: 'nursingDiagnoses' | 'nursingInterventions' | 'nursingEvaluations') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeDynamicListItem = (field: 'nursingDiagnoses' | 'nursingInterventions' | 'nursingEvaluations', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleTestResultChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newList = [...prev.testResults];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, testResults: newList };
    });
  };

  const addTestResult = () => {
    setFormData(prev => ({
      ...prev,
      testResults: [...prev.testResults, { id: crypto.randomUUID(), name: '', value: '', normalValue: '', remark: '', unit: '' }]
    }));
  };

  const removeTestResult = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testResults: prev.testResults.filter((_, i) => i !== index)
    }));
  };

  const handleDrugOrderChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newList = [...prev.drugOrderRows];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, drugOrderRows: newList };
    });
  };

  const addDrugOrder = () => {
    setFormData(prev => ({
      ...prev,
      drugOrderRows: [...prev.drugOrderRows, { id: crypto.randomUUID(), name: '', quantity: '', route: '', speed: '', time: '' }]
    }));
  };

  const removeDrugOrder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      drugOrderRows: prev.drugOrderRows.filter((_, i) => i !== index)
    }));
  };

  const handleExport = async () => {
    await exportToWord(formData);
  };

  const handleSave = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const saved = JSON.parse(localStorage.getItem('saved_records') || '[]');
    const newRecord = { ...formData, id: Date.now(), savedAt: new Date().toISOString(), userId: user.id };
    localStorage.setItem('saved_records', JSON.stringify([...saved, newRecord]));
    alert('Đã lưu thông tin thành công vào tài khoản của bạn!');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">KHCS</div>
              <span className="font-black text-slate-800 tracking-tighter hidden md:block">HỆ THỐNG ĐIỀU DƯỠNG</span>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('khcs')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'khcs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                KHCS
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setIsAuthOpen(true);
                  } else {
                    setIsHistoryOpen(true);
                    setActiveTab('history');
                  }
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                LỊCH SỬ
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setIsAuthOpen(true);
                  } else {
                    setActiveTab('account');
                  }
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'account' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                TÀI KHOẢN
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-700">{user.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                <LogIn className="w-4 h-4" />
                ĐĂNG NHẬP
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        {activeTab === 'khcs' ? (
          <div className="max-w-5xl mx-auto">
            {/* Header Card */}
            <div className="bg-white rounded-t-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-inner">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">KHCS - ĐIỀU DƯỠNG</h1>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">KHOA/PHÒNG:</span>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tên khoa..."
                    className="border-b-2 border-slate-200 focus:border-blue-500 outline-none px-2 text-slate-700 font-black transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                <Download className="w-5 h-5" />
                XUẤT FILE
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <ClipboardList className="w-5 h-5" />
                LƯU LẠI
              </button>
            </div>
          </div>

        {/* Form Body */}
        <div className="bg-white border-x border-b border-slate-200 p-8 space-y-12">
          
          {/* Section I */}
          <section>
            <SectionTitle title="I. PHẦN HÀNH CHÁNH" icon={User} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputGroup label="Họ và tên (In hoa)" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="NGUYỄN VĂN A" className="md:col-span-1" multiline />
              <InputGroup label="Tuổi" name="age" value={formData.age} onChange={handleChange} placeholder="30" />
              <SelectGroup 
                label="Giới tính" 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                options={[{ value: 'Nam', label: 'Nam' }, { value: 'Nữ', label: 'Nữ' }]} 
              />
              <InputGroup label="Nghề nghiệp" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Ví dụ: Công nhân" multiline />
              <InputGroup label="Dân tộc" name="ethnicity" value={formData.ethnicity} onChange={handleChange} placeholder="Kinh" />
              <InputGroup label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} placeholder="123 Đường ABC, Quận X..." className="md:col-span-1" multiline />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="grid grid-cols-1 gap-4 border p-4 rounded-lg bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Ngày vào viện</h3>
                <TimeInput 
                  label="Giờ vào viện" 
                  hourName="admissionHour" hourValue={formData.admissionHour}
                  minuteName="admissionMinute" minuteValue={formData.admissionMinute}
                  onChange={handleChange}
                />
                <DateInput 
                  label="Ngày vào viện"
                  dayName="admissionDay" dayValue={formData.admissionDay}
                  monthName="admissionMonth" monthValue={formData.admissionMonth}
                  yearName="admissionYear" yearValue={formData.admissionYear}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 border p-4 rounded-lg bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Ngày vào khoa điều trị</h3>
                <TimeInput 
                  label="Giờ vào khoa" 
                  hourName="departmentHour" hourValue={formData.departmentHour}
                  minuteName="departmentMinute" minuteValue={formData.departmentMinute}
                  onChange={handleChange}
                />
                <DateInput 
                  label="Ngày vào khoa"
                  dayName="departmentDay" dayValue={formData.departmentDay}
                  monthName="departmentMonth" monthValue={formData.departmentMonth}
                  yearName="departmentYear" yearValue={formData.departmentYear}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Section II */}
          <section>
            <SectionTitle title="II. PHẦN CHUYÊN MÔN" icon={Stethoscope} />
            <div className="space-y-6">
              <TextAreaGroup label="1. Lý do vào viện" name="reason" value={formData.reason} onChange={handleChange} placeholder="Đau bụng, sốt..." />
              <TextAreaGroup label="2. Bệnh sử" name="history" value={formData.history} onChange={handleChange} placeholder="Mô tả diễn tiến bệnh..." rows={5} />
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  3. TIỀN SỬ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-blue-600 uppercase">Bản thân</p>
                    <InputGroup label="Bệnh nội khoa" name="personalInternal" value={formData.personalInternal} onChange={handleChange} multiline />
                    <InputGroup label="Bệnh ngoại khoa" name="personalExternal" value={formData.personalExternal} onChange={handleChange} multiline />
                    <InputGroup label="Dị ứng thuốc" name="allergy" value={formData.allergy} onChange={handleChange} multiline />
                    <div className="grid grid-cols-2 gap-2">
                      <InputGroup label="Số gói thuốc/năm" name="smokingPacksPerYear" value={formData.smokingPacksPerYear} onChange={handleChange} />
                      <InputGroup label="Số năm hút" name="smokingYears" value={formData.smokingYears} onChange={handleChange} />
                    </div>
                    <InputGroup label="Uống rượu" name="alcohol" value={formData.alcohol} onChange={handleChange} multiline />
                    <InputGroup label="Thói quen ăn uống" name="eatingHabits" value={formData.eatingHabits} onChange={handleChange} multiline />
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-blue-600 uppercase">Gia đình</p>
                    <TextAreaGroup label="Tiền sử gia đình" name="familyHistory" value={formData.familyHistory} onChange={handleChange} rows={11} />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    4. TÌNH TRẠNG LÚC VÀO VIỆN:
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <TimeInput 
                    label="Giờ lúc vào tình trạng" 
                    hourName="admissionStateHour" hourValue={formData.admissionStateHour}
                    minuteName="admissionStateMinute" minuteValue={formData.admissionStateMinute}
                    onChange={handleChange}
                  />
                  <DateInput 
                    label="Ngày lúc vào tình trạng"
                    dayName="admissionStateDay" dayValue={formData.admissionStateDay}
                    monthName="admissionStateMonth" monthValue={formData.admissionStateMonth}
                    yearName="admissionStateYear" yearValue={formData.admissionStateYear}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Toàn thân</h4>
                    <InputGroup label="Tri giác" name="consciousness" value={formData.consciousness} onChange={handleChange} multiline />
                    <InputGroup label="Thể trạng" name="physique" value={formData.physique} onChange={handleChange} multiline />
                    <InputGroup label="Da niêm" name="skinMucosa" value={formData.skinMucosa} onChange={handleChange} multiline />
                    <InputGroup label="Lông, tóc, móng" name="hairNails" value={formData.hairNails} onChange={handleChange} multiline />
                    
                    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4 shadow-sm">
                      <p className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Sinh hiệu (DHST)
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Mạch (lần/phút)" name="pulse" value={formData.pulse} onChange={handleChange} />
                        <InputGroup label="Nhịp thở (lần/phút)" name="respiration" value={formData.respiration} onChange={handleChange} />
                        <InputGroup label="Huyết áp (mmHg)" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} />
                        <InputGroup label="SPO2 (%)" name="spo2" value={formData.spo2} onChange={handleChange} />
                        <InputGroup label="Nhiệt độ" name="temperature" value={formData.temperature} onChange={handleChange} className="col-span-2" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Các cơ quan</h4>
                    <InputGroup label="Tuần hoàn" name="circulatory" value={formData.circulatory} onChange={handleChange} multiline />
                    <InputGroup label="Hô hấp" name="respiratory" value={formData.respiratory} onChange={handleChange} multiline />
                    <InputGroup label="Tiêu hóa" name="digestive" value={formData.digestive} onChange={handleChange} multiline />
                    <InputGroup label="Tiết niệu - Sinh dục" name="urogenital" value={formData.urogenital} onChange={handleChange} multiline />
                    <InputGroup label="Thần kinh" name="nervous" value={formData.nervous} onChange={handleChange} multiline />
                    <InputGroup label="Cơ - Xương - Khớp" name="musculoskeletal" value={formData.musculoskeletal} onChange={handleChange} multiline />
                    <InputGroup label="Mắt/TMH/RHM" name="entEyesDental" value={formData.entEyesDental} onChange={handleChange} multiline />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700 uppercase">5. Chẩn đoán (Vào viện/Khoa điều trị/Hiện tại)</label>
                    <button
                      onClick={getAiSuggestions}
                      disabled={isAiLoading}
                      className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded font-black flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      {isAiLoading ? 'ĐANG XỬ LÝ...' : 'GỢI Ý CÂU HỎI HỎI BỆNH'}
                    </button>
                  </div>
                  <textarea
                    name="diagnosisCurrent"
                    value={formData.diagnosisCurrent}
                    onChange={handleChange}
                    placeholder="Nhập chẩn đoán..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-slate-700 text-sm font-medium"
                  />
                  {aiSuggestions && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mt-2"
                    >
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-2">Gợi ý câu hỏi khai thác bệnh:</h4>
                      <div className="text-xs text-emerald-800 font-medium whitespace-pre-line leading-relaxed">
                        {aiSuggestions}
                      </div>
                      <button 
                        onClick={() => setAiSuggestions(null)}
                        className="text-[9px] text-emerald-600 font-bold mt-2 hover:underline"
                      >
                        Ẩn gợi ý
                      </button>
                    </motion.div>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-600 mb-2 block">6. CẬN LÂM SÀNG:</label>
                  <TestResultTable 
                    results={formData.testResults}
                    onChange={handleTestResultChange}
                    onAdd={addTestResult}
                    onRemove={removeTestResult}
                  />
                </div>
                <TextAreaGroup label="7. Tóm tắt bệnh án" name="summary" value={formData.summary} onChange={handleChange} rows={4} />
                <TextAreaGroup label="8. Xử trí lúc vào viện" name="initialTreatment" value={formData.initialTreatment} onChange={handleChange} rows={4} />
              </div>
            </div>

            {/* Current State Section */}
            <div className="mt-12 p-8 bg-blue-50/30 rounded-2xl border border-blue-100 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-md font-bold text-blue-900 flex items-center gap-2 uppercase tracking-tight">
                  <ClipboardList className="w-5 h-5" />
                  9. TÌNH TRẠNG HIỆN TẠI LÚC LÀM KHCS
                </h3>
                <div className="flex gap-4 items-end flex-wrap">
                  <DateInput 
                    label="Ngày hiện tại"
                    dayName="currentStateDay" dayValue={formData.currentStateDay}
                    monthName="currentStateMonth" monthValue={formData.currentStateMonth}
                    yearName="currentStateYear" yearValue={formData.currentStateYear}
                    onChange={handleChange}
                  />
                  <InputGroup label="Ngày điều trị thứ" name="treatmentDay" value={formData.treatmentDay} onChange={handleChange} placeholder="3" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blue-400 uppercase">Toàn thân hiện tại</h4>
                  <InputGroup label="Tri giác" name="currentConsciousness" value={formData.currentConsciousness} onChange={handleChange} multiline />
                  <InputGroup label="Thể trạng" name="currentPhysique" value={formData.currentPhysique} onChange={handleChange} multiline />
                  <InputGroup label="Da niêm" name="currentSkinMucosa" value={formData.currentSkinMucosa} onChange={handleChange} multiline />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blue-400 uppercase">Cơ quan hiện tại</h4>
                  <InputGroup label="Tuần hoàn" name="currentCirculatory" value={formData.currentCirculatory} onChange={handleChange} multiline />
                  <InputGroup label="Hô hấp" name="currentRespiratory" value={formData.currentRespiratory} onChange={handleChange} multiline />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup label="Tiêu hóa" name="currentDigestive" value={formData.currentDigestive} onChange={handleChange} multiline />
                <InputGroup label="Tiết niệu" name="currentUrogenital" value={formData.currentUrogenital} onChange={handleChange} multiline />
                <InputGroup label="Thần kinh" name="currentNervous" value={formData.currentNervous} onChange={handleChange} multiline />
                <InputGroup label="Cơ-Xương-Khớp" name="currentMusculoskeletal" value={formData.currentMusculoskeletal} onChange={handleChange} multiline />
                <InputGroup label="Mắt/TMH/RHM" name="currentEntEyesDental" value={formData.currentEntEyesDental} onChange={handleChange} className="md:col-span-2" multiline />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 block uppercase">10. Y LỆNH THUỐC:</label>
                <DrugOrderTable 
                  rows={formData.drugOrderRows}
                  onChange={handleDrugOrderChange}
                  onAdd={addDrugOrder}
                  onRemove={removeDrugOrder}
                />
              </div>
              <TextAreaGroup label="11. Y LỆNH CHĂM SÓC" name="careOrders" value={formData.careOrders} onChange={handleChange} rows={6} placeholder="Mặc định: Theo dõi DHST, dinh dưỡng..." />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">12. Phân cấp điều dưỡng:</span>
              <div className="flex gap-3">
                {['Cấp I', 'Cấp II', 'Cấp III'].map(level => (
                  <button
                    key={level}
                    onClick={() => setFormData(prev => ({ ...prev, nursingLevel: level }))}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      formData.nursingLevel === level 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section III */}
          <section className="bg-slate-900 rounded-2xl p-8 text-white">
            <SectionTitle title="III. CHẨN ĐOÁN VÀ CAN THIỆP CHĂM SÓC" icon={ClipboardList} />
            <div className="space-y-8">
              <DynamicList 
                label="1. Chẩn đoán chăm sóc:" 
                items={formData.nursingDiagnoses}
                onChange={(index: number, val: string) => handleDynamicListChange('nursingDiagnoses', index, val)}
                onAdd={() => addDynamicListItem('nursingDiagnoses')}
                onRemove={(index: number) => removeDynamicListItem('nursingDiagnoses', index)}
                prefix="1."
              />

              <DynamicList 
                label="2. Can thiệp chăm sóc:" 
                items={formData.nursingInterventions}
                onChange={(index: number, val: string) => handleDynamicListChange('nursingInterventions', index, val)}
                onAdd={() => addDynamicListItem('nursingInterventions')}
                onRemove={(index: number) => removeDynamicListItem('nursingInterventions', index)}
                prefix="2."
              />

              <DynamicList 
                label="3. Đánh giá chăm sóc:" 
                items={formData.nursingEvaluations}
                onChange={(index: number, val: string) => handleDynamicListChange('nursingEvaluations', index, val)}
                onAdd={() => addDynamicListItem('nursingEvaluations')}
                onRemove={(index: number) => removeDynamicListItem('nursingEvaluations', index)}
                prefix="3."
              />
            </div>
          </section>
          
          {/* Footer */}
          <div className="bg-white rounded-b-xl border border-slate-200 p-8 flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 group w-full md:w-auto"
              >
                <Download className="w-6 h-6 group-hover:bounce" />
                XUẤT BỆNH ÁN (.DOCX)
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-black text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95 w-full md:w-auto"
              >
                <ClipboardList className="w-6 h-6" />
                LƯU THÔNG TIN
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'history' ? (
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-8">
              <History className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-black text-slate-800">LỊCH SỬ BỆNH ÁN ĐÃ LƯU</h2>
            </div>
            <SavedRecords 
              isOpen={true} 
              onClose={() => setActiveTab('khcs')} 
              onSelect={(record) => {
                setFormData(record);
                setActiveTab('khcs');
              }} 
              inline
            />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-8">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-black text-slate-800">THÔNG TIN TÀI KHOẢN</h2>
            </div>
            {user ? (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email đăng ký</p>
                    <p className="text-lg font-black text-slate-800">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-100 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Số bệnh án đã lưu</p>
                    <p className="text-2xl font-black text-blue-600">
                      {JSON.parse(localStorage.getItem('saved_records') || '[]').filter((r: any) => r.userId === user.id).length}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-6 py-4 rounded-xl font-black transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    ĐĂNG XUẤT TÀI KHOẢN
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 font-bold mb-4">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black shadow-lg"
                >
                  ĐĂNG NHẬP NGAY
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-slate-400 text-sm mt-8 mb-12">
          &copy; 2026 KHCS - Hệ thống Kế hoạch Chăm sóc Điều dưỡng.
        </p>
      </div>

    {/* Overlays */}
    <Auth 
      isOpen={isAuthOpen} 
      onClose={() => setIsAuthOpen(false)} 
      onAuthSuccess={(u) => setUser(u)} 
    />
    <SavedRecords 
      isOpen={isHistoryOpen} 
      onClose={() => setIsHistoryOpen(false)} 
      onSelect={(record) => setFormData(record)} 
    />
  </div>
  );
}

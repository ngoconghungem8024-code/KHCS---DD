/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TestResult {
  id: string;
  name: string;
  value: string;
  normalValue: string;
  remark: string;
  unit: string;
}

export interface DrugOrderRow {
  id: string;
  name: string;
  quantity: string;
  route: string;
  speed: string;
  time: string;
}

export interface MedicalRecord {
  title: string;
  // I. PHẦN HÀNH CHÁNH
  fullName: string;
  age: string;
  gender: 'Nam' | 'Nữ' | '';
  occupation: string;
  ethnicity: string;
  address: string;
  
  admissionHour: string;
  admissionMinute: string;
  admissionDay: string;
  admissionMonth: string;
  admissionYear: string;

  departmentHour: string;
  departmentMinute: string;
  departmentDay: string;
  departmentMonth: string;
  departmentYear: string;

  // II. PHẦN CHUYÊN MÔN
  reason: string;
  history: string;
  
  // Tiền sử
  personalInternal: string;
  personalExternal: string;
  allergy: string;
  smokingPacksPerYear: string;
  smokingYears: string;
  alcohol: string;
  eatingHabits: string;
  familyHistory: string;

  // Tình trạng lúc vào viện
  admissionStateHour: string;
  admissionStateMinute: string;
  admissionStateDay: string;
  admissionStateMonth: string;
  admissionStateYear: string;
  
  // Toàn thân
  consciousness: string;
  physique: string;
  skinMucosa: string;
  hairNails: string;
  
  // DHST
  pulse: string;
  respiration: string;
  bloodPressure: string;
  spo2: string;
  temperature: string;

  // Organ systems
  circulatory: string;
  respiratory: string;
  digestive: string;
  urogenital: string;
  nervous: string;
  musculoskeletal: string;
  entEyesDental: string;

  // Diagnosis
  diagnosisAdmission: string;
  diagnosisDepartment: string;
  diagnosisCurrent: string;

  testResults: TestResult[];
  clinicalResults: string;
  summary: string;
  initialTreatment: string;
  
  // Current state
  currentStateDay: string;
  currentStateMonth: string;
  currentStateYear: string;
  treatmentDay: string;
  
  currentConsciousness: string;
  currentPhysique: string;
  currentSkinMucosa: string;
  currentCirculatory: string;
  currentRespiratory: string;
  currentDigestive: string;
  currentUrogenital: string;
  currentNervous: string;
  currentMusculoskeletal: string;
  currentEntEyesDental: string;

  drugOrderRows: DrugOrderRow[];
  drugOrders: string; // Keep for legacy/notes
  careOrders: string;
  nursingLevel: string; // Cấp I, II, III

  // III. CHẨN ĐOÁN VÀ CAN THIỆP CHĂM SÓC
  nursingDiagnoses: string[];
  nursingInterventions: string[];
  nursingEvaluations: string[];

  // Legacy fields (optional or to be removed later)
  nursingDiagnosis1?: string;
  nursingDiagnosis2?: string;
  nursingDiagnosis3?: string;
  intervention1?: string;
  intervention2?: string;
  intervention3?: string;
  evaluation1?: string;
  evaluation2?: string;
  evaluation3?: string;
}

export const initialRecord: MedicalRecord = {
  title: '',
  fullName: '', age: '', gender: '', occupation: '', ethnicity: '', address: '',
  admissionHour: '', admissionMinute: '', admissionDay: '', admissionMonth: '', admissionYear: '',
  departmentHour: '', departmentMinute: '', departmentDay: '', departmentMonth: '', departmentYear: '',
  reason: '', history: '',
  personalInternal: '', personalExternal: '', allergy: '', smokingPacksPerYear: '', smokingYears: '', alcohol: '', eatingHabits: '',
  familyHistory: '',
  admissionStateHour: '', admissionStateMinute: '', admissionStateDay: '', admissionStateMonth: '', admissionStateYear: '',
  consciousness: '', physique: '', skinMucosa: '', hairNails: '',
  pulse: '', respiration: '', bloodPressure: '', spo2: '', temperature: '',
  circulatory: '', respiratory: '', digestive: '', urogenital: '', nervous: '', musculoskeletal: '', entEyesDental: '',
  diagnosisAdmission: '', diagnosisDepartment: '', diagnosisCurrent: '',
  testResults: [],
  clinicalResults: '', summary: '', initialTreatment: '',
  currentStateDay: '', currentStateMonth: '', currentStateYear: '', treatmentDay: '',
  currentConsciousness: '', currentPhysique: '', currentSkinMucosa: '',
  currentCirculatory: '', currentRespiratory: '', currentDigestive: '', currentUrogenital: '', currentNervous: '', currentMusculoskeletal: '', currentEntEyesDental: '',
  drugOrderRows: [],
  drugOrders: '', careOrders: '', nursingLevel: '',
  nursingDiagnoses: [''],
  nursingInterventions: [''],
  nursingEvaluations: ['']
};

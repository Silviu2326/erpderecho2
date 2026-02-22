import { useState, useCallback } from 'react';
import { lopdgdService, type Consent, type ConsentType, type ConsentStatus, type DataSubjectRequest, type RetentionPolicy, type DataBreach, type ValidationResult, type ComplianceReport } from '@/services/lopdgdService';
import type { TreatmentActivity, TreatmentActivityInput, ResponsibleParty } from '@/types/lopdgdd';

export interface UseLOPDGDDReturn {
  consents: Consent[];
  dataRequests: DataSubjectRequest[];
  retentionPolicies: RetentionPolicy[];
  breaches: DataBreach[];
  treatmentActivities: TreatmentActivity[];
  responsibleParty: ResponsibleParty | undefined;
  isLoading: boolean;
  recordConsent: (userId: string, type: ConsentType, status: ConsentStatus, version?: string) => Promise<Consent>;
  getConsents: (userId: string) => Promise<Consent[]>;
  hasConsent: (userId: string, type: ConsentType) => Promise<boolean>;
  withdrawConsent: (userId: string, type: ConsentType) => Promise<boolean>;
  handleDataRequest: (userId: string, type: DataSubjectRequest['type'], notes?: string) => Promise<DataSubjectRequest>;
  exportUserData: (userId: string) => Promise<{ success: boolean; data?: unknown; format?: string }>;
  eraseUserData: (userId: string) => Promise<{ success: boolean; deletedCategories: string[] }>;
  getRetentionPolicies: () => RetentionPolicy[];
  updateRetentionPolicy: (policyId: string, updates: Partial<RetentionPolicy>) => boolean;
  checkDocumentsForDeletion: () => Promise<{ toDelete: Array<{ id: string; category: string; expiredAt: Date }>; processed: number }>;
  recordBreach: (description: string, affectedRecords: number, severity: DataBreach['severity']) => Promise<DataBreach>;
  generatePrivacyNotice: (locale?: string) => { title: string; description: string; cookies: Array<{ name: string; purpose: string; duration: string }>; acceptButton: string; rejectButton: string; settingsButton: string };
  logActivity: (userId: string, activity: string, category: string, data?: unknown) => void;
  setResponsibleParty: (party: ResponsibleParty) => void;
  getResponsibleParty: () => ResponsibleParty | undefined;
  validateActivity: (activity: TreatmentActivityInput) => ValidationResult;
  createTreatmentActivity: (input: TreatmentActivityInput) => Promise<{ success: boolean; activity?: TreatmentActivity; validation?: ValidationResult }>;
  getTreatmentActivityById: (id: string) => TreatmentActivity | undefined;
  updateTreatmentActivity: (id: string, updates: Partial<TreatmentActivityInput>) => Promise<{ success: boolean; activity?: TreatmentActivity; validation?: ValidationResult }>;
  deleteTreatmentActivity: (id: string) => Promise<boolean>;
  exportActivitiesToJSON: (pretty?: boolean) => string;
  importActivitiesFromJSON: (jsonString: string) => Promise<{ success: boolean; imported: number; errors: string[]; validationResults: ValidationResult[] }>;
  generateComplianceReport: () => ComplianceReport;
  getActivitiesSummary: () => { total: number; byLegalBasis: Record<string, number>; byDataSubject: Record<string, number>; withTransfers: number; withAutomatedDecisions: number; withProfiling: number };
  refreshTreatmentActivities: () => void;
}

export function useLOPDGDD(): UseLOPDGDDReturn {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [dataRequests, setDataRequests] = useState<DataSubjectRequest[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(lopdgdService.getRetentionPolicies());
  const [breaches, setBreaches] = useState<DataBreach[]>([]);
  const [treatmentActivities, setTreatmentActivities] = useState<TreatmentActivity[]>(lopdgdService.getTreatmentActivities());
  const [responsibleParty, setResponsiblePartyState] = useState<ResponsibleParty | undefined>(lopdgdService.getResponsibleParty());
  const [isLoading, setIsLoading] = useState(false);

  const refreshTreatmentActivities = useCallback(() => {
    setTreatmentActivities(lopdgdService.getTreatmentActivities());
  }, []);

  const recordConsent = useCallback(async (
    userId: string,
    type: ConsentType,
    status: ConsentStatus,
    version: string = '1.0'
  ): Promise<Consent> => {
    setIsLoading(true);
    try {
      const consent = await lopdgdService.recordConsent(userId, type, status, version);
      setConsents(prev => [...prev, consent]);
      return consent;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getConsents = useCallback(async (userId: string): Promise<Consent[]> => {
    return lopdgdService.getConsents(userId);
  }, []);

  const hasConsent = useCallback(async (userId: string, type: ConsentType): Promise<boolean> => {
    return lopdgdService.hasConsent(userId, type);
  }, []);

  const withdrawConsent = useCallback(async (userId: string, type: ConsentType): Promise<boolean> => {
    const result = await lopdgdService.withdrawConsent(userId, type);
    refreshTreatmentActivities();
    return result;
  }, [refreshTreatmentActivities]);

  const handleDataRequest = useCallback(async (
    userId: string,
    type: DataSubjectRequest['type'],
    notes?: string
  ): Promise<DataSubjectRequest> => {
    setIsLoading(true);
    try {
      const request = await lopdgdService.handleDataRequest(userId, type, notes);
      setDataRequests(prev => [...prev, request]);
      return request;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportUserData = useCallback(async (userId: string) => {
    return lopdgdService.exportUserData(userId);
  }, []);

  const eraseUserData = useCallback(async (userId: string) => {
    return lopdgdService.eraseUserData(userId);
  }, []);

  const getRetentionPolicies = useCallback((): RetentionPolicy[] => {
    return lopdgdService.getRetentionPolicies();
  }, []);

  const updateRetentionPolicy = useCallback((policyId: string, updates: Partial<RetentionPolicy>): boolean => {
    const result = lopdgdService.updateRetentionPolicy(policyId, updates);
    if (result) {
      setRetentionPolicies(lopdgdService.getRetentionPolicies());
    }
    return result;
  }, []);

  const checkDocumentsForDeletion = useCallback(async () => {
    return lopdgdService.checkDocumentsForDeletion();
  }, []);

  const recordBreach = useCallback(async (
    description: string,
    affectedRecords: number,
    severity: DataBreach['severity']
  ): Promise<DataBreach> => {
    const breach = await lopdgdService.recordBreach(description, affectedRecords, severity);
    setBreaches(prev => [...prev, breach]);
    return breach;
  }, []);

  const generatePrivacyNotice = useCallback((locale: string = 'es') => {
    return lopdgdService.generatePrivacyNotice(locale);
  }, []);

  const logActivity = useCallback((userId: string, activity: string, category: string, data?: unknown) => {
    lopdgdService.logActivity(userId, activity, category, data);
  }, []);

  const setResponsibleParty = useCallback((party: ResponsibleParty) => {
    lopdgdService.setResponsibleParty(party);
    setResponsiblePartyState(party);
  }, []);

  const getResponsibleParty = useCallback((): ResponsibleParty | undefined => {
    return lopdgdService.getResponsibleParty();
  }, []);

  const validateActivity = useCallback((activity: TreatmentActivityInput): ValidationResult => {
    return lopdgdService.validateActivity(activity);
  }, []);

  const createTreatmentActivity = useCallback(async (input: TreatmentActivityInput) => {
    setIsLoading(true);
    try {
      const result = await lopdgdService.createTreatmentActivity(input);
      if (result.success) {
        refreshTreatmentActivities();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTreatmentActivities]);

  const getTreatmentActivityById = useCallback((id: string): TreatmentActivity | undefined => {
    return lopdgdService.getTreatmentActivityById(id);
  }, []);

  const updateTreatmentActivity = useCallback(async (id: string, updates: Partial<TreatmentActivityInput>) => {
    setIsLoading(true);
    try {
      const result = await lopdgdService.updateTreatmentActivity(id, updates);
      if (result.success) {
        refreshTreatmentActivities();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTreatmentActivities]);

  const deleteTreatmentActivity = useCallback(async (id: string): Promise<boolean> => {
    const result = await lopdgdService.deleteTreatmentActivity(id);
    if (result) {
      refreshTreatmentActivities();
    }
    return result;
  }, [refreshTreatmentActivities]);

  const exportActivitiesToJSON = useCallback((pretty: boolean = true): string => {
    return lopdgdService.exportActivitiesToJSON(pretty);
  }, []);

  const importActivitiesFromJSON = useCallback(async (jsonString: string) => {
    setIsLoading(true);
    try {
      const result = await lopdgdService.importActivitiesFromJSON(jsonString);
      refreshTreatmentActivities();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTreatmentActivities]);

  const generateComplianceReport = useCallback((): ComplianceReport => {
    return lopdgdService.generateComplianceReport();
  }, []);

  const getActivitiesSummary = useCallback(() => {
    return lopdgdService.getActivitiesSummary();
  }, []);

  return {
    consents,
    dataRequests,
    retentionPolicies,
    breaches,
    treatmentActivities,
    responsibleParty,
    isLoading,
    recordConsent,
    getConsents,
    hasConsent,
    withdrawConsent,
    handleDataRequest,
    exportUserData,
    eraseUserData,
    getRetentionPolicies,
    updateRetentionPolicy,
    checkDocumentsForDeletion,
    recordBreach,
    generatePrivacyNotice,
    logActivity,
    setResponsibleParty,
    getResponsibleParty,
    validateActivity,
    createTreatmentActivity,
    getTreatmentActivityById,
    updateTreatmentActivity,
    deleteTreatmentActivity,
    exportActivitiesToJSON,
    importActivitiesFromJSON,
    generateComplianceReport,
    getActivitiesSummary,
    refreshTreatmentActivities,
  };
}

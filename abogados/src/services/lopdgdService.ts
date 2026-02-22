// LOPDGDD / GDPR Service
// Data protection, consent management, and compliance

import type {
  TreatmentActivity,
  TreatmentActivityInput,
  DataCategory,
  LegalBasis,
  ResponsibleParty
} from '../types/lopdgdd';

export type ConsentType = 
  | 'cookies'
  | 'analytics'
  | 'marketing'
  | 'third_party_sharing'
  | 'personal_data_processing'
  | 'communications';

export type ConsentStatus = 'granted' | 'denied' | 'pending' | 'withdrawn';

export interface Consent {
  id: string;
  type: ConsentType;
  status: ConsentStatus;
  grantedAt?: Date;
  deniedAt?: Date;
  withdrawnAt?: Date;
  version: string;
  ipAddress?: string;
}

export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  data?: unknown;
  notes?: string;
}

export interface RetentionPolicy {
  id: string;
  category: string;
  retentionPeriodMonths: number;
  legalBasis: string;
  autoDelete: boolean;
}

export interface DataBreach {
  id: string;
  detectedAt: Date;
  description: string;
  affectedRecords: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedToAuthority: boolean;
  reportedAt?: Date;
  notifiedAffected: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ComplianceReport {
  generatedAt: Date;
  totalActivities: number;
  validActivities: number;
  activitiesByLegalBasis: Record<LegalBasis, number>;
  activitiesByDataCategory: Record<DataCategory, number>;
  activitiesWithTransfers: number;
  activitiesWithAutomatedDecisions: number;
  activitiesWithProfiling: number;
  missingLegalBasis: string[];
  missingDataCategories: string[];
  lastUpdated: Date;
}

// Default retention policies
const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  { id: 'p1', category: 'client_data', retentionPeriodMonths: 84, legalBasis: 'contract', autoDelete: true },
  { id: 'p2', category: 'invoices', retentionPeriodMonths: 120, legalBasis: 'legal_obligation', autoDelete: true },
  { id: 'p3', category: 'case_documents', retentionPeriodMonths: 240, legalBasis: 'legal_obligation', autoDelete: true },
  { id: 'p4', category: 'communications', retentionPeriodMonths: 24, legalBasis: 'legitimate_interest', autoDelete: true },
  { id: 'p5', category: 'cookies', retentionPeriodMonths: 12, legalBasis: 'consent', autoDelete: true },
  { id: 'p6', category: 'marketing', retentionPeriodMonths: 24, legalBasis: 'consent', autoDelete: true }
];

class LOPDGDService {
  private consents: Map<string, Consent[]> = new Map();
  private dataRequests: DataSubjectRequest[] = [];
  private retentionPolicies: RetentionPolicy[] = DEFAULT_RETENTION_POLICIES;
  private breaches: DataBreach[] = [];
  private treatmentActivities: TreatmentActivity[] = [];
  private responsibleParty?: ResponsibleParty;

  /**
   * Record consent from a data subject
   */
  async recordConsent(
    userId: string,
    type: ConsentType,
    status: ConsentStatus,
    version: string = '1.0'
  ): Promise<Consent> {
    const consent: Consent = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status,
      version,
      grantedAt: status === 'granted' ? new Date() : undefined,
      deniedAt: status === 'denied' ? new Date() : undefined,
      withdrawnAt: status === 'withdrawn' ? new Date() : undefined,
      ipAddress: '0.0.0.0' // Would be captured from request in production
    };

    // Save consent
    const userConsents = this.consents.get(userId) || [];
    userConsents.push(consent);
    this.consents.set(userId, userConsents);

    // Also save to localStorage for demo
    localStorage.setItem(`consents_${userId}`, JSON.stringify(userConsents));

    console.log('[LOPD] Consent recorded:', consent);
    return consent;
  }

  /**
   * Get all consents for a user
   */
  async getConsents(userId: string): Promise<Consent[]> {
    return this.consents.get(userId) || [];
  }

  /**
   * Check if user has given specific consent
   */
  async hasConsent(userId: string, type: ConsentType): Promise<boolean> {
    const consents = await this.getConsents(userId);
    const latestConsent = consents.find(c => c.type === type);
    return latestConsent?.status === 'granted';
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(userId: string, type: ConsentType): Promise<boolean> {
    return this.recordConsent(userId, type, 'withdrawn').then(() => true);
  }

  /**
   * Handle data subject access request (DSAR)
   */
  async handleDataRequest(
    userId: string,
    type: DataSubjectRequest['type'],
    notes?: string
  ): Promise<DataSubjectRequest> {
    const request: DataSubjectRequest = {
      id: `dsar_${Date.now()}`,
      type,
      status: 'pending',
      requestedAt: new Date(),
      notes
    };

    this.dataRequests.push(request);

    // In production: queue for processing
    console.log('[LOPD] Data request received:', request);

    // Simulate processing
    setTimeout(() => {
      request.status = 'completed';
      request.completedAt = new Date();
    }, 5000);

    return request;
  }

  /**
   * Export user data (for portability)
   */
  async exportUserData(userId: string): Promise<{
    success: boolean;
    data?: unknown;
    format?: string;
  }> {
    // Mock: collect all user data
    const userData = {
      consents: await this.getConsents(userId),
      profile: { name: 'Demo User', email: 'demo@example.com' },
      cases: [],
      invoices: [],
      exportedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: userData,
      format: 'json'
    };
  }

  /**
   * Delete user data (right to erasure)
   */
  async eraseUserData(userId: string): Promise<{ success: boolean; deletedCategories: string[] }> {
    // In production: delete from all systems
    const deletedCategories = [
      'profile',
      'cases',
      'invoices',
      'communications',
      'consents'
    ];

    console.log('[LOPD] Erasing data for user:', userId, deletedCategories);

    return {
      success: true,
      deletedCategories
    };
  }

  /**
   * Get retention policies
   */
  getRetentionPolicies(): RetentionPolicy[] {
    return this.retentionPolicies;
  }

  /**
   * Update retention policy
   */
  updateRetentionPolicy(policyId: string, updates: Partial<RetentionPolicy>): boolean {
    const index = this.retentionPolicies.findIndex(p => p.id === policyId);
    if (index >= 0) {
      this.retentionPolicies[index] = { ...this.retentionPolicies[index], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Check documents for deletion based on retention policy
   */
  async checkDocumentsForDeletion(): Promise<{
    toDelete: Array<{ id: string; category: string; expiredAt: Date }>;
    processed: number;
  }> {
    // Mock: return empty list
    return {
      toDelete: [],
      processed: 0
    };
  }

  /**
   * Record a data breach
   */
  async recordBreach(
    description: string,
    affectedRecords: number,
    severity: DataBreach['severity']
  ): Promise<DataBreach> {
    const breach: DataBreach = {
      id: `breach_${Date.now()}`,
      detectedAt: new Date(),
      description,
      affectedRecords,
      severity,
      reportedToAuthority: false,
      notifiedAffected: false
    };

    this.breaches.push(breach);

    // In production: notify authority within 72 hours if required
    console.log('[LOPD] Data breach recorded:', breach);

    return breach;
  }

  /**
   * Generate privacy notice (cookie banner content)
   */
  generatePrivacyNotice(locale: string = 'es'): {
    title: string;
    description: string;
    cookies: Array<{ name: string; purpose: string; duration: string }>;
    acceptButton: string;
    rejectButton: string;
    settingsButton: string;
  } {
    return {
      title: locale === 'es' ? 'Aviso de Cookies' : 'Cookie Notice',
      description: locale === 'es' 
        ? 'Utilizamos cookies propias y de terceros para mejorar nuestros servicios y mostrarle publicidad relacionada con sus preferencias.'
        : 'We use own and third-party cookies to improve our services and show you advertising related to your preferences.',
      cookies: [
        { name: 'session', purpose: 'Sesión del usuario', duration: 'Sesión' },
        { name: 'preferences', purpose: 'Preferencias del usuario', duration: '1 año' },
        { name: 'analytics', purpose: 'Análisis anónimo de uso', duration: '1 año' },
        { name: 'marketing', purpose: 'Publicidad personalizada', duration: '1 año' }
      ],
      acceptButton: locale === 'es' ? 'Aceptar todo' : 'Accept all',
      rejectButton: locale === 'es' ? 'Rechazar todo' : 'Reject all',
      settingsButton: locale === 'es' ? 'Personalizar' : 'Customize'
    };
  }

  /**
   * Log data processing activity
   */
  logActivity(
    userId: string,
    activity: string,
    category: string,
    data?: unknown
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      activity,
      category,
      data
    };

    // In production: store in audit log
    console.log('[LOPD] Activity logged:', logEntry);
  }

  // ========== REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT) ==========

  /**
   * Set responsible party information
   */
  setResponsibleParty(party: ResponsibleParty): void {
    this.responsibleParty = party;
  }

  /**
   * Get responsible party information
   */
  getResponsibleParty(): ResponsibleParty | undefined {
    return this.responsibleParty;
  }

  /**
   * Validate treatment activity
   */
  validateActivity(activity: TreatmentActivityInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!activity.legalBasis) {
      errors.push('Falta la base legal del tratamiento');
    }

    if (!activity.dataCategories || activity.dataCategories.length === 0) {
      errors.push('Faltan las categorías de datos definidas');
    }

    if (!activity.name || activity.name.trim() === '') {
      errors.push('Falta el nombre de la actividad de tratamiento');
    }

    if (!activity.purpose || activity.purpose.trim() === '') {
      errors.push('Falta la finalidad del tratamiento');
    }

    if (activity.internationalTransfers && !activity.transferMechanism) {
      errors.push('Transferencia internacional sin mecanismo establecido');
    }

    if (activity.internationalTransfers && activity.transferMechanism === 'none') {
      errors.push('Transferencia internacional marcada sin mecanismo válido');
    }

    if (!activity.retentionPeriod || activity.retentionPeriod.trim() === '') {
      warnings.push('No se ha definido el período de retención');
    }

    if (!activity.securityMeasures || activity.securityMeasures.trim() === '') {
      warnings.push('No se han definido medidas de seguridad');
    }

    if (activity.automatedDecisions && !activity.purpose) {
      warnings.push('Decisiones automatizadas sin finalidad especificada');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create a new treatment activity
   */
  async createTreatmentActivity(input: TreatmentActivityInput): Promise<{
    success: boolean;
    activity?: TreatmentActivity;
    validation?: ValidationResult;
  }> {
    const validation = this.validateActivity(input);

    if (!validation.valid) {
      return { success: false, validation };
    }

    const activity: TreatmentActivity = {
      id: `rat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      lastUpdated: new Date()
    };

    this.treatmentActivities.push(activity);
    console.log('[LOPD] Treatment activity created:', activity.id);

    return { success: true, activity, validation };
  }

  /**
   * Get all treatment activities
   */
  getTreatmentActivities(): TreatmentActivity[] {
    return this.treatmentActivities;
  }

  /**
   * Get treatment activity by ID
   */
  getTreatmentActivityById(id: string): TreatmentActivity | undefined {
    return this.treatmentActivities.find(a => a.id === id);
  }

  /**
   * Update a treatment activity
   */
  async updateTreatmentActivity(
    id: string,
    updates: Partial<TreatmentActivityInput>
  ): Promise<{
    success: boolean;
    activity?: TreatmentActivity;
    validation?: ValidationResult;
  }> {
    const index = this.treatmentActivities.findIndex(a => a.id === id);
    
    if (index < 0) {
      return { success: false, validation: { valid: false, errors: ['Actividad no encontrada'], warnings: [] } };
    }

    const currentActivity = this.treatmentActivities[index];
    const updatedActivity: TreatmentActivityInput = {
      name: updates.name ?? currentActivity.name,
      description: updates.description ?? currentActivity.description,
      purpose: updates.purpose ?? currentActivity.purpose,
      legalBasis: updates.legalBasis ?? currentActivity.legalBasis,
      legalBasisDescription: updates.legalBasisDescription ?? currentActivity.legalBasisDescription,
      dataCategories: updates.dataCategories ?? currentActivity.dataCategories,
      dataSubjects: updates.dataSubjects ?? currentActivity.dataSubjects,
      recipients: updates.recipients ?? currentActivity.recipients,
      internationalTransfers: updates.internationalTransfers ?? currentActivity.internationalTransfers,
      transferMechanism: updates.transferMechanism ?? currentActivity.transferMechanism,
      thirdCountry: updates.thirdCountry ?? currentActivity.thirdCountry,
      retentionPeriod: updates.retentionPeriod ?? currentActivity.retentionPeriod,
      securityMeasures: updates.securityMeasures ?? currentActivity.securityMeasures,
      automatedDecisions: updates.automatedDecisions ?? currentActivity.automatedDecisions,
      profiling: updates.profiling ?? currentActivity.profiling
    };

    const validation = this.validateActivity(updatedActivity);

    if (!validation.valid) {
      return { success: false, validation };
    }

    this.treatmentActivities[index] = {
      ...currentActivity,
      ...updatedActivity,
      lastUpdated: new Date()
    };

    console.log('[LOPD] Treatment activity updated:', id);

    return { 
      success: true, 
      activity: this.treatmentActivities[index],
      validation 
    };
  }

  /**
   * Delete a treatment activity
   */
  async deleteTreatmentActivity(id: string): Promise<boolean> {
    const index = this.treatmentActivities.findIndex(a => a.id === id);
    
    if (index < 0) {
      return false;
    }

    this.treatmentActivities.splice(index, 1);
    console.log('[LOPD] Treatment activity deleted:', id);

    return true;
  }

  /**
   * Export activities to JSON
   */
  exportActivitiesToJSON(pretty: boolean = true): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      responsibleParty: this.responsibleParty,
      activities: this.treatmentActivities
    };

    return JSON.stringify(exportData, null, pretty ? 2 : 0);
  }

  /**
   * Import activities from JSON
   */
  async importActivitiesFromJSON(jsonString: string): Promise<{
    success: boolean;
    imported: number;
    errors: string[];
    validationResults: ValidationResult[];
  }> {
    const errors: string[] = [];
    const validationResults: ValidationResult[] = [];
    let imported = 0;

    try {
      const data = JSON.parse(jsonString);
      
      if (!data.activities || !Array.isArray(data.activities)) {
        return { success: false, imported: 0, errors: ['Formato JSON inválido: falta array de actividades'], validationResults: [] };
      }

      if (data.responsibleParty) {
        this.responsibleParty = data.responsibleParty;
      }

      for (const activityData of data.activities) {
        const validation = this.validateActivity(activityData);
        validationResults.push(validation);

        if (!validation.valid) {
          errors.push(`Actividad "${activityData.name || 'sin nombre'}": errores de validación`);
          continue;
        }

        const activity: TreatmentActivity = {
          id: activityData.id || `rat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: activityData.name,
          description: activityData.description,
          purpose: activityData.purpose,
          legalBasis: activityData.legalBasis,
          legalBasisDescription: activityData.legalBasisDescription,
          dataCategories: activityData.dataCategories,
          dataSubjects: activityData.dataSubjects,
          recipients: activityData.recipients,
          internationalTransfers: activityData.internationalTransfers,
          transferMechanism: activityData.transferMechanism,
          thirdCountry: activityData.thirdCountry,
          retentionPeriod: activityData.retentionPeriod,
          securityMeasures: activityData.securityMeasures,
          automatedDecisions: activityData.automatedDecisions,
          profiling: activityData.profiling,
          lastUpdated: new Date(activityData.lastUpdated) || new Date()
        };

        this.treatmentActivities.push(activity);
        imported++;
      }

      console.log('[LOPD] Imported', imported, 'treatment activities');

      return { success: imported > 0, imported, errors, validationResults };
    } catch (e) {
      return { 
        success: false, 
        imported: 0, 
        errors: [`Error al parsear JSON: ${e instanceof Error ? e.message : 'Error desconocido'}`],
        validationResults: []
      };
    }
  }

  /**
   * Generate compliance audit report
   */
  generateComplianceReport(): ComplianceReport {
    const activitiesByLegalBasis: Record<LegalBasis, number> = {
      consent: 0,
      contract: 0,
      legal_obligation: 0,
      vital_interests: 0,
      public_task: 0,
      legitimate_interest: 0
    };

    const activitiesByDataCategory: Record<DataCategory, number> = {
      identificacion: 0,
      contacto: 0,
      financieros: 0,
      laborales: 0,
      salud: 0,
      condena_penal: 0,
      biometricos: 0,
      localizacion: 0,
      comunicaciones: 0,
      profesional: 0,
      contractual: 0,
      ubicacion: 0
    };

    const missingLegalBasis: string[] = [];
    const missingDataCategories: string[] = [];

    let activitiesWithTransfers = 0;
    let activitiesWithAutomatedDecisions = 0;
    let activitiesWithProfiling = 0;
    let validActivities = 0;

    for (const activity of this.treatmentActivities) {
      if (activity.legalBasis) {
        activitiesByLegalBasis[activity.legalBasis]++;
        validActivities++;
      } else {
        missingLegalBasis.push(activity.name);
      }

      if (activity.dataCategories && activity.dataCategories.length > 0) {
        for (const cat of activity.dataCategories) {
          activitiesByDataCategory[cat]++;
        }
      } else {
        missingDataCategories.push(activity.name);
      }

      if (activity.internationalTransfers) activitiesWithTransfers++;
      if (activity.automatedDecisions) activitiesWithAutomatedDecisions++;
      if (activity.profiling) activitiesWithProfiling++;
    }

    const lastUpdated = this.treatmentActivities.length > 0
      ? new Date(Math.max(...this.treatmentActivities.map(a => new Date(a.lastUpdated).getTime())))
      : new Date();

    return {
      generatedAt: new Date(),
      totalActivities: this.treatmentActivities.length,
      validActivities,
      activitiesByLegalBasis,
      activitiesByDataCategory,
      activitiesWithTransfers,
      activitiesWithAutomatedDecisions,
      activitiesWithProfiling,
      missingLegalBasis,
      missingDataCategories,
      lastUpdated
    };
  }

  /**
   * Get activities summary
   */
  getActivitiesSummary(): {
    total: number;
    byLegalBasis: Record<LegalBasis, number>;
    byDataSubject: Record<string, number>;
    withTransfers: number;
    withAutomatedDecisions: number;
    withProfiling: number;
  } {
    const byLegalBasis: Record<LegalBasis, number> = {
      consent: 0,
      contract: 0,
      legal_obligation: 0,
      vital_interests: 0,
      public_task: 0,
      legitimate_interest: 0
    };

    const byDataSubject: Record<string, number> = {};

    let withTransfers = 0;
    let withAutomatedDecisions = 0;
    let withProfiling = 0;

    for (const activity of this.treatmentActivities) {
      if (activity.legalBasis) {
        byLegalBasis[activity.legalBasis]++;
      }

      for (const ds of activity.dataSubjects) {
        byDataSubject[ds] = (byDataSubject[ds] || 0) + 1;
      }

      if (activity.internationalTransfers) withTransfers++;
      if (activity.automatedDecisions) withAutomatedDecisions++;
      if (activity.profiling) withProfiling++;
    }

    return {
      total: this.treatmentActivities.length,
      byLegalBasis,
      byDataSubject,
      withTransfers,
      withAutomatedDecisions,
      withProfiling
    };
  }
}

export const lopdgdService = new LOPDGDService();

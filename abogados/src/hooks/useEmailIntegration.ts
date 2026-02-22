import { useState, useCallback } from 'react';
import { 
  emailService, 
  type EmailPayload, 
  type EmailTemplateType
} from '@/services/emailService';
import { googleService } from '@/services/googleService';
import { microsoftService } from '@/services/microsoftService';

export type EmailProvider = 'template' | 'gmail' | 'outlook';

export interface DirectEmailOptions {
  to: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  cc?: string[];
  bcc?: string[];
}

export interface UseEmailIntegrationOptions {
  defaultProvider?: EmailProvider;
  autoSelectAvailable?: boolean;
}

interface UseEmailIntegrationReturn {
  provider: EmailProvider;
  isSending: boolean;
  lastResult: EmailIntegrationResult | null;
  error: string | null;
  
  setProvider: (provider: EmailProvider) => void;
  
  sendTemplateEmail: (
    payload: Omit<EmailPayload, 'to'>,
    to?: string
  ) => Promise<EmailIntegrationResult>;
  
  sendDirectEmail: (
    options: DirectEmailOptions
  ) => Promise<EmailIntegrationResult>;
  
  sendWithBestAvailable: (
    options: DirectEmailOptions | Omit<EmailPayload, 'to'>
  ) => Promise<EmailIntegrationResult>;
  
  getAvailableProviders: () => EmailProvider[];
  isProviderAvailable: (provider: EmailProvider) => boolean;
  
  previewTemplate: (
    template: EmailTemplateType, 
    data: Record<string, unknown>
  ) => Promise<{ subject: string; body: string }>;
  
  getTemplates: () => { type: EmailTemplateType; subject: string }[];
}

export interface EmailIntegrationResult {
  success: boolean;
  provider: EmailProvider;
  messageId?: string;
  timestamp: Date;
  error?: string;
}

const TEMPLATE_PROVIDER: EmailProvider = 'template';

export function useEmailIntegration(
  options: UseEmailIntegrationOptions = {}
): UseEmailIntegrationReturn {
  const { 
    defaultProvider = 'template',
    autoSelectAvailable = true 
  } = options;

  const [provider, setProviderState] = useState<EmailProvider>(() => {
    if (autoSelectAvailable) {
      if (googleService.isAuthenticated()) return 'gmail';
      if (microsoftService.isAuthenticated()) return 'outlook';
    }
    return defaultProvider;
  });

  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<EmailIntegrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setProvider = useCallback((newProvider: EmailProvider) => {
    setProviderState(newProvider);
  }, []);

  const isProviderAvailable = useCallback((p: EmailProvider): boolean => {
    switch (p) {
      case 'template':
        return true;
      case 'gmail':
        return googleService.isAuthenticated();
      case 'outlook':
        return microsoftService.isAuthenticated();
      default:
        return false;
    }
  }, []);

  const getAvailableProviders = useCallback((): EmailProvider[] => {
    const providers: EmailProvider[] = ['template'];
    if (googleService.isAuthenticated()) providers.push('gmail');
    if (microsoftService.isAuthenticated()) providers.push('outlook');
    return providers;
  }, []);

  const sendTemplateEmail = useCallback(async (
    payload: Omit<EmailPayload, 'to'>,
    to?: string
  ): Promise<EmailIntegrationResult> => {
    setIsSending(true);
    setError(null);

    const targetEmail = to || localStorage.getItem('client_email') || 'cliente@ejemplo.com';

    try {
      const response = await emailService.sendEmail({
        ...payload,
        to: targetEmail
      });

      const result: EmailIntegrationResult = {
        success: response.success,
        provider: TEMPLATE_PROVIDER,
        messageId: response.messageId,
        timestamp: response.timestamp,
        error: response.success ? undefined : 'Failed to send email'
      };

      setLastResult(result);
      if (!response.success) {
        setError(result.error || 'Unknown error');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const result: EmailIntegrationResult = {
        success: false,
        provider: TEMPLATE_PROVIDER,
        timestamp: new Date(),
        error: errorMessage
      };
      setLastResult(result);
      setError(errorMessage);
      return result;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendDirectEmail = useCallback(async (
    options: DirectEmailOptions
  ): Promise<EmailIntegrationResult> => {
    setIsSending(true);
    setError(null);

    const currentProvider = provider;

    try {
      let result: EmailIntegrationResult;

      switch (currentProvider) {
        case 'gmail': {
          const response = await googleService.enviarEmail(options);
          result = {
            success: response.success,
            provider: 'gmail',
            messageId: response.success ? response.data?.id : undefined,
            timestamp: new Date(),
            error: response.success ? undefined : response.error
          };
          break;
        }
        case 'outlook': {
          const response = await microsoftService.enviarEmail(options);
          result = {
            success: response.success,
            provider: 'outlook',
            messageId: response.success ? response.data?.id : undefined,
            timestamp: new Date(),
            error: response.success ? undefined : response.error
          };
          break;
        }
        case 'template':
        default: {
          const targetEmail = options.to[0] || 'cliente@ejemplo.com';
          const response = await emailService.sendEmail({
            to: targetEmail,
            template: 'new_message',
            subject: options.subject,
            data: { 
              body: options.body,
              htmlBody: options.htmlBody,
              from: 'Bufete',
              preview: options.body.substring(0, 100)
            }
          });
          result = {
            success: response.success,
            provider: TEMPLATE_PROVIDER,
            messageId: response.messageId,
            timestamp: response.timestamp
          };
          break;
        }
      }

      setLastResult(result);
      if (!result.success) {
        setError(result.error || 'Failed to send email');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const result: EmailIntegrationResult = {
        success: false,
        provider: currentProvider,
        timestamp: new Date(),
        error: errorMessage
      };
      setLastResult(result);
      setError(errorMessage);
      return result;
    } finally {
      setIsSending(false);
    }
  }, [provider]);

  const sendWithBestAvailable = useCallback(async (
    options: DirectEmailOptions | Omit<EmailPayload, 'to'>
  ) => {
    const availableProviders = getAvailableProviders();
    
    if ('template' in options && !('body' in options)) {
      return sendTemplateEmail(
        options as Omit<EmailPayload, 'to'>,
        (options as EmailPayload).to
      );
    }

    const directOptions = options as DirectEmailOptions;
    
    for (const p of availableProviders) {
      if (p === 'template') continue;
      
      setProviderState(p);
      const result = await sendDirectEmail(directOptions);
      
      if (result.success) {
        return result;
      }
    }

    setProviderState('template');
    return sendDirectEmail(directOptions);
  }, [getAvailableProviders, sendTemplateEmail, sendDirectEmail]);

  const previewTemplate = useCallback(async (
    template: EmailTemplateType,
    data: Record<string, unknown>
  ): Promise<{ subject: string; body: string }> => {
    return emailService.previewTemplate(template, data);
  }, []);

  const getTemplates = useCallback(() => {
    return emailService.getTemplates();
  }, []);

  return {
    provider,
    isSending,
    lastResult,
    error,
    setProvider,
    sendTemplateEmail,
    sendDirectEmail,
    sendWithBestAvailable,
    getAvailableProviders,
    isProviderAvailable,
    previewTemplate,
    getTemplates
  };
}

export function useEmailProviderStatus() {
  const [gmailConnected, setGmailConnected] = useState(googleService.isAuthenticated());
  const [outlookConnected, setOutlookConnected] = useState(microsoftService.isAuthenticated());

  const refresh = useCallback(() => {
    setGmailConnected(googleService.isAuthenticated());
    setOutlookConnected(microsoftService.isAuthenticated());
  }, []);

  return {
    gmailConnected,
    outlookConnected,
    templateAvailable: true,
    refresh,
    hasAnyProvider: gmailConnected || outlookConnected,
    hasAllProviders: gmailConnected && outlookConnected
  };
}

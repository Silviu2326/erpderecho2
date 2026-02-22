declare global {
  interface Window {
    MSAL?: {
      createInstance: (config: {
        auth: {
          clientId: string;
          authority: string;
          redirectUri: string;
          navigateToLoginRequestUrl: boolean;
        };
        cache: {
          cacheLocation: string;
          storeAuthStateInCookie: boolean;
        };
      }) => Promise<MsalInstance>;
    };
  }
}

export interface MsalInstance {
  loginPopup(config: { scopes: string[]; redirectUri: string }): Promise<AuthenticationResult>;
  loginRedirect(config: { scopes: string[]; redirectUri: string }): Promise<void>;
  logoutPopup(config?: { account: { username: string } }): Promise<void>;
  handleRedirectPromise(hash?: string): Promise<AuthenticationResult | null>;
  getAllAccounts(): { username: string; localAccountId: string }[];
}

export interface AuthenticationResult {
  accessToken: string;
  account: { username: string; localAccountId: string };
  expiresOn: Date;
  fromCache?: boolean;
  tokenType?: string;
  scopes?: string[];
}

export type MicrosoftServiceType = 'outlook' | 'calendar' | 'onedrive';

export interface MicrosoftConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
}

export interface OutlookMessage {
  id: string;
  subject: string;
  from: { emailAddress: { address: string; name: string } };
  toRecipients: { emailAddress: { address: string; name: string } }[];
  body: { contentType: 'text' | 'html'; content: string };
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
}

export interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  attendees?: { emailAddress: { address: string; name: string }; type: string }[];
  body?: { contentType: 'text' | 'html'; content: string };
  isAllDay: boolean;
  sensitivity?: string;
}

export interface OneDriveItem {
  id: string;
  name: string;
  size: number;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
}

export interface MicrosoftResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const DEFAULT_SCOPES = [
  'User.Read',
  'Mail.Read',
  'Mail.Send',
  'Calendars.Read',
  'Calendars.ReadWrite',
  'Files.Read',
  'Files.ReadWrite'
];

const GRAPH_ENDPOINTS = {
  outlook: 'https://graph.microsoft.com/v1.0/me/messages',
  calendar: 'https://graph.microsoft.com/v1.0/me/events',
  onedrive: 'https://graph.microsoft.com/v1.0/me/drive/root/children'
};

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

class MicrosoftService {
  private accessToken: string | null = null;
  private msalInstance: MsalInstance | null = null;
  private config: MicrosoftConfig | null = null;
  private isInitialized: boolean = false;
  private tokenExpirationTime: number = 0;
  private account: { username: string; localAccountId: string } | null = null;

  async initialize(config: MicrosoftConfig): Promise<void> {
    this.config = {
      ...config,
      scopes: config.scopes.length > 0 ? config.scopes : DEFAULT_SCOPES
    };
    
    if (typeof window !== 'undefined' && window.MSAL) {
      try {
        this.msalInstance = await window.MSAL.createInstance({
          auth: {
            clientId: config.clientId,
            authority: `https://login.microsoftonline.com/${config.tenantId}`,
            redirectUri: config.redirectUri,
            navigateToLoginRequestUrl: false,
          },
          cache: {
            cacheLocation: 'sessionStorage',
            storeAuthStateInCookie: false,
          }
        });
        console.log('[MicrosoftService] MSAL initialized successfully');
      } catch (error) {
        console.error('[MicrosoftService] Failed to initialize MSAL:', error);
      }
    }
    
    this.isInitialized = true;
    console.log('[MicrosoftService] Initialized with config:', {
      clientId: config.clientId.substring(0, 8) + '...',
      tenantId: config.tenantId,
      scopes: this.config.scopes
    });
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpirationTime;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  getAccount(): { username: string; localAccountId: string } | null {
    return this.account;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MicrosoftResponse<T>> {
    if (!this.accessToken) {
      return { success: false, error: 'Not authenticated. Call login() first.' };
    }

    if (Date.now() >= this.tokenExpirationTime - 60000) {
      const refreshResult = await this.refreshAccessToken();
      if (!refreshResult.success) {
        return { success: false, error: 'Token expired. Please login again.' };
      }
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async login(): Promise<MicrosoftResponse<AuthenticationResult>> {
    if (!this.msalInstance || !this.config) {
      return { success: false, error: 'Service not initialized. Call initialize() first.' };
    }

    try {
      const response = await this.msalInstance.loginPopup({
        scopes: this.config.scopes,
        redirectUri: this.config.redirectUri
      });

      this.accessToken = response.accessToken;
      this.account = response.account;
      this.tokenExpirationTime = response.expiresOn.getTime();
      
      console.log('[MicrosoftService] Login successful');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  async loginRedirect(): Promise<MicrosoftResponse<void>> {
    if (!this.msalInstance || !this.config) {
      return { success: false, error: 'Service not initialized. Call initialize() first.' };
    }

    try {
      await this.msalInstance.loginRedirect({
        scopes: this.config.scopes,
        redirectUri: this.config.redirectUri
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login redirect failed'
      };
    }
  }

  async handleRedirectCallback(): Promise<MicrosoftResponse<AuthenticationResult>> {
    if (!this.msalInstance) {
      return { success: false, error: 'MSAL not initialized' };
    }

    try {
      const response = await this.msalInstance.handleRedirectPromise(window.location.hash);
      if (response) {
        this.accessToken = response.accessToken;
        this.account = response.account;
        this.tokenExpirationTime = response.expiresOn.getTime();
        return { success: true, data: response };
      }
      return { success: false, error: 'No redirect result' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Redirect callback failed'
      };
    }
  }

  private async refreshAccessToken(): Promise<MicrosoftResponse<AuthenticationResult>> {
    if (!this.msalInstance || !this.account) {
      return { success: false, error: 'No account to refresh token' };
    }

    try {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        return { success: false, error: 'No accounts found' };
      }

      const response = await this.msalInstance.loginPopup({
        scopes: this.config?.scopes || DEFAULT_SCOPES,
        redirectUri: this.config?.redirectUri || window.location.origin
      });

      this.accessToken = response.accessToken;
      this.account = response.account;
      this.tokenExpirationTime = response.expiresOn.getTime();
      
      return { success: true, data: response };
    } catch (error) {
      this.accessToken = null;
      this.account = null;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }

  async logout(): Promise<void> {
    if (this.msalInstance && this.account) {
      await this.msalInstance.logoutPopup({ account: this.account });
    }
    this.accessToken = null;
    this.account = null;
    this.tokenExpirationTime = 0;
  }

  async getMessages(
    options: { top?: number; skip?: number; filter?: string } = {}
  ): Promise<MicrosoftResponse<{ value: OutlookMessage[] }>> {
    const params = new URLSearchParams();
    if (options.top) params.append('$top', options.top.toString());
    if (options.skip) params.append('$skip', options.skip.toString());
    if (options.filter) params.append('$filter', options.filter);

    const url = `${GRAPH_ENDPOINTS.outlook}?${params.toString()}`;
    return this.makeRequest<{ value: OutlookMessage[] }>(url);
  }

  async getMessage(messageId: string): Promise<MicrosoftResponse<OutlookMessage>> {
    return this.makeRequest<OutlookMessage>(`${GRAPH_ENDPOINTS.outlook}/${messageId}`);
  }

  async sendMessage(message: {
    subject: string;
    toRecipients: { emailAddress: { address: string; name: string } }[];
    body: { contentType: 'text' | 'html'; content: string };
  }): Promise<MicrosoftResponse<{ id: string }>> {
    const url = 'https://graph.microsoft.com/v1.0/me/sendMail';
    return this.makeRequest<{ id: string }>(url, {
      method: 'POST',
      body: JSON.stringify({
        message: {
          subject: message.subject,
          body: message.body,
          toRecipients: message.toRecipients
        }
      })
    });
  }

  async enviarEmail(email: {
    to: string[];
    subject: string;
    body: string;
    htmlBody?: string;
    cc?: string[];
    bcc?: string[];
  }): Promise<MicrosoftResponse<{ id: string }>> {
    const message: {
      subject: string;
      body: { contentType: 'text' | 'html'; content: string };
      toRecipients: { emailAddress: { address: string; name: string } }[];
      ccRecipients?: { emailAddress: { address: string; name: string } }[];
      bccRecipients?: { emailAddress: { address: string; name: string } }[];
    } = {
      subject: email.subject,
      body: email.htmlBody
        ? { contentType: 'html' as const, content: email.htmlBody }
        : { contentType: 'text' as const, content: email.body },
      toRecipients: email.to.map(address => ({
        emailAddress: { address, name: address }
      }))
    };

    if (email.cc?.length) {
      message.ccRecipients = email.cc.map(address => ({
        emailAddress: { address, name: address }
      }));
    }

    if (email.bcc?.length) {
      message.bccRecipients = email.bcc.map(address => ({
        emailAddress: { address, name: address }
      }));
    }

    return this.sendMessage(message);
  }

  async getCalendarEvents(
    options: {
      startDateTime?: string;
      endDateTime?: string;
      top?: number;
    } = {}
  ): Promise<MicrosoftResponse<{ value: CalendarEvent[] }>> {
    const params = new URLSearchParams();
    if (options.startDateTime && options.endDateTime) {
      params.append(
        '$filter',
        `start/dateTime ge '${options.startDateTime}' and end/dateTime le '${options.endDateTime}'`
      );
    }
    if (options.top) params.append('$top', options.top.toString());

    const url = `${GRAPH_ENDPOINTS.calendar}?${params.toString()}`;
    return this.makeRequest<{ value: CalendarEvent[] }>(url);
  }

  async getEvent(eventId: string): Promise<MicrosoftResponse<CalendarEvent>> {
    return this.makeRequest<CalendarEvent>(`${GRAPH_ENDPOINTS.calendar}/${eventId}`);
  }

  async createEvent(event: {
    subject: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: { displayName: string };
    attendees?: { emailAddress: { address: string; name: string }; type: string }[];
    body?: { contentType: 'text' | 'html'; content: string };
    isAllDay?: boolean;
  }): Promise<MicrosoftResponse<CalendarEvent>> {
    return this.makeRequest<CalendarEvent>(GRAPH_ENDPOINTS.calendar, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  async updateEvent(
    eventId: string,
    event: Partial<{
      subject: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
      location: { displayName: string };
      body: { contentType: 'text' | 'html'; content: string };
    }>
  ): Promise<MicrosoftResponse<CalendarEvent>> {
    return this.makeRequest<CalendarEvent>(`${GRAPH_ENDPOINTS.calendar}/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(event)
    });
  }

  async deleteEvent(eventId: string): Promise<MicrosoftResponse<void>> {
    return this.makeRequest<void>(`${GRAPH_ENDPOINTS.calendar}/${eventId}`, {
      method: 'DELETE'
    });
  }

  async getFiles(
    options: { top?: number; folderId?: string } = {}
  ): Promise<MicrosoftResponse<{ value: OneDriveItem[] }>> {
    let url = GRAPH_ENDPOINTS.onedrive;
    if (options.folderId) {
      url = `https://graph.microsoft.com/v1.0/me/drive/items/${options.folderId}/children`;
    }

    const params = new URLSearchParams();
    if (options.top) params.append('$top', options.top.toString());

    return this.makeRequest<{ value: OneDriveItem[] }>(`${url}?${params.toString()}`);
  }

  async getFile(fileId: string): Promise<MicrosoftResponse<OneDriveItem>> {
    return this.makeRequest<OneDriveItem>(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`
    );
  }

  async uploadFile(
    fileName: string,
    content: Blob | ArrayBuffer,
    folderId?: string
  ): Promise<MicrosoftResponse<OneDriveItem>> {
    const endpoint = folderId
      ? `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${fileName}:/content`
      : `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`;

    return this.makeRequest<OneDriveItem>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: content
    });
  }

  async downloadFile(fileId: string): Promise<MicrosoftResponse<Blob>> {
    if (!this.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      };
    }
  }

  async deleteFile(fileId: string): Promise<MicrosoftResponse<void>> {
    return this.makeRequest<void>(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
      { method: 'DELETE' }
    );
  }

  getConfig(): MicrosoftConfig | null {
    return this.config;
  }

  async syncDocumentos(
    localFiles: { name: string; lastModified: number; content: Blob | ArrayBuffer }[],
    options: { folderId?: string; onUpload?: (name: string) => void; onDownload?: (name: string, url: string) => void } = {}
  ): Promise<MicrosoftResponse<{ uploaded: number; downloaded: number; conflicts: string[] }>> {
    const conflicts: string[] = [];
    let uploaded = 0;
    let downloaded = 0;

    const remoteResult = await this.getFiles({ folderId: options.folderId });
    if (!remoteResult.success || !remoteResult.data) {
      return { success: false, error: remoteResult.error || 'Failed to fetch remote files' };
    }

    const remoteFilesMap = new Map(remoteResult.data.value.map(f => [f.name.toLowerCase(), f]));
    const localFilesMap = new Map(localFiles.map(f => [f.name.toLowerCase(), f]));

    for (const [name, localFile] of localFilesMap) {
      const remoteFile = remoteFilesMap.get(name);
      
      if (!remoteFile) {
        const uploadResult = await this.uploadFile(localFile.name, localFile.content, options.folderId);
        if (uploadResult.success) {
          uploaded++;
          options.onUpload?.(localFile.name);
        }
      } else if (new Date(remoteFile.lastModifiedDateTime).getTime() > localFile.lastModified) {
        conflicts.push(localFile.name);
      }
    }

    for (const [name, remoteFile] of remoteFilesMap) {
      if (!localFilesMap.has(name) && !remoteFile.folder) {
        if (options.onDownload) {
          options.onDownload(remoteFile.name, remoteFile.webUrl);
        }
        downloaded++;
      }
    }

    return {
      success: true,
      data: { uploaded, downloaded, conflicts }
    };
  }
}

export const microsoftService = new MicrosoftService();

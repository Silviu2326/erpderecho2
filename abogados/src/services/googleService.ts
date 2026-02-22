declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: GoogleAuthError) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

export interface GoogleAuthError {
  error: string;
  error_description?: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

export type GoogleServiceType = 'gmail' | 'calendar' | 'drive';

export interface GoogleConfig {
  clientId: string;
  apiKey: string;
  redirectUri: string;
  scopes: string[];
}

interface InternalConfig {
  clientId: string;
  apiKey: string;
  redirectUri: string;
  scopes: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: { email: string; name?: string };
  to: string[];
  cc?: string[];
  body: string;
  htmlBody?: string;
  receivedAt: string;
  isRead: boolean;
  hasAttachments: boolean;
  attachments?: GmailAttachment[];
}

export interface GmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
  organizer?: { email: string; displayName?: string };
  hangoutLink?: string;
  conferenceData?: ConferenceData;
  status: string;
  htmlLink: string;
}

export interface ConferenceData {
  conferenceId: string;
  conferenceSolution: { name: string };
  entryPoints?: { entryPointType: string; uri: string }[];
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webViewLink: string;
  webContentLink?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  thumbnailLink?: string;
  iconLink?: string;
  isFolder?: boolean;
}

export interface GoogleResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
].join(' ');

const API_ENDPOINTS = {
  gmail: 'https://gmail.googleapis.com/gmail/v1/users/me',
  calendar: 'https://www.googleapis.com/calendar/v3',
  drive: 'https://www.googleapis.com/drive/v3'
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

class GoogleService {
  private accessToken: string | null = null;
  private config: InternalConfig | null = null;
  private isInitialized: boolean = false;
  private tokenExpirationTime: number = 0;
  private tokenClient: GoogleTokenClient | null = null;
  private userEmail: string | null = null;

  async initialize(config: GoogleConfig): Promise<void> {
    this.config = {
      ...config,
      scopes: config.scopes.length > 0 ? config.scopes.join(' ') : DEFAULT_SCOPES
    };

    if (typeof window !== 'undefined') {
      await this.loadGoogleScript();
      
      if (window.google?.accounts?.oauth2) {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: config.clientId,
          scope: this.config.scopes,
          callback: (response: GoogleTokenResponse) => {
            if (response.access_token) {
              this.accessToken = response.access_token;
              this.tokenExpirationTime = Date.now() + response.expires_in * 1000;
              console.log('[GoogleService] Token obtained successfully');
            }
          },
          error_callback: (error: GoogleAuthError) => {
            console.error('[GoogleService] Auth error:', error);
          }
        });
        console.log('[GoogleService] Token client initialized');
      }
    }

    this.isInitialized = true;
    console.log('[GoogleService] Initialized with config:', {
      clientId: config.clientId.substring(0, 8) + '...',
      scopes: this.config.scopes.split(' ')
    });
  }

  private async loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
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

  getUserEmail(): string | null {
    return this.userEmail;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<GoogleResponse<T>> {
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

      if (response.status === 204) {
        return { success: true };
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

  async login(): Promise<GoogleResponse<GoogleTokenResponse>> {
    return new Promise((resolve) => {
      if (!this.tokenClient || !this.config) {
        resolve({ success: false, error: 'Service not initialized. Call initialize() first.' });
        return;
      }

      const tempClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scopes,
        callback: (response: GoogleTokenResponse) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            this.tokenExpirationTime = Date.now() + response.expires_in * 1000;
            console.log('[GoogleService] Login successful');
            resolve({ success: true, data: response });
          } else {
            resolve({ success: false, error: 'No access token received' });
          }
        },
        error_callback: (error: GoogleAuthError) => {
          resolve({ success: false, error: error.error_description || error.error });
        }
      });

      tempClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  async loginWithRedirect(returnUrl?: string): Promise<void> {
    if (!this.config) {
      throw new Error('Service not initialized');
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    sessionStorage.setItem('google_code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent'
    });

    if (returnUrl) {
      params.append('state', returnUrl);
    }

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleRedirectCallback(): Promise<GoogleResponse<GoogleTokenResponse>> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      return { success: false, error };
    }

    if (!code) {
      return { success: false, error: 'No authorization code received' };
    }

    if (!this.config) {
      return { success: false, error: 'Service not initialized' };
    }

    const codeVerifier = sessionStorage.getItem('google_code_verifier');
    if (!codeVerifier) {
      return { success: false, error: 'No code verifier found' };
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          code,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error_description || data.error };
      }

      this.accessToken = data.access_token;
      this.tokenExpirationTime = Date.now() + data.expires_in * 1000;
      if (data.refresh_token) {
        sessionStorage.setItem('google_refresh_token', data.refresh_token);
      }

      sessionStorage.removeItem('google_code_verifier');
      window.history.replaceState({}, '', window.location.pathname);

      return { success: true, data: { ...data, scope: this.config.scopes } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Token exchange failed' };
    }
  }

  private async refreshAccessToken(): Promise<GoogleResponse<GoogleTokenResponse>> {
    const refreshToken = sessionStorage.getItem('google_refresh_token');
    
    if (!refreshToken || !this.config) {
      return { success: false, error: 'No refresh token available' };
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error_description || data.error };
      }

      this.accessToken = data.access_token;
      this.tokenExpirationTime = Date.now() + data.expires_in * 1000;

      return { success: true, data: { ...data, scope: this.config.scopes } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Token refresh failed' };
    }
  }

  async logout(): Promise<void> {
    if (this.accessToken) {
      try {
        await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `token=${this.accessToken}`
        });
      } catch (e) {
        console.warn('[GoogleService] Token revoke failed:', e);
      }
    }

    this.accessToken = null;
    this.tokenExpirationTime = 0;
    this.userEmail = null;
    sessionStorage.removeItem('google_refresh_token');
    sessionStorage.removeItem('google_code_verifier');
  }

  async getProfile(): Promise<GoogleResponse<{ email: string; name?: string }>> {
    const result = await this.makeRequest<{ email: string; name?: string }>(
      'https://www.googleapis.com/oauth2/v2/userinfo'
    );

    if (result.success && result.data) {
      this.userEmail = result.data.email;
    }

    return result;
  }

  async getMessages(
    options: { maxResults?: number; pageToken?: string; query?: string } = {}
  ): Promise<GoogleResponse<{ messages: { id: string; threadId: string }[]; nextPageToken?: string }>> {
    const params = new URLSearchParams();
    if (options.maxResults) params.append('maxResults', options.maxResults.toString());
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.query) params.append('q', options.query);

    const url = `${API_ENDPOINTS.gmail}/messages?${params.toString()}`;
    return this.makeRequest(url);
  }

  async getMessage(messageId: string): Promise<GoogleResponse<GmailMessage>> {
    const [headerResult, bodyResult] = await Promise.all([
      this.makeRequest<{
        id: string;
        threadId: string;
        payload: { headers: { name: string; value: string }[] };
        internalDate: string;
        labelIds?: string[];
      }>(`${API_ENDPOINTS.gmail}/messages/${messageId}`),
      this.makeRequest<{ payload: { body: { data?: string }; parts?: { body: { data?: string }; mimeType: string }[] } }>(
        `${API_ENDPOINTS.gmail}/messages/${messageId}?format=full`
      )
    ]);

    if (!headerResult.success || !bodyResult.success) {
      return { success: false, error: 'Failed to fetch message' };
    }

    const headers = headerResult.data!.payload.headers;
    const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const parseBody = (data: string) => {
      try {
        return decodeURIComponent(atob(data).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      } catch {
        return '';
      }
    };

    const bodyData = bodyResult.data!.payload.body.data || 
      bodyResult.data!.payload.parts?.find(p => p.mimeType === 'text/plain')?.body.data ||
      bodyResult.data!.payload.parts?.find(p => p.mimeType === 'text/html')?.body.data || '';

    const htmlBodyData = bodyResult.data!.payload.parts?.find(p => p.mimeType === 'text/html')?.body.data;

    return {
      success: true,
      data: {
        id: headerResult.data!.id,
        threadId: headerResult.data!.threadId,
        subject: getHeader('Subject'),
        from: { email: getHeader('From'), name: getHeader('From').match(/^(.+)</)?.[1]?.trim() },
        to: getHeader('To').split(',').map(e => e.trim()),
        cc: getHeader('Cc') ? getHeader('Cc').split(',').map(e => e.trim()) : undefined,
        body: bodyData ? parseBody(bodyData) : '',
        htmlBody: htmlBodyData ? parseBody(htmlBodyData) : undefined,
        receivedAt: new Date(parseInt(headerResult.data!.internalDate)).toISOString(),
        isRead: !headerResult.data!.labelIds?.includes('UNREAD'),
        hasAttachments: headerResult.data!.labelIds?.includes('ATTACHMENT') || false
      }
    };
  }

  async sendMessage(message: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    htmlBody?: string;
    attachments?: { filename: string; content: string; mimeType: string }[];
  }): Promise<GoogleResponse<{ id: string }>> {
    const boundary = 'boundary_' + Math.random().toString(36).substring(2);
    
    let mimeMessage = `To: ${message.to.join(', ')}\n`;
    if (message.cc?.length) mimeMessage += `Cc: ${message.cc.join(', ')}\n`;
    mimeMessage += `Subject: ${message.subject}\n`;
    mimeMessage += `MIME-Version: 1.0\n`;
    mimeMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`;

    mimeMessage += `--${boundary}\n`;
    mimeMessage += `Content-Type: ${message.htmlBody ? 'text/html' : 'text/plain'}; charset="UTF-8"\n`;
    mimeMessage += `Content-Transfer-Encoding: 7bit\n\n`;
    mimeMessage += `${message.htmlBody || message.body}\n`;

    if (message.attachments?.length) {
      for (const att of message.attachments) {
        mimeMessage += `--${boundary}\n`;
        mimeMessage += `Content-Type: ${att.mimeType}; name="${att.filename}"\n`;
        mimeMessage += `Content-Disposition: attachment; filename="${att.filename}"\n`;
        mimeMessage += `Content-Transfer-Encoding: base64\n\n`;
        mimeMessage += `${att.content}\n`;
      }
    }

    mimeMessage += `--${boundary}--`;

    const encoded = btoa(unescape(encodeURIComponent(mimeMessage)));

    return this.makeRequest<{ id: string }>(`${API_ENDPOINTS.gmail}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: encoded })
    });
  }

  async enviarEmail(email: {
    to: string[];
    subject: string;
    body: string;
    htmlBody?: string;
    cc?: string[];
    bcc?: string[];
  }): Promise<GoogleResponse<{ id: string }>> {
    return this.sendMessage({
      to: email.to,
      subject: email.subject,
      body: email.body,
      htmlBody: email.htmlBody,
      cc: email.cc
    });
  }

  async getCalendarEvents(
    options: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
      pageToken?: string;
      q?: string;
    } = {}
  ): Promise<GoogleResponse<{ items: CalendarEvent[]; nextPageToken?: string; summary?: string }>> {
    const params = new URLSearchParams();
    if (options.timeMin) params.append('timeMin', options.timeMin);
    if (options.timeMax) params.append('timeMax', options.timeMax);
    if (options.maxResults) params.append('maxResults', options.maxResults.toString());
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.q) params.append('q', options.q);

    const url = `${API_ENDPOINTS.calendar}/calendars/primary/events?${params.toString()}`;
    return this.makeRequest(url);
  }

  async getEvent(eventId: string): Promise<GoogleResponse<CalendarEvent>> {
    return this.makeRequest<CalendarEvent>(
      `${API_ENDPOINTS.calendar}/calendars/primary/events/${eventId}`
    );
  }

  async createEvent(event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: string;
    attendees?: { email: string; displayName?: string }[];
    conferenceDataVersion?: number;
  }): Promise<GoogleResponse<CalendarEvent>> {
    const body: Record<string, unknown> = {
      summary: event.summary,
      start: event.start,
      end: event.end
    };

    if (event.description) body.description = event.description;
    if (event.location) body.location = event.location;
    if (event.attendees) body.attendees = event.attendees;
    if (event.conferenceDataVersion) {
      body.conferenceData = { createRequest: { requestId: crypto.randomUUID() } };
    }

    return this.makeRequest<CalendarEvent>(
      `${API_ENDPOINTS.calendar}/calendars/primary/events?conferenceDataVersion=${event.conferenceDataVersion || 0}`,
      { method: 'POST', body: JSON.stringify(body) }
    );
  }

  async updateEvent(
    eventId: string,
    event: Partial<{
      summary: string;
      description: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
      location: string;
    }>
  ): Promise<GoogleResponse<CalendarEvent>> {
    return this.makeRequest<CalendarEvent>(
      `${API_ENDPOINTS.calendar}/calendars/primary/events/${eventId}`,
      { method: 'PATCH', body: JSON.stringify(event) }
    );
  }

  async deleteEvent(eventId: string): Promise<GoogleResponse<void>> {
    return this.makeRequest<void>(
      `${API_ENDPOINTS.calendar}/calendars/primary/events/${eventId}`,
      { method: 'DELETE' }
    );
  }

  async getFiles(
    options: { pageToken?: string; pageSize?: number; q?: string; folderId?: string } = {}
  ): Promise<GoogleResponse<{ files: DriveFile[]; nextPageToken?: string }>> {
    const params = new URLSearchParams();
    if (options.pageToken) params.append('pageToken', options.pageToken);
    if (options.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options.q) params.append('q', options.q);
    params.append('fields', 'files(id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime,parents,thumbnailLink,iconLink),nextPageToken');

    let url = `${API_ENDPOINTS.drive}/files?${params.toString()}`;
    if (options.folderId) {
      url = `${API_ENDPOINTS.drive}/files/${options.folderId}/children?${params.toString()}`;
    }

    const result = await this.makeRequest<{ files: DriveFile[]; nextPageToken?: string }>(url);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          files: result.data.files.map(f => ({
            ...f,
            isFolder: f.mimeType === 'application/vnd.google-apps.folder'
          })),
          nextPageToken: result.data.nextPageToken
        }
      };
    }

    return result as GoogleResponse<{ files: DriveFile[]; nextPageToken?: string }>;
  }

  async getFile(fileId: string): Promise<GoogleResponse<DriveFile>> {
    const params = new URLSearchParams();
    params.append('fields', 'id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime,parents,thumbnailLink,iconLink');

    return this.makeRequest<DriveFile>(
      `${API_ENDPOINTS.drive}/files/${fileId}?${params.toString()}`
    );
  }

  async createFolder(name: string, parentId?: string): Promise<GoogleResponse<DriveFile>> {
    const body: { name: string; mimeType: string; parents?: string[] } = {
      name,
      mimeType: 'application/vnd.google-apps.folder'
    };
    if (parentId) body.parents = [parentId];

    return this.makeRequest<DriveFile>(`${API_ENDPOINTS.drive}/files`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async uploadFile(
    fileName: string,
    content: Blob | ArrayBuffer,
    mimeType: string = 'application/octet-stream',
    parentId?: string
  ): Promise<GoogleResponse<DriveFile>> {
    if (!this.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const metadata = {
      name: fileName,
      mimeType,
      ...(parentId && { parents: [parentId] })
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: mimeType }));

    try {
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,createdTime,modifiedTime`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
          body: form
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error?.message || 'Upload failed' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Upload failed' };
    }
  }

  async downloadFile(fileId: string): Promise<GoogleResponse<Blob>> {
    if (!this.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }
      );

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Download failed' };
    }
  }

  async deleteFile(fileId: string): Promise<GoogleResponse<void>> {
    return this.makeRequest<void>(
      `${API_ENDPOINTS.drive}/files/${fileId}`,
      { method: 'DELETE' }
    );
  }

  async shareFile(fileId: string, email: string, role: 'reader' | 'writer' = 'reader'): Promise<GoogleResponse<void>> {
    return this.makeRequest<void>(
      `${API_ENDPOINTS.drive}/files/${fileId}/permissions`,
      {
        method: 'POST',
        body: JSON.stringify({
          type: 'user',
          role,
          emailAddress: email
        })
      }
    );
  }

  getConfig(): GoogleConfig | null {
    if (!this.config) return null;
    return {
      clientId: this.config.clientId,
      apiKey: this.config.apiKey,
      redirectUri: this.config.redirectUri,
      scopes: this.config.scopes.split(' ')
    };
  }

  async syncDocumentos(
    localFiles: { name: string; lastModified: number; content: Blob | ArrayBuffer; mimeType?: string }[],
    options: { folderId?: string; onUpload?: (name: string) => void; onDownload?: (name: string, url: string) => void } = {}
  ): Promise<GoogleResponse<{ uploaded: number; downloaded: number; conflicts: string[] }>> {
    const conflicts: string[] = [];
    let uploaded = 0;
    let downloaded = 0;

    const remoteResult = await this.getFiles({ folderId: options.folderId });
    if (!remoteResult.success || !remoteResult.data) {
      return { success: false, error: remoteResult.error || 'Failed to fetch remote files' };
    }

    const remoteFilesMap = new Map(remoteResult.data.files.map(f => [f.name.toLowerCase(), f]));
    const localFilesMap = new Map(localFiles.map(f => [f.name.toLowerCase(), f]));

    for (const [name, localFile] of localFilesMap) {
      const remoteFile = remoteFilesMap.get(name);

      if (!remoteFile) {
        const uploadResult = await this.uploadFile(
          localFile.name,
          localFile.content,
          localFile.mimeType || 'application/octet-stream',
          options.folderId
        );
        if (uploadResult.success) {
          uploaded++;
          options.onUpload?.(localFile.name);
        }
      } else if (new Date(remoteFile.modifiedTime).getTime() > localFile.lastModified) {
        conflicts.push(localFile.name);
      }
    }

    for (const [name, remoteFile] of remoteFilesMap) {
      if (!localFilesMap.has(name) && !remoteFile.isFolder) {
        if (options.onDownload) {
          options.onDownload(remoteFile.name, remoteFile.webViewLink);
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

export const googleService = new GoogleService();

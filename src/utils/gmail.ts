import { BackupData, GmailAccountInfo, GmailBackupMetadata } from '../types';

declare global {
  interface Window {
    google?: any;
  }
}

// Scopes required for Gmail integration
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email';

const GMAIL_AUTH_KEY = 'daily_diary_gmail_token';
const GMAIL_USER_KEY = 'daily_diary_gmail_user';

export class GmailSyncService {
  private static tokenClient: any = null;

  /**
   * Initializes or gets the Google Token Client
   */
  public static getStoredToken(): string | null {
    const raw = localStorage.getItem(GMAIL_AUTH_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.expires_at && Date.now() > parsed.expires_at) {
        localStorage.removeItem(GMAIL_AUTH_KEY);
        return null;
      }
      return parsed.access_token;
    } catch {
      return null;
    }
  }

  public static getStoredUser(): GmailAccountInfo | null {
    const raw = localStorage.getItem(GMAIL_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static disconnect() {
    localStorage.removeItem(GMAIL_AUTH_KEY);
    localStorage.removeItem(GMAIL_USER_KEY);
  }

  /**
   * Triggers client-side Google OAuth popup
   */
  public static async requestGoogleToken(): Promise<{ token: string; user: GmailAccountInfo }> {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services library is still loading. Please try again in a moment.'));
        return;
      }

      // Check if client_id is available from import.meta.env or default
      const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '';

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GMAIL_SCOPES,
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          const accessToken = tokenResponse.access_token;
          const expiresIn = (tokenResponse.expires_in || 3600) * 1000;
          const expiresAt = Date.now() + expiresIn;

          localStorage.setItem(
            GMAIL_AUTH_KEY,
            JSON.stringify({ access_token: accessToken, expires_at: expiresAt })
          );

          try {
            // Fetch user email details
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userData = await userRes.json();

            const accountInfo: GmailAccountInfo = {
              email: userData.email || 'Connected Account',
              name: userData.name || userData.email,
              picture: userData.picture,
              connected_at: new Date().toISOString(),
            };

            localStorage.setItem(GMAIL_USER_KEY, JSON.stringify(accountInfo));
            resolve({ token: accessToken, user: accountInfo });
          } catch (err) {
            const fallbackInfo: GmailAccountInfo = {
              email: 'Google Account',
              connected_at: new Date().toISOString(),
            };
            localStorage.setItem(GMAIL_USER_KEY, JSON.stringify(fallbackInfo));
            resolve({ token: accessToken, user: fallbackInfo });
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  /**
   * Backup diary & expense data to Gmail via Draft/Sent email message
   */
  public static async backupToGmail(
    backupData: BackupData,
    userEmail?: string
  ): Promise<{ success: boolean; messageId: string }> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('Gmail is not connected. Please connect your Gmail account first.');
    }

    const recipient = userEmail || this.getStoredUser()?.email || 'me';
    const timestamp = new Date().toLocaleString();
    const subject = `[Daily Diary Backup] - ${new Date().toLocaleDateString()} (${backupData.entries.length} Entries, ${backupData.expenses?.length || 0} Expenses)`;

    const jsonString = JSON.stringify(backupData, null, 2);
    const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

    const summaryText = `Daily Diary & Expense Manager Cloud Backup
----------------------------------------------------
Backup Date: ${timestamp}
Journal Entries: ${backupData.entries.length}
Expense Records: ${backupData.expenses?.length || 0}
Advance Sections: ${backupData.advance_sections?.length || 0}
Version: ${backupData.version}

This automated backup contains your complete private diary entries, expenses, advances, and settings.
To restore this data, open the Daily Diary app -> Settings / Gmail Sync -> Click Restore from Gmail.

----------------------------------------------------
=== RAW BACKUP PAYLOAD START ===
${jsonString}
=== RAW BACKUP PAYLOAD END ===
`;

    // Construct MIME email message
    const boundary = '----=_Part_' + Math.random().toString(36).substring(2);
    const emailLines = [
      `To: ${recipient}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      summaryText,
      ``,
      `--${boundary}`,
      `Content-Type: application/json; name="daily_diary_backup_${Date.now()}.json"`,
      `Content-Disposition: attachment; filename="daily_diary_backup_${Date.now()}.json"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      base64Data,
      ``,
      `--${boundary}--`,
    ];

    const rawMessage = emailLines.join('\r\n');
    const encodedRaw = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send using Gmail REST API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedRaw }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to send backup to Gmail (${response.status})`);
    }

    const resData = await response.json();

    // Update last backup timestamp
    const user = this.getStoredUser();
    if (user) {
      user.last_backup_at = new Date().toISOString();
      localStorage.setItem(GMAIL_USER_KEY, JSON.stringify(user));
    }

    return { success: true, messageId: resData.id };
  }

  /**
   * Fetch available backups from Gmail
   */
  public static async listGmailBackups(): Promise<GmailBackupMetadata[]> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('Gmail is not connected.');
    }

    const q = encodeURIComponent('subject:"[Daily Diary Backup]"');
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=15`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!listRes.ok) {
      throw new Error('Failed to retrieve backup emails from Gmail.');
    }

    const listData = await listRes.json();
    if (!listData.messages || listData.messages.length === 0) {
      return [];
    }

    const results: GmailBackupMetadata[] = [];

    for (const msg of listData.messages.slice(0, 8)) {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (msgRes.ok) {
          const detail = await msgRes.json();
          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'Backup';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

          // Extract counts from subject or snippet
          const entriesMatch = subject.match(/(\d+)\s*Entries/i);
          const expensesMatch = subject.match(/(\d+)\s*Expenses/i);

          results.push({
            id: msg.id,
            subject,
            date: date ? new Date(date).toLocaleString() : 'Recent',
            entries_count: entriesMatch ? parseInt(entriesMatch[1], 10) : 0,
            expenses_count: expensesMatch ? parseInt(expensesMatch[1], 10) : 0,
            advances_count: 0,
          });
        }
      } catch (e) {
        console.warn('Failed to parse backup message:', e);
      }
    }

    return results;
  }

  /**
   * Restore a backup from a specific Gmail message ID
   */
  public static async restoreFromGmailMessage(messageId: string): Promise<BackupData> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('Gmail is not connected.');
    }

    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!msgRes.ok) {
      throw new Error('Failed to fetch backup message payload from Gmail.');
    }

    const msgData = await msgRes.json();
    let jsonString = '';

    // Search attachment parts first
    const parts = msgData.payload?.parts || [];
    for (const part of parts) {
      if (part.filename?.endsWith('.json') && part.body?.attachmentId) {
        const attRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${part.body.attachmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (attRes.ok) {
          const attData = await attRes.json();
          const base64 = attData.data.replace(/-/g, '+').replace(/_/g, '/');
          jsonString = decodeURIComponent(escape(atob(base64)));
          break;
        }
      } else if (part.filename?.endsWith('.json') && part.body?.data) {
        const base64 = part.body.data.replace(/-/g, '+').replace(/_/g, '/');
        jsonString = decodeURIComponent(escape(atob(base64)));
        break;
      }
    }

    // If attachment was not extracted, search in body text
    if (!jsonString) {
      let bodyText = '';
      if (msgData.snippet) {
        bodyText = msgData.snippet;
      }
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          const base64 = part.body.data.replace(/-/g, '+').replace(/_/g, '/');
          bodyText = decodeURIComponent(escape(atob(base64)));
          break;
        }
      }

      const match = bodyText.match(/=== RAW BACKUP PAYLOAD START ===\s*([\s\S]*?)\s*=== RAW BACKUP PAYLOAD END ===/);
      if (match && match[1]) {
        jsonString = match[1];
      }
    }

    if (!jsonString) {
      throw new Error('Could not find backup data inside selected Gmail message.');
    }

    const parsed = JSON.parse(jsonString);
    return parsed;
  }
}

import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Drive OAuth2 credentials not set in .env');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground' // This redirect URI is only for the initial token exchange, but required in the constructor
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function uploadToDrive(buffer: Buffer, filename: string, mimeType: string) {
  const drive = await getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: folderId ? [folderId] : undefined,
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id, webViewLink, webContentLink',
  });

  // Since we are using OAuth2 with the user's own account, the files are owned by the user.
  // We can still try to set public permissions if desired, but they might already be inherited from the folder.
  try {
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  } catch (error) {
    console.warn('Could not set public permissions for file (this is usually okay if folder is shared):', error);
  }

  return response.data;
}

export async function deleteFromDrive(fileId: string) {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId });
}

export function getDrivePublicUrl(fileId: string) {
  // Point to our local proxy to avoid Drive direct access issues
  return `/api/media/drive/${fileId}`;
}

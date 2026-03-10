import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get file metadata to get the mimeType
    const metadata = await drive.files.get({
      fileId,
      fields: 'mimeType, name'
    });

    // Get the file content
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const headers = new Headers();
    headers.set('Content-Type', metadata.data.mimeType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Convert ReadableStream to a format Next.js can return
    // Simple way for streaming in App Router
    return new NextResponse(response.data as any, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error proxying Drive file:', error);
    return new NextResponse('Error loading media', { status: 500 });
  }
}

import { put } from '@vercel/blob';

const MAX_FILES = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const config = {
  runtime: 'nodejs',
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
      const formData = await request.formData();
      const files = formData.getAll('files').filter(Boolean) as File[];

      if (!files.length) {
        return Response.json({ error: 'No files uploaded' }, { status: 400 });
      }

      if (files.length > MAX_FILES) {
        return Response.json(
          { error: `Maximum ${MAX_FILES} images allowed` },
          { status: 400 }
        );
      }

      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (!(file instanceof File)) {
          return Response.json({ error: 'Invalid file upload' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(file.type)) {
          return Response.json(
            { error: `Unsupported file type: ${file.type}` },
            { status: 400 }
          );
        }

        if (file.size > MAX_FILE_SIZE) {
          return Response.json(
            { error: `File too large: ${file.name}` },
            { status: 400 }
          );
        }

        const safeName = file.name.replace(/\s+/g, '-');
        const pathname = `reviews/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

        const blob = await put(pathname, file, {
          access: 'public',
          contentType: file.type,
          addRandomSuffix: false,
        });

        uploadedUrls.push(blob.url);
      }

      return Response.json({ urls: uploadedUrls });
    } catch (error: any) {
      console.error('review image upload error:', error);
      return Response.json(
        { error: error?.message || 'Failed to upload review images' },
        { status: 500 }
      );
    }
  },
};
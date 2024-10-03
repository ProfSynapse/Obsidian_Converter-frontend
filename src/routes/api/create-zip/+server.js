import { json } from '@sveltejs/kit';
import { Readable } from 'stream';
import * as JSZip from 'jszip';

export async function POST({ request }) {
  const conversionResults = await request.json();
  
  const zip = new JSZip();

  conversionResults.forEach(result => {
    if (!result.error) {
      const safeName = result.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      zip.file(`${safeName}.txt`, result.content);
    }
  });

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  return new Response(Readable.from(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=converted_files.zip',
    },
  });
}
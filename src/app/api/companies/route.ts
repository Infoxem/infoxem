import { catalogueVersion, getCatalogue } from '@/lib/company-repository';

export async function GET(request: Request) {
  try {
    const version = await catalogueVersion();
    const headers = { ETag: version, 'Cache-Control': 'no-store' };
    if (request.headers.get('if-none-match') === version)
      return new Response(null, { status: 304, headers });
    return Response.json(await getCatalogue(), { headers });
  } catch {
    return Response.json(
      { error: 'Company data is temporarily unavailable. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

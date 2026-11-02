import { catalogueVersion, getCompanyById } from '@/lib/company-repository';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const version = await catalogueVersion(id);
    const headers = { ETag: version, 'Cache-Control': 'no-store' };
    if (request.headers.get('if-none-match') === version)
      return new Response(null, { status: 304, headers });
    const company = await getCompanyById(id);
    return company
      ? Response.json(company, { headers })
      : Response.json({ error: 'Company not found' }, { status: 404, headers });
  } catch {
    return Response.json(
      { error: 'Company data is temporarily unavailable. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

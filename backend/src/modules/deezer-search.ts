export default async function (request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  if (!query) {
    return new Response(JSON.stringify({ error: 'Song query is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deezerRes = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(query)}`,
  );

  const data = await deezerRes.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export default async function handler(request, response) {
  // 1. Make sure this is a POST request
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  // 2. Get the user's prompt from the request body
  const { prompt } = request.body;

  if (!prompt) {
    return response.status(400).json({ message: 'Prompt is required' });
  }
  
  // 3. Get the secret API key from Vercel's environment variables
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ message: 'API key not configured' });
  }

  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  // 4. Call the Google API securely from the server
  try {
    const fetchResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!fetchResponse.ok) {
      const error = await fetchResponse.json();
      console.error('Google API Error:', error);
      return response.status(fetchResponse.status).json({ message: 'Failed to fetch from Google API' });
    }

    const data = await fetchResponse.json();
    
    // 5. Send the result back to your website
    return response.status(200).json(data);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'An internal error occurred' });
  }
}
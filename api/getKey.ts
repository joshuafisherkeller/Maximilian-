// This is a Vercel serverless function.
// It securely accesses the API_KEY from the environment variables on the server
// and provides it to the frontend application upon request.

export default function handler(req, res) {
  const apiKey = process.env.API_KEY;
  if (apiKey) {
    res.status(200).json({ apiKey: apiKey });
  } else {
    // This error will be visible in the Vercel logs if the API_KEY is not set.
    res.status(500).json({ error: 'API key not found on server. Please set the API_KEY environment variable in Vercel project settings.' });
  }
}

// frontend/components/services/geminiService.js

// Function to call the Gemini API
export async function callGeminiAPI(prompt, generationConfig = {}) {
  let chatHistory = [];
  chatHistory.push({ role: "user", parts: [{ text: prompt }] });
  const payload = {
    contents: chatHistory,
    generationConfig: {
      temperature: 0.7, // Default temperature, can be overridden
      topP: 0.95,
      topK: 40,
      ...generationConfig
    }
  };

  // For embedding on a website, ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file.
  // In the Canvas environment, an empty string allows the key to be automatically provided.
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // Implement exponential backoff for API calls
  const MAX_RETRIES = 5;
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Check for rate limit or other server errors
        if (response.status === 429 && retries < MAX_RETRIES - 1) {
          const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
          console.warn(`Rate limit hit, retrying in ${delay / 1000}s...`);
          await new Promise(res => setTimeout(res, delay));
          retries++;
          continue; // Try again
        }
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected Gemini API response structure:', result);
        throw new Error('Gemini API returned an unexpected response structure.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (retries < MAX_RETRIES - 1) {
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        console.warn(`Request failed, retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        retries++;
      } else {
        throw error; // Re-throw if max retries reached
      }
    }
  }
  throw new Error('Max retries reached for Gemini API call.');
}

// Function to call the Gemini API specifically for mock interview feedback
export async function callGeminiMockInterviewAPI(chatHistory) {
  const payload = {
    contents: chatHistory,
    generationConfig: {
      temperature: 0.8, // Slightly higher temperature for more creative feedback
      topP: 0.95,
      topK: 40
    }
  };

  // For embedding on a website, ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file.
  // In the Canvas environment, an empty string allows the key to be automatically provided.
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const MAX_RETRIES = 5;
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429 && retries < MAX_RETRIES - 1) {
          const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
          console.warn(`Rate limit hit in mock interview, retrying in ${delay / 1000}s...`);
          await new Promise(res => setTimeout(res, delay));
          retries++;
          continue;
        }
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected Gemini API response structure:', result);
        throw new Error('Gemini API returned an unexpected response structure.');
      }
    } catch (error) {
      console.error('Error calling Gemini API for mock interview:', error);
      if (retries < MAX_RETRIES - 1) {
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        console.warn(`Request failed in mock interview, retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        retries++;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached for Gemini API mock interview call.');
}

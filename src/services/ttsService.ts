import axios from 'axios';

export const generateSpeech = async (text: string, language: string = 'en') => {
  try {
    // Calling our server-side proxy to handle API authentication and bypass CORS
    const response = await axios.post(
      `/api/tts`,
      {
        text,
        model: 'gpt-4o-mini-tts', // Explicitly using the verified model ID
        voice: 'alloy'
      },
      {
        responseType: 'blob',
      }
    );

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Speech generation failed through proxy:', error);
    return null;
  }
};

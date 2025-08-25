// frontend/pages/practice.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdBanner from '../components/AdBanner';
import { callGeminiMockInterviewAPI } from '../components/services/geminiService';

export default function Practice() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [analysisData, setAnalysisData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Stores the full conversation with Gemini
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided. Please go back to the results page.');
      setLoading(false);
      return;
    }

    const savedSession = sessionStorage.getItem(`session-${sessionId}`);
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        setAnalysisData(data);
        // Initialize chat history with any previous mock interview history
        setChatHistory(data.mockInterviewHistory || []);
      } catch (e) {
        setError('Failed to load session data. It might be corrupted.');
        console.error('Error parsing session data:', e);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Session data not found. Please analyze a job description first.');
      setLoading(false);
    }
  }, [sessionId]);

  // Scroll to the bottom of the chat history
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, feedback]); // Scroll when chat history or feedback updates

  const currentQuestion = analysisData?.interviewQnA[currentQuestionIndex];

  const handleAnswerSubmit = async (event) => {
    event.preventDefault();
    if (!userAnswer.trim() || !currentQuestion) {
      return;
    }

    setGeneratingFeedback(true);
    setFeedback(''); // Clear previous feedback

    try {
      // Build the prompt for Gemini to give feedback
      const prompt = `
        You are an expert interviewer providing feedback to a candidate.
        The candidate is interviewing for a "${analysisData.jobTitle}" role based on the following job description:
        ---
        ${analysisData.jobDescription}
        ---

        Here's the question asked: "${currentQuestion.question}"
        Here's the candidate's answer: "${userAnswer}"

        Provide constructive feedback on the candidate's answer.
        Focus on clarity, completeness, relevance to the job description, and use of the STAR method if applicable.
        Suggest specific areas for improvement. Keep the feedback concise and actionable.
      `;

      // Update chat history with user's current answer
      const updatedChatHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: `Question: ${currentQuestion.question}\nMy Answer: ${userAnswer}` }] }
      ];

      // Call Gemini for feedback
      const geminiFeedback = await callGeminiMockInterviewAPI(updatedChatHistory);

      // Add Gemini's response to chat history
      updatedChatHistory.push({ role: "model", parts: [{ text: geminiFeedback }] });

      setFeedback(geminiFeedback);
      setChatHistory(updatedChatHistory);
      setUserAnswer('');

      // Update sessionStorage with the latest chat history
      const updatedAnalysisData = { ...analysisData, mockInterviewHistory: updatedChatHistory };
      sessionStorage.setItem(`session-${sessionId}`, JSON.stringify(updatedAnalysisData));

    } catch (err) {
      setError(err.message || 'Failed to get feedback from Gemini. Please try again.');
      console.error('Mock interview feedback error:', err);
    } finally {
      setGeneratingFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < analysisData.interviewQnA.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setFeedback(''); // Clear feedback for the new question
    } else {
      // End of interview, optionally show a summary or final message
      setFeedback("You've completed all the mock interview questions! Great job. You can review your answers and feedback above, or go back to practice again.");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      setFeedback(''); // Clear feedback for the new question
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-inter">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl text-indigo-700">Loading mock interview setup...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-inter">
        <div className="bg-white shadow-xl rounded-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData || !currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-inter">
        <div className="bg-white shadow-xl rounded-xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h2>
          <p className="text-gray-700 mb-6">
            It looks like there are no interview questions generated. Please go back to the home page and analyze a job description.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 font-inter text-gray-800 p-4 sm:p-6 lg:p-8">
      <Head>
        <title>Mock Interview Practice for {analysisData.jobTitle}</title>
        <meta name="description" content={`Practice mock interviews for a ${analysisData.jobTitle} role with AI feedback.`} />
      </Head>

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-700 mb-6 text-center leading-tight">
          Mock Interview for <span className="text-pink-600">{analysisData.jobTitle}</span>
        </h1>

        <div className="mb-6">
          <AdBanner slot="728x90" /> {/* Top Banner Ad */}
        </div>

        <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            Question {currentQuestionIndex + 1} of {analysisData.interviewQnA.length} ({currentQuestion.type}):
          </h2>
          <p className="text-2xl text-blue-700 font-semibold">{currentQuestion.question}</p>
        </div>

        <div ref={chatContainerRef} className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6 max-h-80 overflow-y-auto border border-gray-200">
          {chatHistory.length === 0 && (
            <p className="text-gray-500 italic text-center">Your conversation with the AI interviewer will appear here.</p>
          )}
          {chatHistory.map((message, idx) => (
            <div key={idx} className={`mb-3 p-3 rounded-lg ${message.role === 'user' ? 'bg-indigo-100 text-indigo-900 self-end ml-auto' : 'bg-green-100 text-green-900 self-start mr-auto'}`}>
              <strong className="capitalize">{message.role}:</strong> {message.parts[0].text}
            </div>
          ))}
          {generatingFeedback && (
            <div className="flex items-center justify-center p-3 text-gray-600">
              <svg className="animate-spin h-5 w-5 mr-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating feedback...
            </div>
          )}
        </div>

        <form onSubmit={handleAnswerSubmit} className="flex flex-col space-y-4 mb-6">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 shadow-sm"
            rows="6"
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            required
            aria-label="Your Answer"
            disabled={generatingFeedback}
          ></textarea>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={generatingFeedback || !userAnswer.trim()}
          >
            {generatingFeedback ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Feedback...
              </>
            ) : (
              'Submit Answer & Get Feedback'
            )}
          </button>
        </form>

        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || generatingFeedback}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={generatingFeedback}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex < analysisData.interviewQnA.length - 1 ? 'Next Question' : 'Finish Interview'}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}

        <div className="mt-8">
          <AdBanner slot="300x250" /> {/* Inline Ad */}
        </div>
      </div>
    </div>
  );
}

// frontend/pages/results.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdBanner from '../components/AdBanner';
import AffiliateBox from '../components/AffiliateBox';
import QuestionCard from '../components/QuestionCard';
import SEOSection from '../components/SEOSection';
import { generatePdfReport } from '../components/utils/pdfExport'; // Client-side PDF export

export default function Results() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided. Please go back and analyze a job description.');
      setLoading(false);
      return;
    }

    const savedSession = sessionStorage.getItem(`session-${sessionId}`);
    if (savedSession) {
      try {
        setAnalysisData(JSON.parse(savedSession));
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

  const handleExportReport = () => {
    if (analysisData) {
      generatePdfReport(analysisData);
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
          <p className="text-xl text-indigo-700">Loading analysis results...</p>
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

  if (!analysisData) {
    return null; // Should not happen if error handled, but as a safeguard
  }

  const {
    jobTitle,
    requiredSkills,
    keyTools,
    seoSummary,
    interviewQnA,
    skillGap,
    affiliateSuggestions,
    seo
  } = analysisData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 p-4 sm:p-6 lg:p-8">
      <Head>
        <title>{seo?.metaTitle || `Analysis Results for ${jobTitle}`}</title>
        <meta name="description" content={seo?.metaDescription || "Comprehensive interview preparation analysis."} />
        {seo?.faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.faqSchema) }}
          />
        )}
      </Head>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <main className="lg:col-span-2 bg-white shadow-xl rounded-xl p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 mb-6 leading-tight">
            Interview Analysis for <span className="text-blue-600">{jobTitle}</span>
          </h1>

          <div className="mb-8">
            <AdBanner slot="728x90" /> {/* Top Banner Ad */}
          </div>

          <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">📄 Job Description Insights</h2>
            <p className="text-lg mb-2">
              <span className="font-semibold">Required Skills:</span> {requiredSkills.join(', ')}
            </p>
            <p className="text-lg mb-4">
              <span className="font-semibold">Key Tools:</span> {keyTools.join(', ')}
            </p>
            <p className="text-md text-gray-700">
              <span className="font-semibold">Summary:</span> {seoSummary}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-6">❓ SEO Interview Questions & Answers</h2>
            <div className="space-y-6">
              {interviewQnA.map((qa, index) => (
                <QuestionCard key={index} question={qa.question} type={qa.type} answer={qa.answer} />
              ))}
            </div>
          </section>

          <div className="mb-8">
            <AdBanner slot="300x250" /> {/* Inline Ad */}
          </div>

          <section className="mb-8 p-6 bg-yellow-50 rounded-lg shadow-sm border border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">⚠️ Skill Gap Analysis</h2>
            {skillGap && skillGap.length > 0 ? (
              <>
                <p className="text-lg mb-2">
                  Based on the job description (and your resume if provided), you might consider strengthening these areas:
                </p>
                <ul className="list-disc list-inside text-lg mb-4 space-y-1">
                  {skillGap.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-lg mb-4">
                No obvious skill gaps identified based on the provided information. Great job!
              </p>
            )}

            {affiliateSuggestions && affiliateSuggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-yellow-800 mb-3">Recommended Resources:</h3>
                <ul className="list-disc list-inside text-md space-y-2">
                  {affiliateSuggestions.map((suggestion, index) => (
                    <li key={index}>
                      <span className="font-medium">{suggestion.resourceTitle}</span> for{' '}
                      <span className="italic">{suggestion.skill}</span> →{' '}
                      <a href={suggestion.affiliateLinkPlaceholder} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Learn More
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="flex justify-center mt-8 space-x-4">
            <button
              onClick={() => router.push(`/practice?sessionId=${sessionId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v14zm0 0V6m0 0l-3 1m3-1l3 1m3-1l-3 1m3-1v10m-3 0v4m-6-4v4m-6-4v4" />
              </svg>
              Start Mock Interview
            </button>
            <button
              onClick={handleExportReport}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report (PDF)
            </button>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <AffiliateBox />
          <AdBanner slot="160x600" /> {/* Sidebar Ad */}
          <SEOSection jobTitle={jobTitle} metaTitle={seo?.metaTitle} metaDescription={seo?.metaDescription} />
        </aside>
      </div>
    </div>
  );
}

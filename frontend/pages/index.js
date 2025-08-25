// frontend/pages/index.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid'; // For generating unique session IDs
import { callGeminiAPI } from '../components/services/geminiService';
import { generateMeta, generateFAQSchema } from '../components/utils/seo';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (event) => {
    setResumeFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    let resumeText = '';
    if (resumeFile) {
      try {
        // Read file content as text
        const reader = new FileReader();
        reader.readAsText(resumeFile);
        await new Promise((resolve) => {
          reader.onload = (e) => {
            resumeText = e.target.result;
            resolve();
          };
          reader.onerror = (e) => {
            console.error("Error reading resume file:", e);
            setError("Failed to read resume file. Please try again.");
            resolve(); // Still resolve to proceed without resume
          };
        });
      } catch (err) {
        console.error("Error processing resume file:", err);
        setError("Failed to process resume file. Please try again.");
        setLoading(false);
        return;
      }
    }

    try {
      const sessionId = uuidv4(); // Generate a unique session ID

      // --- 1. JD Parsing ---
      const parsingPrompt = `
        Analyze the following job description and extract the key information.
        Provide the output in a JSON format with the following keys:
        - jobTitle: (string)
        - requiredSkills: (array of strings)
        - keyTools: (array of strings)
        - seoSummary: (string, a concise SEO-optimized summary for the role)

        Job Description:
        ${jobDescription}
      `;
      const parsingResult = await callGeminiAPI(parsingPrompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            jobTitle: { type: "STRING" },
            requiredSkills: { type: "ARRAY", items: { type: "STRING" } },
            keyTools: { type: "ARRAY", items: { type: "STRING" } },
            seoSummary: { type: "STRING" }
          },
          required: ["jobTitle", "requiredSkills", "keyTools", "seoSummary"]
        }
      });
      const parsedData = JSON.parse(parsingResult);
      const { jobTitle, requiredSkills, keyTools, seoSummary } = parsedData;

      // --- 2. SEO Interview Questions + Answers ---
      const qaPrompt = `
        Generate 10 SEO-rich interview questions (technical, behavioral, situational) for a "${jobTitle}" role,
        focusing on skills like ${requiredSkills.join(', ')} and tools like ${keyTools.join(', ')}.
        For each question, provide a STAR-based sample answer that is optimized with relevant keywords.
        The output should be a JSON array of objects, where each object has:
        - question: (string)
        - type: (string, e.g., "Technical", "Behavioral", "Situational")
        - answer: (string, STAR-based, SEO-optimized)

        Ensure answers are detailed and ready for an interview.
      `;
      const qaResult = await callGeminiAPI(qaPrompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              type: { type: "STRING" },
              answer: { type: "STRING" }
            },
            required: ["question", "type", "answer"]
          }
        }
      });
      const interviewQnA = JSON.parse(qaResult);

      // --- 3. Skill Gap Analysis ---
      let skillGap = [];
      let affiliateSuggestions = [];

      if (resumeText) {
        const skillGapPrompt = `
          Given the following job description and candidate resume, identify skill gaps.
          Suggest SEO-rich resources with affiliate link placeholders for missing skills.
          The output should be a JSON object with:
          - missingSkills: (array of strings)
          - affiliateSuggestions: (array of objects with 'skill', 'resourceTitle', 'affiliateLinkPlaceholder')

          Job Description:
          ${jobDescription}

          Candidate Resume:
          ${resumeText}
        `;
        const skillGapResult = await callGeminiAPI(skillGapPrompt, {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              missingSkills: { type: "ARRAY", items: { type: "STRING" } },
              affiliateSuggestions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    skill: { type: "STRING" },
                    resourceTitle: { type: "STRING" },
                    affiliateLinkPlaceholder: { type: "STRING" }
                  }
                }
              }
            },
            required: ["missingSkills", "affiliateSuggestions"]
          }
        });
        const parsedSkillGap = JSON.parse(skillGapResult);
        skillGap = parsedSkillGap.missingSkills;
        affiliateSuggestions = parsedSkillGap.affiliateSuggestions;

      } else {
        // If no resume, suggest common gaps for the role or recommend general resources
        const generalSkillGapPrompt = `
          For a "${jobTitle}" role, what are common skill gaps candidates might have related to ${requiredSkills.join(', ')}?
          Suggest 3-5 SEO-rich resources with affiliate link placeholders (e.g., "Best Python Certification on [Affiliate_Link]").
          The output should be a JSON object with:
          - missingSkills: (array of strings)
          - affiliateSuggestions: (array of objects with 'skill', 'resourceTitle', 'affiliateLinkPlaceholder')
        `;
        const generalSkillGapResult = await callGeminiAPI(generalSkillGapPrompt, {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              missingSkills: { type: "ARRAY", items: { type: "STRING" } },
              affiliateSuggestions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    skill: { type: "STRING" },
                    resourceTitle: { type: "STRING" },
                    affiliateLinkPlaceholder: { type: "STRING" }
                  }
                }
              }
            },
            required: ["missingSkills", "affiliateSuggestions"]
          }
        });
        const parsedGeneralSkillGap = JSON.parse(generalSkillGapResult);
        skillGap = parsedGeneralSkillGap.missingSkills;
        affiliateSuggestions = parsedGeneralSkillGap.affiliateSuggestions;
      }

      // --- 4. SEO Meta Generation ---
      const metaTitle = generateMeta('title', jobTitle, requiredSkills);
      const metaDescription = generateMeta('description', jobTitle, requiredSkills);
      const faqSchema = generateFAQSchema(jobTitle, interviewQnA);

      const analysisResults = {
        jobDescription, // Store original JD for mock interview context
        jobTitle,
        requiredSkills,
        keyTools,
        seoSummary,
        interviewQnA,
        skillGap,
        affiliateSuggestions,
        seo: {
          metaTitle,
          metaDescription,
          faqSchema,
        },
        mockInterviewHistory: [] // Initialize empty mock interview history
      };

      // Store analysis results in sessionStorage
      sessionStorage.setItem(`session-${sessionId}`, JSON.stringify(analysisResults));

      router.push({
        pathname: '/results',
        query: { sessionId: sessionId }, // Pass session ID to results page
      });

    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <Head>
        <title>Interview Question Analyzer from Job Descriptions</title>
        <meta name="description" content="Analyze job descriptions, generate interview questions, and identify skill gaps for your next job interview." />
      </Head>

      <main className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-700 mb-6 leading-tight">
          Interview <span className="text-blue-600">Pro</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
          Paste your job description and optionally upload your resume to get instant interview questions, skill gap analysis, and mock interview practice.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 shadow-sm"
            rows="10"
            placeholder="Paste your Job Description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            aria-label="Job Description"
          ></textarea>

          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            <label htmlFor="resume-upload" className="w-full sm:w-auto cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Upload Resume (Optional)
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".txt,.pdf,.doc,.docx" // Accept common text and document formats
              onChange={handleFileChange}
              className="hidden"
              aria-label="Resume upload"
            />
            {resumeFile && <span className="text-gray-600 text-sm">File: {resumeFile.name}</span>}
          </div>

          <button
            type="submit"
            className="w-full sm:w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading || !jobDescription}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Job Description'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}
      </main>

      {/* Footer or additional branding */}
      <footer className="mt-8 text-gray-600 text-sm">
        © {new Date().getFullYear()} Interview Pro. All rights reserved.
      </footer>
    </div>
  );
}

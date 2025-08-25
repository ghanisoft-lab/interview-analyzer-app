// frontend/components/SEOSection.js
import React from 'react';

/**
 * Displays a summary of SEO meta-information for the current analysis.
 * @param {object} props - Component props.
 * @param {string} props.jobTitle - The job title.
 * @param {string} props.metaTitle - The generated meta title.
 * @param {string} props.metaDescription - The generated meta description.
 * @returns {JSX.Element} The SEOSection component.
 */
const SEOSection = ({ jobTitle, metaTitle, metaDescription }) => {
  return (
    <div className="bg-white shadow-xl rounded-xl p-6 border border-purple-200">
      <h3 className="text-xl font-bold text-purple-700 mb-4">📈 SEO Insights for Your Prep</h3>
      <div className="space-y-4">
        <div>
          <p className="text-lg font-semibold text-gray-800">Meta Title:</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded break-words">
            {metaTitle || `Interview Questions for ${jobTitle}`}
          </p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Meta Description:</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded break-words">
            {metaDescription || `Prepare for your ${jobTitle} interview with expert questions and answers.`}
          </p>
        </div>
        <p className="text-sm text-gray-600 italic">
          These elements are crucial for search engines to understand and rank your interview preparation content.
        </p>
      </div>
    </div>
  );
};

export default SEOSection;

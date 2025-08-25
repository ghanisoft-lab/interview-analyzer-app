// frontend/components/AffiliateBox.js
import React from 'react';

/**
 * Displays a box with affiliate links to relevant resources.
 * @returns {JSX.Element} The AffiliateBox component.
 */
const AffiliateBox = () => {
  const affiliateLinks = [
    {
      title: 'Best SQL Interview Prep Course',
      description: 'Master SQL for data and software roles. Highly recommended!',
      link: '[AFFILIATE_LINK_SQL]', // Replace with actual affiliate link
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
    {
      title: 'Top Resume Templates & Builders',
      description: 'Create an ATS-friendly resume that stands out to recruiters.',
      link: '[AFFILIATE_LINK_RESUME]', // Replace with actual affiliate link
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Python Certification Courses',
      description: 'Boost your coding skills and land that dream tech job.',
      link: '[AFFILIATE_LINK_PYTHON]', // Replace with actual affiliate link
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 border border-indigo-200">
      <h3 className="text-xl font-bold text-indigo-700 mb-4">🚀 Boost Your Interview Prep!</h3>
      <div className="space-y-5">
        {affiliateLinks.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer nofollow" // Added nofollow for affiliate links
            className="flex items-start p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-200 group shadow-sm hover:shadow-md border border-gray-100"
          >
            <div className="flex-shrink-0 mr-4 mt-1">
              {item.icon}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">
                {item.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-5 text-center">
        Disclosure: We may earn a commission from purchases made through these links.
      </p>
    </div>
  );
};

export default AffiliateBox;

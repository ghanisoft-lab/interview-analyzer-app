// frontend/components/utils/seo.js

/**
 * Generates an SEO-optimized meta title or description.
 * @param {'title' | 'description'} type - The type of meta tag to generate.
 * @param {string} role - The job title.
 * @param {string[]} skills - Array of required skills.
 * @returns {string} - The generated meta string.
 */
export function generateMeta(type, role, skills) {
  const primarySkills = skills.slice(0, 3).join(', '); // Use top 3 skills for brevity

  if (type === 'title') {
    return `Top Interview Questions for ${role} (${new Date().getFullYear()} Guide) | Master ${primarySkills}`;
  } else if (type === 'description') {
    return `Prepare for your ${role} interview with key questions on ${primarySkills} and more. Get STAR-based answers and skill gap analysis for an ATS-friendly preparation.`;
  }
  return '';
}

/**
 * Generates FAQPage JSON-LD schema based on interview questions and answers.
 * @param {string} jobTitle - The job title for context.
 * @param {Array<object>} qnaList - Array of {question: string, answer: string} objects.
 * @returns {object} - JSON-LD schema for FAQPage.
 */
export function generateFAQSchema(jobTitle, qnaList) {
  const mainEntity = qnaList.slice(0, 5).map(item => ({ // Limit to top 5 FAQs for schema
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer // Use the full answer for schema
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity,
    "headline": `Interview Questions for ${jobTitle} - FAQ`,
    "description": `Frequently asked questions to prepare for a ${jobTitle} interview.`
  };
}

// frontend/components/QuestionCard.js
import React, { useState } from 'react';

/**
 * Displays an interview question and its sample answer, with toggle functionality.
 * @param {object} props - Component props.
 * @param {string} props.question - The interview question.
 * @param {string} props.type - The type of question (e.g., "Technical", "Behavioral").
 * @param {string} props.answer - The sample STAR-based answer.
 * @returns {JSX.Element} The QuestionCard component.
 */
const QuestionCard = ({ question, type, answer }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      <div
        className="flex justify-between items-center p-5 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition duration-200 ease-in-out"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
            {question}
          </h3>
          <span className="inline-block mt-2 px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
            {type}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-600 transform transition-transform duration-200 ${
            showAnswer ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      {showAnswer && (
        <div className="p-5 border-t border-gray-200 bg-gray-50 text-gray-700 text-md leading-relaxed">
          <p className="font-semibold mb-2 text-indigo-600">Sample Answer:</p>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;

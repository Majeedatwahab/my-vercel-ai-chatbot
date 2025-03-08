import { useState } from "react";
import type { ChatRequestOptions, Message, CreateMessage } from "ai";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

interface LearningStep {
  title: string;
  learningObjectives: string[];
  content: {
    explanation: string;
    examples?: string[];
    codeSnippets?: string[];
  };
  keyTakeaways: string[];
  resources: string[];
  quiz?: { question: string; options: string[]; answer: string };
}

interface LearningPathwayCardProps {
  title: string;
  levels?: {
    Beginner?: LearningStep[];
    Intermediate?: LearningStep[];
    Advanced?: LearningStep[];
  };
  description: string;
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

export default function LearningPathwayCard({
  title,
  levels = { Beginner: [], Intermediate: [], Advanced: [] },
  description,
  chatId,
  append,
}: LearningPathwayCardProps) {
  const [activeLevel, setActiveLevel] =
    useState<keyof typeof levels>("Beginner");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<
    Record<string, Set<number>>
  >({});

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const markStepAsCompleted = (index: number) => {
    setCompletedSteps((prev) => {
      const newCompletedSteps = new Set(prev[activeLevel] || []);
      newCompletedSteps.add(index);
      return { ...prev, [activeLevel]: newCompletedSteps };
    });
  };
  const handleQuizAnswer = (index: number, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const activeSteps = Array.isArray(levels?.[activeLevel])
    ? levels[activeLevel]
    : [];

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-lg border m-auto flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 text-center">{title}</h2>
      <p className="text-gray-600 mt-2 text-center">{description}</p>

      <div className="flex mt-4 space-x-2">
        {levels &&
          Object.keys(levels).map((level) => (
            <button
              type="button"
              key={level}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeLevel === level
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setActiveLevel(level as keyof typeof levels)}
              aria-pressed={activeLevel === level}
            >
              {level}
            </button>
          ))}
      </div>

      <div className="mt-4 w-full">
        {activeSteps.length > 0 ? (
          activeSteps.map((step, index) => (
            <div
              key={step.title}
              className={`p-4 border rounded-lg mt-2 bg-gray-100 transition-all duration-300 ${
                completedSteps[activeLevel]?.has(index)
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
            >
              <div>
                <button
                  type="button"
                  className="flex justify-between items-center w-full cursor-pointer"
                  onClick={() => toggleStep(index)}
                >
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    {completedSteps[activeLevel]?.has(index) && (
                      <CheckCircle className="text-green-600 mr-2" size={18} />
                    )}
                    {step.title}
                  </h3>
                  {expandedStep === index ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>

              {expandedStep === index && (
                <div className="mt-2">
                  <h4 className="font-medium">Learning Objectives:</h4>
                  <ul className="list-disc ml-5 text-gray-600">
                    {step.learningObjectives.map((obj) => (
                      <li key={obj}>{obj}</li>
                    ))}
                  </ul>

                  <p className="text-gray-600 mt-2">
                    {step.content.explanation}
                  </p>
                  {step.content.examples && (
                    <pre className="bg-gray-200 p-3 rounded-md mt-2 overflow-x-auto">
                      {step.content.examples.map((example) => (
                        <code key={example} className="block mb-2">
                          {example}
                        </code>
                      ))}
                    </pre>
                  )}

                  {step.content.codeSnippets && (
                    <pre className="bg-gray-800 text-white p-3 rounded-md mt-2 overflow-x-auto">
                      {step.content.codeSnippets.map((snippet) => (
                        <code key={snippet} className="block mb-2">
                          {snippet}
                        </code>
                      ))}
                    </pre>
                  )}

                  <h4 className="font-medium mt-3">Key Takeaways:</h4>
                  <ul className="list-disc ml-5 text-gray-600">
                    {step.keyTakeaways.map((takeaway) => (
                      <li key={takeaway}>{takeaway}</li>
                    ))}
                  </ul>

                  <h4 className="font-medium mt-3">Further Reading:</h4>
                  <ul className="mt-2 text-blue-600 text-sm">
                    {step.resources.length > 0 ? (
                      step.resources.map((link) => (
                        <li key={link}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-800"
                          >
                            {link}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No resources available</li>
                    )}
                    {step.quiz && (
                      <div className="mt-4 p-3 bg-gray-200 rounded-lg">
                        <h4 className="font-medium">Quiz:</h4>
                        <p className="text-gray-800">{step.quiz.question}</p>
                        <div className="mt-2">
                          {step.quiz.options.map((option) => (
                            <button
                              type="button"
                              key={option}
                              className={`block w-full p-2 mt-1 text-left rounded-lg border ${
                                selectedAnswers[index] === option
                                  ? option === step.quiz?.answer
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                  : "bg-white text-gray-800"
                              }`}
                              onClick={() => handleQuizAnswer(index, option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </ul>
                  <button
                    type="button"
                    onClick={() => markStepAsCompleted(index)}
                    className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all duration-200"
                    disabled={completedSteps[activeLevel]?.has(index)}
                  >
                    {completedSteps[activeLevel]?.has(index) ? (
                      <span className="flex items-center gap-1">
                        Completed{" "}
                        <CheckCircle size={16} className="text-white" />
                      </span>
                    ) : (
                      "Mark as Completed"
                    )}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-2">
            No content available for this level.
          </p>
        )}
      </div>
    </div>
  );
}

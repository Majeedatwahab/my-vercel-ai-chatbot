"use client";

import { useState, useEffect } from "react";
import type { ChatRequestOptions, Message, CreateMessage } from "ai";
import { ChevronDown, ChevronUp, CheckCircle, BarChart } from "lucide-react";

interface Quiz {
  question: string;
  options: string[];
  answer: string;
}

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
  quizzes?: Quiz[];
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
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, Record<number, string>>
  >({});

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  // Calculate total steps and completed steps for progress tracking
  const calculateProgress = () => {
    let totalSteps = 0;
    let completedCount = 0;

    Object.entries(levels).forEach(([level, steps]) => {
      if (Array.isArray(steps)) {
        totalSteps += steps.length;

        if (completedSteps[level]) {
          completedCount += completedSteps[level].size;
        }
      }
    });

    return {
      total: totalSteps,
      completed: completedCount,
      percentage:
        totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0,
    };
  };

  const progress = calculateProgress();

  const STORAGE_KEY = "learningPathwayProgress";
  const QUIZ_ANSWERS_KEY = "learningPathwayQuizAnswers";

  useEffect(() => {
    try {
      const storedProgress = localStorage.getItem(STORAGE_KEY);
      if (storedProgress) {
        const parsedProgress = JSON.parse(storedProgress);

        const restoredProgress: Record<string, Set<number>> = {};

        Object.keys(parsedProgress).forEach((level) => {
          const steps = parsedProgress[level];
          if (Array.isArray(steps)) {
            restoredProgress[level] = new Set(steps);
          } else {
            restoredProgress[level] = new Set();
          }
        });

        setCompletedSteps(restoredProgress);
      }

      // Load quiz answers
      const storedAnswers = localStorage.getItem(QUIZ_ANSWERS_KEY);
      if (storedAnswers) {
        const parsedAnswers = JSON.parse(storedAnswers);
        setSelectedAnswers(parsedAnswers);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);

      setCompletedSteps({});
      setSelectedAnswers({});

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(QUIZ_ANSWERS_KEY);
    }
  }, []);

  const markStepAsCompleted = (index: number) => {
    setCompletedSteps((prev) => {
      try {
        const updatedSteps = { ...prev };

        if (!updatedSteps[activeLevel]) {
          updatedSteps[activeLevel] = new Set<number>();
        }

        updatedSteps[activeLevel].add(index);

        const storageFormat: Record<string, number[]> = {};

        Object.keys(updatedSteps).forEach((level) => {
          const stepsSet = updatedSteps[level];
          if (stepsSet instanceof Set) {
            storageFormat[level] = Array.from(stepsSet);
          }
        });

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageFormat));

        return updatedSteps;
      } catch (error) {
        console.error("Error saving progress to localStorage:", error);
        return prev; // Return previous state if there's an error
      }
    });
  };

  // Updated to handle multiple quizzes
  const handleQuizAnswer = (
    stepIndex: number,
    quizIndex: number,
    answer: string
  ) => {
    setSelectedAnswers((prev) => {
      const updatedAnswers = { ...prev };

      if (!updatedAnswers[stepIndex]) {
        updatedAnswers[stepIndex] = {};
      }

      updatedAnswers[stepIndex][quizIndex] = answer;

      // Save to localStorage
      localStorage.setItem(QUIZ_ANSWERS_KEY, JSON.stringify(updatedAnswers));

      return updatedAnswers;
    });
  };

  const activeSteps = Array.isArray(levels?.[activeLevel])
    ? levels[activeLevel]
    : [];

  const getLevelProgress = (level: string) => {
    const levelSteps = levels[level as keyof typeof levels] || [];
    const completedLevelSteps = completedSteps[level]?.size || 0;
    const total = Array.isArray(levelSteps) ? levelSteps.length : 0;

    return {
      completed: completedLevelSteps,
      total,
      percentage:
        total > 0 ? Math.round((completedLevelSteps / total) * 100) : 0,
    };
  };

  // Calculate quiz score for a step
  const calculateQuizScore = (stepIndex: number, quizzes: Quiz[]) => {
    if (!quizzes || quizzes.length === 0)
      return { correct: 0, total: 0, percentage: 0 };

    const stepAnswers = selectedAnswers[stepIndex] || {};
    let correctCount = 0;

    quizzes.forEach((quiz, quizIndex) => {
      if (stepAnswers[quizIndex] === quiz.answer) {
        correctCount++;
      }
    });

    return {
      correct: correctCount,
      total: quizzes.length,
      percentage: Math.round((correctCount / quizzes.length) * 100),
    };
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-lg border m-auto flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 text-center">{title}</h2>
      <p className="text-gray-600 mt-2 text-center">{description}</p>

      {/* Progress Tracker */}
      <div className="w-full mt-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
          <button
            onClick={() => setShowProgressDetails(!showProgressDetails)}
            className="flex items-center text-blue-600 text-sm hover:text-blue-800"
          >
            <BarChart size={16} className="mr-1" />
            {showProgressDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {progress.completed} of {progress.total} steps completed
          </span>
          <span className="font-medium">{progress.percentage}%</span>
        </div>

        {/* Detailed Progress by Level */}
        {showProgressDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3 text-gray-700">
              Progress by Level
            </h4>
            {Object.keys(levels).map((level) => {
              const levelProgress = getLevelProgress(level);
              return (
                <div key={level} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{level}</span>
                    <span className="text-xs text-gray-500">
                      {levelProgress.completed}/{levelProgress.total} (
                      {levelProgress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        level === "Beginner"
                          ? "bg-green-500"
                          : level === "Intermediate"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${levelProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                  </ul>

                  {/* Multiple Quizzes Section */}
                  {step.quizzes && step.quizzes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium">Quizzes:</h4>

                      {/* Quiz Score Summary */}
                      {step.quizzes.some(
                        (quiz) =>
                          selectedAnswers[index]?.[
                            step.quizzes?.indexOf(quiz) ?? -1
                          ]
                      ) && (
                        <div className="mb-3 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Quiz Score
                            </span>
                            <span className="text-sm">
                              {calculateQuizScore(index, step.quizzes).correct}/
                              {calculateQuizScore(index, step.quizzes).total}(
                              {
                                calculateQuizScore(index, step.quizzes)
                                  .percentage
                              }
                              %)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                calculateQuizScore(index, step.quizzes)
                                  .percentage >= 80
                                  ? "bg-green-500"
                                  : calculateQuizScore(index, step.quizzes)
                                      .percentage >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${
                                  calculateQuizScore(index, step.quizzes)
                                    .percentage
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {step.quizzes.map((quiz, quizIndex) => (
                        <div
                          key={quizIndex}
                          className="p-3 bg-gray-200 rounded-lg mt-3"
                        >
                          <h5 className="font-medium text-gray-800">
                            Quiz {quizIndex + 1}:
                          </h5>
                          <p className="text-gray-800 mt-1">{quiz.question}</p>
                          <div className="mt-2">
                            {quiz.options.map((option) => (
                              <button
                                type="button"
                                key={option}
                                className={`block w-full p-2 mt-1 text-left rounded-lg border ${
                                  selectedAnswers[index]?.[quizIndex] === option
                                    ? option === quiz.answer
                                      ? "bg-green-500 text-white"
                                      : "bg-red-500 text-white"
                                    : "bg-white text-gray-800"
                                }`}
                                onClick={() =>
                                  handleQuizAnswer(index, quizIndex, option)
                                }
                              >
                                {option}
                              </button>
                            ))}
                          </div>

                          {/* Show correct answer after user selects an option */}
                          {selectedAnswers[index]?.[quizIndex] &&
                            selectedAnswers[index][quizIndex] !==
                              quiz.answer && (
                              <p className="mt-2 text-sm text-green-700">
                                Correct answer: {quiz.answer}
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => markStepAsCompleted(index)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all duration-200"
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

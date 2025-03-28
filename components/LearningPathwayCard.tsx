"use client";

import { useState, useEffect } from "react";
import type { ChatRequestOptions, Message, CreateMessage } from "ai";
import {
  ChevronDown,
  Star,
  Trophy,
  BookOpen,
  Sparkles,
  Award,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";

interface Quiz {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface Example {
  title?: string;
  description: string;
  code?: string;
}

interface Resource {
  title: string;
  type: string;
  url: string;
  description: string;
}

interface LearningStep {
  title: string;
  learningObjectives: string[];
  content: {
    introduction?: string;
    explanation: string;
    examples?: Example[];
  };
  keyTakeaways: string[];
  quizzes?: Quiz[];
  resources: Resource[];
}

interface LearningPathwayCardProps {
  title: string;
  levels?: {
    Beginner?: LearningStep[];
    Intermediate?: LearningStep[];
    Advanced?: LearningStep[];
  };
  description: string;
  prerequisites?: string[];
  furtherLearning?: {
    topic: string;
    description: string;
    resources: string[];
  }[];
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
  prerequisites = [],
  furtherLearning = [],
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
    Record<number, Record<number, string>>
  >({});
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const STORAGE_KEY = "learningPathwayProgress";
  const QUIZ_ANSWERS_KEY = "learningPathwayQuizAnswers";



  useEffect(() => {
    try {
      // Load completed steps
      const storedProgress = localStorage.getItem(STORAGE_KEY);
      if (storedProgress) {
        const parsedProgress = JSON.parse(storedProgress);

        
        const restoredProgress: Record<string, Set<number>> = {};

        // Safely convert arrays to Sets
        Object.keys(parsedProgress).forEach((level) => {
          const steps = parsedProgress[level];
          if (Array.isArray(steps)) {
            restoredProgress[level] = new Set(steps);
          } else {
            // If not an array, create an empty Set
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
      // Reset to empty state if there's an error
      setCompletedSteps({});
      setSelectedAnswers({});
      // Clear potentially corrupted data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(QUIZ_ANSWERS_KEY);
    }
    

  }, []);

  // Calculate total steps and completed steps for progress tracking
  const calculateProgress = () => {
    let totalSteps = 0;
    let completedCount = 0;

    Object.entries(levels).forEach(([level, steps]) => {
      if (Array.isArray(steps)) {
        totalSteps += steps.length;

        // Count completed steps for this level
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

  // Get level-specific progress
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

  const markStepAsCompleted = (index: number) => {
    setCompletedSteps((prev) => {
      try {
        // Create a new object to avoid mutating the previous state
        const updatedSteps = { ...prev };

       
        if (!updatedSteps[activeLevel]) {
          updatedSteps[activeLevel] = new Set<number>();
        }

        // Check if this step is already completed
        const isNewCompletion = !updatedSteps[activeLevel].has(index);

        // Add the index to the Set
        updatedSteps[activeLevel].add(index);

        // Prepare data for localStorage by converting Sets to arrays
        const storageFormat: Record<string, number[]> = {};

        Object.keys(updatedSteps).forEach((level) => {
          const stepsSet = updatedSteps[level];
          if (stepsSet instanceof Set) {
            storageFormat[level] = Array.from(stepsSet);
          }
        });

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageFormat));

        // Show confetti animation if this is a new completion
        if (isNewCompletion) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        }

        return updatedSteps;
      } catch (error) {
        console.error("Error saving progress to localStorage:", error);
        return prev; // Return previous state if there's an error
      }
    });
  };

  const handleQuizAnswer = (
    stepIndex: number,
    quizIndex: number,
    answer: string
  ) => {
    setSelectedAnswers((prev) => {
      const updatedAnswers = { ...prev };

      // Initialize step if it doesn't exist
      if (!updatedAnswers[stepIndex]) {
        updatedAnswers[stepIndex] = {};
      }

      // Set the answer for this specific quiz
      updatedAnswers[stepIndex][quizIndex] = answer;

      // Save to localStorage
      localStorage.setItem(QUIZ_ANSWERS_KEY, JSON.stringify(updatedAnswers));

      return updatedAnswers;
    });
  };

  const activeSteps = Array.isArray(levels?.[activeLevel])
    ? levels[activeLevel]
    : [];

  // Helper function to safely render arrays with map
  const safeMap = <T, U>(
    array: T[] | undefined,
    callback: (item: T, index: number) => U
  ): U[] => {
    return array ? array.map(callback) : [];
  };

  // Get appropriate icon for level
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Beginner":
        return <BookOpen className="mr-2" size={16} />;
      case "Intermediate":
        return <Rocket className="mr-2" size={16} />;
      case "Advanced":
        return <Award className="mr-2" size={16} />;
      default:
        return <BookOpen className="mr-2" size={16} />;
    }
  };

  

  const resetProgress = () => {
    // Remove progress from localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(QUIZ_ANSWERS_KEY);

    // Reset state
    setCompletedSteps({});
    setSelectedAnswers({});
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-lg border m-auto flex flex-col items-center relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={crypto.randomUUID()} // Generates a unique key for each element
              className="absolute size-2 rounded-full"
              style={{
                backgroundColor: [
                  "#FFD700",
                  "#FF6347",
                  "#4169E1",
                  "#32CD32",
                  "#FF69B4",
                  "#9370DB",
                ][i % 6],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: `${100 + Math.random() * 50}%`,
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                rotate: `${Math.random() * 360}deg`,
              }}
              transition={{
                duration: 1.5 + Math.random(),
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 text-center">{title}</h2>
      <p className="text-gray-600 mt-2 text-center">{description}</p>

      {/* My Cute Progress Tracker */}
      <div className="w-full mt-6 mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-indigo-700 flex items-center">
              <Trophy className="mr-2 text-yellow-500" size={20} />
              Your Learning Journey
            </h3>
            <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-indigo-600 shadow-sm border border-indigo-100">
              {progress.percentage}% Complete
            </div>
            <button
              type="reset"
              onClick={resetProgress}
              className="bg-black p-2 rounded-md text-lg font-semibold text-white hover:text-red-500"
            >
              Reset Progress
            </button>
          </div>

          {/* Main Progress Bar */}
          <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
              style={{ width: `${progress.percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Progress Milestones */}
            <div className="absolute top-0 left-0 size-full flex items-center justify-between px-2 pointer-events-none">
              {[25, 50, 75].map((milestone) => (
                <div
                  key={milestone}
                  className={`relative ${
                    progress.percentage >= milestone
                      ? "text-white"
                      : "text-transparent"
                  }`}
                  style={{ left: `${milestone}%`, marginLeft: "-10px" }}
                >
                  {progress.percentage >= milestone && (
                    <Sparkles
                      size={14}
                      className="absolute"
                      style={{ top: "-7px", left: "3px" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-sm text-indigo-600 mt-2">
            <span className="flex items-center">
              <Star className="mr-1 text-yellow-500" size={14} />
              {progress.completed} of {progress.total} steps completed
            </span>
          </div>

          {/* Level Progress */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.keys(levels).map((level) => {
              const levelProgress = getLevelProgress(level);
              return (
                <div
                  key={level}
                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center text-gray-700">
                      {getLevelIcon(level)}
                      {level}
                    </span>
                    <span className="text-xs bg-indigo-50 px-2 py-1 rounded-full text-indigo-600">
                      {levelProgress.completed}/{levelProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        level === "Beginner"
                          ? "bg-green-400"
                          : level === "Intermediate"
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${levelProgress.percentage}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress.percentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex mt-4 space-x-2 w-full justify-center">
        {levels &&
          Object.keys(levels).map((level) => (
            <button
              type="button"
              key={level}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeLevel === level
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setActiveLevel(level as keyof typeof levels)}
              aria-pressed={activeLevel === level}
            >
              {getLevelIcon(level)}
              <span>{level}</span>
            </button>
          ))}
      </div>

      <div className="mt-4 w-full">
        {activeSteps.length > 0 ? (
          activeSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 border rounded-lg mt-2 transition-all duration-300 ${
                completedSteps[activeLevel]?.has(index)
                  ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow-md"
                  : "bg-white border-gray-300"
              }`}
            >
              <div>
                <button
                  type="button"
                  className="flex justify-between items-center w-full cursor-pointer"
                  onClick={() => toggleStep(index)}
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    {completedSteps[activeLevel]?.has(index) ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                        className="mr-2 text-green-500"
                      >
                        <Trophy size={18} />
                      </motion.div>
                    ) : (
                      <div className="size-5 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-gray-600 text-xs font-bold">
                        {index + 1}
                      </div>
                    )}
                    <span
                      className={
                        completedSteps[activeLevel]?.has(index)
                          ? "text-green-700"
                          : "text-gray-800"
                      }
                    >
                      {step.title}
                    </span>
                  </h3>
                  <div
                    className={`transition-transform duration-300 ${
                      expandedStep === index ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown
                      className={
                        completedSteps[activeLevel]?.has(index)
                          ? "text-green-500"
                          : "text-gray-400"
                      }
                    />
                  </div>
                </button>
              </div>

              {expandedStep === index && (
                <div className="mt-4 pl-7">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-medium text-indigo-700 mb-2">
                      Learning Objectives:
                    </h4>
                    <ul className="list-disc ml-5 text-gray-600 space-y-1">
                      {safeMap(step.learningObjectives, (obj) => (
                        <li key={obj}>{obj}</li>
                      ))}
                    </ul>

                    {/* Content Section */}
                    <div className="mt-4">
                      {step.content.introduction && (
                        <div className="mb-3">
                          <h5 className="font-medium text-indigo-700 mb-1">
                            Introduction:
                          </h5>
                          <p className="text-gray-600">
                            {step.content.introduction}
                          </p>
                        </div>
                      )}

                      <div className="mb-3">
                        <h5 className="font-medium text-indigo-700 mb-1">
                          Explanation:
                        </h5>
                        <p className="text-gray-600">
                          {step.content.explanation}
                        </p>
                      </div>

                      {/* Examples Section */}
                      {step.content.examples &&
                        step.content.examples.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium text-indigo-700 mb-2">
                              Examples:
                            </h5>
                            <div className="space-y-3">
                              {safeMap(step.content.examples, (example, i) => (
                                <div
                                  key={i}
                                  className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                >
                                  {example.title && (
                                    <h6 className="font-medium text-gray-700 mb-1">
                                      {example.title}
                                    </h6>
                                  )}
                                  <p className="text-gray-600">
                                    {example.description}
                                  </p>
                                  {example.code && (
                                    <pre className="mt-2 bg-gray-800 text-white p-3 rounded-md overflow-x-auto text-sm">
                                      <code>{example.code}</code>
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    <h4 className="font-medium text-indigo-700 mt-4 mb-2">
                      Key Takeaways:
                    </h4>
                    <ul className="list-disc ml-5 text-gray-600 space-y-1">
                      {safeMap(step.keyTakeaways, (takeaway) => (
                        <li key={takeaway}>{takeaway}</li>
                      ))}
                    </ul>

                    {/* Resources Section */}
                    <h4 className="font-medium text-indigo-700 mt-4 mb-2">
                      Resources:
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {safeMap(step.resources, (resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex items-start"
                        >
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h5 className="font-medium text-blue-700">
                                {resource.title}
                              </h5>
                              <span className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-700">
                                {resource.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {resource.description}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* Multiple Quizzes Section */}
                    {step.quizzes && step.quizzes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-indigo-700 mb-2">
                          Quizzes:
                        </h4>

                        {safeMap(step.quizzes, (quiz, quizIndex) => (
                          <div
                            key={quizIndex}
                            className="p-4 bg-purple-50 rounded-lg mt-3 border border-purple-100"
                          >
                            <h5 className="font-medium text-purple-700 mb-2">
                              Quiz {quizIndex + 1}:
                            </h5>
                            <p className="text-gray-700 mb-3">
                              {quiz.question}
                            </p>
                            <div className="space-y-2">
                              {safeMap(quiz.options, (option) => (
                                <button
                                  type="button"
                                  key={option}
                                  className={`block w-full p-3 text-left rounded-lg border transition-all ${
                                    selectedAnswers[index]?.[quizIndex] ===
                                    option
                                      ? option === quiz.answer
                                        ? "bg-green-100 border-green-300 text-green-800"
                                        : "bg-red-100 border-red-300 text-red-800"
                                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
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
                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                  <p className="text-sm text-green-700 font-medium">
                                    Correct answer: {quiz.answer}
                                  </p>
                                </div>
                              )}

                            {/* Show explanation if available */}
                            {quiz.explanation &&
                              selectedAnswers[index]?.[quizIndex] && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-sm text-blue-700">
                                    <strong>Explanation:</strong>{" "}
                                    {quiz.explanation}
                                  </p>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}

                    <motion.button
                      type="button"
                      onClick={() => markStepAsCompleted(index)}
                      className={`mt-4 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 w-full ${
                        completedSteps[activeLevel]?.has(index)
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      }`}
                      whileHover={{
                        scale: completedSteps[activeLevel]?.has(index)
                          ? 1
                          : 1.02,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {completedSteps[activeLevel]?.has(index) ? (
                        <span className="flex items-center justify-center">
                          <Trophy size={16} className="mr-2" />
                          Completed!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Star size={16} className="mr-2" />
                          Mark as Completed
                        </span>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 mt-2 text-center italic">
            No content available for this level.
          </p>
        )}
      </div>

      {/* Further Learning Section */}
      {furtherLearning && furtherLearning.length > 0 && (
        <div className="w-full mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm">
          <h3 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
            <Rocket className="mr-2" size={18} />
            Further Learning
          </h3>
          {safeMap(furtherLearning, (item, index) => (
            <motion.div
              key={index}
              className="mb-4 last:mb-0 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h4 className="font-medium text-indigo-700">{item.topic}</h4>
              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
              {item.resources && item.resources.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-sm font-medium text-gray-700">
                    Resources:
                  </h5>
                  <ul className="list-disc ml-5 text-sm text-blue-500 mt-1">
                    {safeMap(item.resources, (resource, i) => {
                      const isValidUrl =
                        resource.startsWith("http") || resource.startsWith("/");
                      return (
                        <li key={i}>
                          <a
                            href={isValidUrl ? resource : "#"}
                            target={isValidUrl ? "_blank" : "_self"}
                            rel={isValidUrl ? "noopener noreferrer" : undefined}
                            className="hover:underline hover:text-blue-700 transition-colors"
                          >
                            {resource}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, BookOpen, Compass, Lightbulb, ExternalLink } from "lucide-react";

interface Concept {
  title: string;
  description: string;
  examples?: string[];
  codeSnippets?: {
    title: string;
    language: string;
    code: string;
    explanation: string;
  }[];
}

interface Terminology {
  title: string;
  description: string;
  examples?: string[];
}

interface Resource {
  title: string;
  type: "Article" | "Video" | "Book" | "Tutorial" | string;
  url: string;
  description: string;
}

interface LearningCardProps {
  title: string;
  overview: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime?: string;
  prerequisites: string[];
  keyTerminologies: Terminology[];
  concepts: Concept[];
  commonMistakes?: {
    mistake: string;
    correction: string;
  }[];
  practiceExercises?: {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    hints?: string[];
    solution?: string;
  }[];
  resources?: Resource[];
  explore: {
    relatedTopics: string[];
    suggestedQuestions: string[];
    note?: string[];
  };
  onVote?: () => void;
  onUnvote?: () => void;
}

const SAMPLE: LearningCardProps = {
  title: "Introduction to Data Analysis",
  overview:
    "Data analysis is the process of inspecting, cleansing, transforming, and modeling data to discover useful information, draw conclusions, and support decision-making.",
  difficulty: "Beginner",
  estimatedTime: "30 minutes",
  concepts: [
    {
      title: "Descriptive Statistics",
      description:
        "Descriptive statistics provide a snapshot of the data. They include measures of central tendency (mean, median, mode), dispersion (range, variance, standard deviation), and shape (skewness, kurtosis).",
      examples: [
        "Calculating the average (mean) age of students in a class",
        "Finding the most common (mode) blood type in a hospital",
      ],
    },
    {
      title: "Inferential Statistics",
      description:
        "Inferential statistics uses statistical methods to draw conclusions about a population from a sample. It assumes that the sample is representative of the population.",
      examples: [
        "Using a survey of 1,000 voters to predict an election outcome",
        "Testing if a new drug is effective based on clinical trials",
      ],
    },
    {
      title: "Data Cleaning",
      description:
        "Data cleaning involves identifying and addressing inconsistencies, missing values, and outliers in the data. It helps to improve the quality and reliability of the data.",
      examples: [
        "Removing duplicate customer records from a database",
        "Filling in missing temperature readings with averages",
      ],
    },
    {
      title: "Data Visualization",
      description:
        "Data visualization is the process of presenting data in a visual format, such as graphs, charts, or maps. It helps to communicate information effectively and make complex data more understandable.",
      examples: [
        "Creating a bar chart to compare sales across different regions",
        "Using a heatmap to visualize website user activity",
      ],
    },
  ],
  commonMistakes: [
    {
      mistake: "Confusing correlation with causation",
      correction:
        "Just because two variables are correlated doesn't mean one causes the other. Always look for confounding variables.",
    },
    {
      mistake: "Not checking for data quality issues before analysis",
      correction:
        "Always clean and validate your data first. Missing values, outliers, and inconsistencies can lead to incorrect conclusions.",
    },
  ],
  practiceExercises: [
    {
      title: "Calculate Basic Statistics",
      description:
        "Given the dataset [4, 8, 15, 16, 23, 42], calculate the mean, median, and standard deviation.",
      difficulty: "Easy",
      hints: [
        "Add all numbers and divide by count for mean",
        "Sort the numbers first for median",
      ],
      solution: "Mean: 18, Median: 15.5, Standard Deviation: ≈ 13.85",
    },
    {
      title: "Create a Visualization",
      description:
        "Create a bar chart to visualize the frequency of each letter in the word 'statistics'.",
      difficulty: "Medium",
      hints: ["Count each letter first", "Some letters appear multiple times"],
      solution: "s: 3, t: 3, a: 1, i: 2, c: 1",
    },
  ],
  explore: {
    relatedTopics: [
      "Simplify: Exploratory Data Analysis (EDA)",
      "Explore Further: Machine Learning Basics",
      "Go Deeper: Data Wrangling",
    ],
    suggestedQuestions: [
      "What is Exploratory Data Analysis?",
      "How does data visualization help in analysis?",
    ],
    note: [
      "I've created a Learning Card for Introduction to Data Analysis. Feel Free to ask any questions about the topic such as: ",
    ],
  },
  prerequisites: [
    "Basic understanding of statistics",
    "Familiarity with Excel or Google Sheets",
  ],
  keyTerminologies: [
    {
      title: "Mean",
      description: "The average of a set of numbers",
      examples: ["The mean of [1, 2, 3, 4, 5] is 3"],
    },
    {
      title: "Regression",
      description:
        "A statistical method used to model the relationship between two or more variables",
      examples: [
        "Linear regression to predict house prices based on square footage",
      ],
    },
    {
      title: "Correlation",
      description:
        "A statistical measure that describes the relationship between two variables",
      examples: [
        "A correlation coefficient of 0.9 indicates a strong positive relationship",
      ],
    },
  ],
  resources: [
    {
      title: "Introduction to Statistics",
      type: "Book",
      url: "https://example.com/stats-book",
      description:
        "A comprehensive introduction to statistical concepts and methods",
    },
    {
      title: "Data Visualization with Python",
      type: "Tutorial",
      url: "https://example.com/python-viz",
      description:
        "Learn how to create effective visualizations using Python libraries",
    },
  ],
};

// Helper function to safely render arrays with map
const safeMap = <T, U>(
  array: T[] | undefined,
  callback: (item: T, index: number) => U
): U[] => {
  return array ? array.map(callback) : [];
};

export default function LearningCard({
  learningContent = SAMPLE,
}: {
  learningContent?: LearningCardProps;
}) {
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Concepts" | "Practice" | "Resources" | "Explore"
  >("Overview");

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-2xl shadow-lg backdrop-blur-lg bg-white/30">
      {/* Title Section with Difficulty Badge */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{learningContent.title}</h1>
        <div className="flex items-center gap-2">
          {learningContent.difficulty && (
            <Badge
              variant={
                learningContent.difficulty === "Beginner"
                  ? "default"
                  : learningContent.difficulty === "Intermediate"
                  ? "secondary"
                  : "destructive"
              }
            >
              {learningContent.difficulty}
            </Badge>
          )}
          {learningContent.estimatedTime && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Info size={14} className="mr-1" />
              {learningContent.estimatedTime}
            </Badge>
          )}
        </div>
      </div>

      {/* Custom Tab Navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={activeTab === "Overview" ? "default" : "outline"}
          onClick={() => setActiveTab("Overview")}
          className="flex items-center gap-1"
          size="sm"
        >
          <Info size={16} />
          <span className="hidden sm:inline">Overview</span>
        </Button>
        <Button
          variant={activeTab === "Concepts" ? "default" : "outline"}
          onClick={() => setActiveTab("Concepts")}
          className="flex items-center gap-1"
          size="sm"
        >
          <BookOpen size={16} />
          <span className="hidden sm:inline">Concepts</span>
        </Button>
        <Button
          variant={activeTab === "Practice" ? "default" : "outline"}
          onClick={() => setActiveTab("Practice")}
          className="flex items-center gap-1"
          size="sm"
        >
          <Lightbulb size={16} />
          <span className="hidden sm:inline">Practice</span>
        </Button>
        <Button
          variant={activeTab === "Resources" ? "default" : "outline"}
          onClick={() => setActiveTab("Resources")}
          className="flex items-center gap-1"
          size="sm"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">Resources</span>
        </Button>
        <Button
          variant={activeTab === "Explore" ? "default" : "outline"}
          onClick={() => setActiveTab("Explore")}
          className="flex items-center gap-1"
          size="sm"
        >
          <Compass size={16} />
          <span className="hidden sm:inline">Explore</span>
        </Button>
      </div>

      {/* Content Section */}
      <Card className="bg-white p-6 rounded-lg text-black">
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h2 className="text-lg font-bold mb-2">Description</h2>
              <p className="text-gray-700">{learningContent.overview}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Prerequisites</h3>
              <ul className="list-disc pl-5 space-y-1">
                {safeMap(learningContent.prerequisites, (item) => (
                  <li key={item} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Key Terminologies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeMap(
                  Array.isArray(learningContent.keyTerminologies)
                    ? learningContent.keyTerminologies
                    : [],
                  (terminology) => (
                    <div
                      key={
                        typeof terminology === "string"
                          ? terminology
                          : terminology.title
                      }
                      className="bg-gray-100 rounded-md p-4 shadow-sm"
                    >
                      <h4 className="font-bold text-lg text-blue-700">
                        {typeof terminology === "string"
                          ? terminology
                          : terminology.title}
                      </h4>
                      {typeof terminology !== "string" && (
                        <>
                          <p className="text-gray-700 mt-1">
                            {terminology.description}
                          </p>
                          {terminology.examples &&
                            terminology.examples.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-500">
                                  Example:
                                </p>
                                <p className="text-sm italic text-gray-600">
                                  {terminology.examples[0]}
                                </p>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {learningContent.commonMistakes &&
              learningContent.commonMistakes.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Common Mistakes</h3>
                  <div className="space-y-3">
                    {safeMap(learningContent.commonMistakes, (item, index) => (
                      <div
                        key={index}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md"
                      >
                        <p className="font-bold text-red-700">{item.mistake}</p>
                        <p className="text-gray-700 mt-1">{item.correction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {activeTab === "Concepts" && (
          <div className="space-y-6">
            {safeMap(
              Array.isArray(learningContent.concepts)
                ? learningContent.concepts
                : [],
              (concept, index) => (
                <div
                  key={concept.title}
                  className="border border-gray-200 rounded-md p-5 shadow-sm"
                >
                  <h3 className="font-bold text-xl text-blue-700 mb-2">
                    {concept.title}
                  </h3>
                  <p className="text-gray-700 mb-4">{concept.description}</p>

                  {concept.examples && concept.examples.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Examples:
                      </h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {safeMap(concept.examples, (example, i) => (
                          <li key={i} className="text-gray-600">
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {concept.codeSnippets && concept.codeSnippets.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Code Examples:
                      </h4>
                      {safeMap(concept.codeSnippets, (snippet, i) => (
                        <div key={i} className="mt-2">
                          <p className="font-medium text-sm text-gray-700">
                            {snippet.title}
                          </p>
                          <pre className="bg-gray-800 text-white p-3 rounded-md mt-1 overflow-x-auto">
                            <code>{snippet.code}</code>
                          </pre>
                          <p className="text-sm text-gray-600 mt-1">
                            {snippet.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {activeTab === "Practice" && (
          <div className="space-y-6">
            {learningContent.practiceExercises &&
            learningContent.practiceExercises.length > 0 ? (
              <>
                <h3 className="text-xl font-bold mb-3">Practice Exercises</h3>
                {safeMap(
                  learningContent.practiceExercises,
                  (exercise, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-md p-5 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-lg">{exercise.title}</h4>
                        <Badge
                          variant={
                            exercise.difficulty === "Easy"
                              ? "default"
                              : exercise.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {exercise.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-4">
                        {exercise.description}
                      </p>

                      {exercise.hints && exercise.hints.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold text-sm text-gray-700 mb-1">
                            Hints:
                          </h5>
                          <ul className="list-disc pl-5 space-y-1">
                            {safeMap(exercise.hints, (hint, i) => (
                              <li key={i} className="text-gray-600 text-sm">
                                {hint}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {exercise.solution && (
                        <div className="mt-4">
                          <details className="group">
                            <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                              View Solution
                            </summary>
                            <div className="mt-2 p-3 bg-blue-50 rounded-md">
                              <p className="text-gray-700">
                                {exercise.solution}
                              </p>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )
                )}
              </>
            ) : (
              <p className="text-gray-500 italic">
                No practice exercises available for this topic.
              </p>
            )}
          </div>
        )}

        {activeTab === "Resources" && (
          <div className="space-y-6">
            {learningContent.resources &&
            learningContent.resources.length > 0 ? (
              <>
                <h3 className="text-xl font-bold mb-3">Learning Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeMap(learningContent.resources, (resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors duration-200 flex flex-col"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-blue-600">
                          {resource.title}
                        </h4>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">
                        {resource.description}
                      </p>
                      <div className="mt-auto pt-2 text-sm text-blue-500 flex items-center">
                        <ExternalLink size={14} className="mr-1" /> Visit
                        resource
                      </div>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 italic">
                No additional resources available for this topic.
              </p>
            )}
          </div>
        )}

        {activeTab === "Explore" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {safeMap(learningContent.explore.relatedTopics, (topic) => (
                  <Button
                    key={topic}
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>

            {learningContent.explore.note &&
              learningContent.explore.note.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
                  {safeMap(learningContent.explore.note, (text, index) => (
                    <p key={index} className="text-gray-700">
                      {text}
                    </p>
                  ))}
                </div>
              )}

            <div>
              <h3 className="text-xl font-bold mb-3">Suggested Questions</h3>
              <ul className="list-decimal pl-5 space-y-2">
                {safeMap(
                  learningContent.explore.suggestedQuestions,
                  (question) => (
                    <li key={question} className="text-gray-700">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-left font-normal justify-start"
                      >
                        {question}
                      </Button>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

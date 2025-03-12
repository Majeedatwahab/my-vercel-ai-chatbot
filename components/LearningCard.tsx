"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Concept {
  title: string;
  description: string;
}

interface Terminologies {
  title: string;
  description: string;
}
interface LearningCardProps {
  title: string;
  prerequisites: string[];
  keyTerminologies: Terminologies[];
  overview: string;
  concepts: Concept[];

  explore: {
    relatedTopics: string[];
    suggestedQuestions: string[];
    note: string[];
  };
  onVote?: () => void;
  onUnvote?: () => void;
}

const SAMPLE: LearningCardProps = {
  title: "Introduction to Data Analysis",
  overview:
    "Data analysis is the process of inspecting, cleansing, transforming, and modeling data to discover useful information, draw conclusions, and support decision-making.",
  concepts: [
    {
      title: "Descriptive Statistics",
      description:
        "Descriptive statistics provide a snapshot of the data. They include measures of central tendency (mean, median, mode), dispersion (range, variance, standard deviation), and shape (skewness, kurtosis).",
    },
    {
      title: "Inferential Statistics",
      description:
        "Inferential statistics uses statistical methods to draw conclusions about a population from a sample. It assumes that the sample is representative of the population.",
    },
    {
      title: "Data Cleaning",
      description:
        "Data cleaning involves identifying and addressing inconsistencies, missing values, and outliers in the data. It helps to improve the quality and reliability of the data.",
    },
    {
      title: "Data Visualization",
      description:
        "Data visualization is the process of presenting data in a visual format, such as graphs, charts, or maps. It helps to communicate information effectively and make complex data more understandable.",
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
    },
    {
      title: "Regression",
      description:
        "A statistical method used to model the relationship between two or more variables",
    },
    {
      title: "Correlation",
      description:
        "A statistical measure that describes the relationship between two variables",
    },
  ],
};

export default function LearningCard({
  learningContent = SAMPLE,
}: {
  learningContent?: LearningCardProps;
}) {
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Concepts" | "Explore"
  >("Overview");

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-2xl shadow-lg backdrop-blur-lg bg-white/30">
      {/* Title Section */}
      <h1 className="text-2xl font-bold mb-4">{learningContent.title}</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        {["Overview", "Concepts", "Explore"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() =>
              setActiveTab(tab as "Overview" | "Concepts" | "Explore")
            }
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Content Section */}
      <Card className="bg-white p-4 rounded-lg text-black">
        {activeTab === "Overview" && (
          <div>
            <div className=" border-4 border-black rounded-md p-4">
              <h2 className="text-lg font-bold">Description</h2>
              <p className="mt-2">{learningContent.overview}</p>
            </div>
            <div className="">
              <h3 className="mt-5 font-bold text-xl">Prerequisites:</h3>
              <ul className="list-disc pl-5">
                {learningContent.prerequisites.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="border-4 border-black rounded-md p-4">
              <h3 className="mt-4 font-bold text-xl">Key Terminologies</h3>
              <ul className="list-disc pl-5 mt-2">
                {(Array.isArray(learningContent.keyTerminologies)
                  ? learningContent.keyTerminologies
                  : []
                ).map((terminology) => (
                  <div
                    key={terminology.title}
                    className="mb-4 bg-gray-300 rounded-md p-4"
                  >
                    <h3 className="font-bold text-lg">
                      {typeof terminology === "string"
                        ? terminology
                        : terminology.title}
                    </h3>
                    {typeof terminology !== "string" &&
                      terminology.description && (
                        <p className="text-gray-700">
                          {terminology.description}
                        </p>
                      )}
                  </div>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "Concepts" && (
          <div className=" border-4 border-black rounded-md p-4">
            <ul className="list-disc pl-5 mt-2">
              {(Array.isArray(learningContent.concepts)
                ? learningContent.concepts
                : []
              ).map((concept) => (
                <div
                  key={concept.title}
                  className="mb-4 bg-gray-300 rounded-md p-4"
                >
                  <h3 className="font-bold text-lg">{concept.title}</h3>
                  <p className="text-gray-700">{concept.description}</p>
                </div>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "Explore" && (
          <div>
            <div className=" border-4 border-black rounded-md p-4">
              <h3 className="mt-2 font-bold text-xl">Related Topics:</h3>

              <ul className="list-disc pl-5">
                <div className="w-2xs">
                  {learningContent.explore.relatedTopics.map((topic) => (
                    <Button className="m-1" key={topic} variant={"secondary"}>
                      {topic}
                    </Button>
                  ))}
                </div>
              </ul>
            </div>

            {/* 
            <div className="bg-white rounded-md p-4 mt-4">
              
                {learningContent.explore.note.map(
                  (text, index) => (
                    <p key={index} className="m-2">
                      {text}
                    </p>
                  )
                )}
             
              </div>
            
            */}
            <div className="">
              <h3 className="mt-4 font-bold text-xl">Suggested Questions:</h3>
              <ul className="list-decimal pl-5">
                {learningContent.explore.suggestedQuestions.map((question) => (
                  <li key={question} className="m-2">
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export interface LearningCardProps {
  response: {
    title: string;
    overview: string;
    concepts: string[];
    explore: string[];
  };
  onVote: (vote: "up" | "down") => void;
  isLoading?: boolean;
} 
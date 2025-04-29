
import { toast } from "sonner";

const API_URL = "https://api.tenderfuchs.de/api";
let userApiKey = '';

export const setUserApiKey = (key: string) => {
  userApiKey = key;
};

export interface Question {
  id: string;
  text: string;
  options?: string[];
}

export interface Answer {
  questionId: string;
  text: string;
}

// Function to generate initial questions
export const generateInitialQuestions = async (
  description: string,
  procurementType: string,
  authorization?: string
): Promise<Question[]> => {
  try {
    const response = await fetch(`${API_URL}/analysis/generate-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      body: JSON.stringify({
        description,
        procurement_type: procurementType,
        openrouter_api_key: userApiKey || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to generate questions");
    }

    const data = await response.json();
    return transformQuestions(data);
  } catch (error) {
    console.error("Error generating questions:", error);
    toast.error("Failed to generate questions. Please try again.");
    return [];
  }
};

// Function to generate follow-up questions
export const generateMoreQuestions = async (
  previousQuestions: Question[],
  previousAnswers: Answer[],
  authorization?: string
): Promise<Question[]> => {
  try {
    const response = await fetch(`${API_URL}/analysis/generate-more-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      body: JSON.stringify({
        previous_questions: previousQuestions,
        previous_answers: previousAnswers,
        openrouter_api_key: userApiKey || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to generate more questions");
    }

    const data = await response.json();
    return transformQuestions(data);
  } catch (error) {
    console.error("Error generating more questions:", error);
    toast.error("Failed to generate more questions. Please try again.");
    return [];
  }
};

// Function to generate description
export const generateDescription = async (
  description: string,
  procurementType: string,
  questions: Question[],
  answers: Answer[],
  authorization?: string,
  id?: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/analysis/generate-description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      body: JSON.stringify({
        id,
        description,
        procurement_type: procurementType,
        questions,
        answers,
        openrouter_api_key: userApiKey || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to generate description");
    }

    return await response.text();
  } catch (error) {
    console.error("Error generating description:", error);
    toast.error("Failed to generate description. Please try again.");
    return "";
  }
};

// Helper function to transform questions from API format
const transformQuestions = (data: any): Question[] => {
  // This function would transform the API response into our Question type
  // For simplicity, we'll assume the API returns an array of questions
  try {
    if (Array.isArray(data)) {
      return data.map((q, index) => ({
        id: `q-${index}`,
        text: q.text || q.question || "",
        options: q.options || [],
      }));
    }
    
    // If the response is an object with questions inside
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions.map((q, index) => ({
        id: `q-${index}`,
        text: q.text || q.question || "",
        options: q.options || [],
      }));
    }

    // Fallback if the structure is unknown
    return Object.keys(data).map((key, index) => ({
      id: `q-${index}`,
      text: typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]),
      options: [],
    }));
  } catch (error) {
    console.error("Error transforming questions:", error);
    return [];
  }
};

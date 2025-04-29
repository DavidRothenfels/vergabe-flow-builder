
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Question, Answer } from "../services/apiService";
import { toast } from "sonner";

interface QuestionFormProps {
  questions: Question[];
  onSubmit: (answers: Answer[]) => void;
  isLoading: boolean;
  existingAnswers?: Answer[];
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  onSubmit,
  isLoading,
  existingAnswers = []
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Pre-fill with existing answers if available
  useState(() => {
    const prefilledAnswers: Record<string, string> = {};
    existingAnswers.forEach(answer => {
      prefilledAnswers[answer.questionId] = answer.text;
    });
    setAnswers(prefilledAnswers);
  });
  
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all questions have been answered
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast.error(`Bitte beantworten Sie alle ${unansweredQuestions.length} offenen Fragen`);
      return;
    }
    
    // Format answers for submission
    const formattedAnswers: Answer[] = questions.map(question => ({
      questionId: question.id,
      text: answers[question.id]
    }));
    
    onSubmit(formattedAnswers);
  };
  
  if (questions.length === 0) {
    return <p>Keine Fragen verfügbar</p>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question, index) => (
        <div key={question.id} className="p-4 border border-border rounded-md bg-card">
          <Label 
            htmlFor={`question-${question.id}`}
            className="block mb-2 font-medium"
          >
            {index + 1}. {question.text}
          </Label>
          
          {question.options && question.options.length > 0 ? (
            <div className="mt-2 text-sm text-muted-foreground">
              <p className="mb-1">Mögliche Antworten:</p>
              <ul className="list-disc pl-5 mb-3">
                {question.options.map((option, i) => (
                  <li key={i}>{option}</li>
                ))}
              </ul>
            </div>
          ) : null}
          
          <Textarea
            id={`question-${question.id}`}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Ihre Antwort..."
            className="notion-input mt-2"
            disabled={isLoading}
          />
        </div>
      ))}
      
      <Button 
        type="submit" 
        className="notion-btn-primary"
        disabled={isLoading}
      >
        {isLoading ? "Verarbeitung..." : "Antworten einreichen"}
      </Button>
    </form>
  );
};

export default QuestionForm;

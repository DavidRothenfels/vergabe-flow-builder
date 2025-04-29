
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Question, Answer } from "../services/apiService";
import { toast } from "sonner";
import { ChevronRight, MessageSquare } from "lucide-react";

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
  useEffect(() => {
    const prefilledAnswers: Record<string, string> = {};
    existingAnswers.forEach(answer => {
      prefilledAnswers[answer.questionId] = answer.text;
    });
    setAnswers(prefilledAnswers);
  }, [existingAnswers]);
  
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
      <div className="animated-list">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="p-4 border border-border rounded-md bg-card mb-4 hover:shadow-md transition-all hover:border-primary/20"
          >
            <Label 
              htmlFor={`question-${question.id}`}
              className="block mb-2 font-medium flex items-start"
            >
              <span className="inline-flex items-center justify-center bg-primary text-white rounded-full w-6 h-6 mr-2 flex-shrink-0">
                {index + 1}
              </span>
              <span>{question.text}</span>
            </Label>
            
            {question.options && question.options.length > 0 ? (
              <div className="mt-2 text-sm text-muted-foreground ml-8">
                <p className="mb-1">Mögliche Antworten:</p>
                <ul className="list-disc pl-5 mb-3">
                  {question.options.map((option, i) => (
                    <li key={i} className="mb-1 hover:text-foreground transition-colors">{option}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            
            <Textarea
              id={`question-${question.id}`}
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Ihre Antwort..."
              className="notion-input mt-2 ml-8 transition-all focus:border-primary"
              disabled={isLoading}
            />
          </div>
        ))}
      </div>
      
      <Button 
        type="submit" 
        className="notion-btn-primary flex items-center gap-2 w-full sm:w-auto"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="inline-block animate-pulse">Verarbeitung...</span>
        ) : (
          <>
            Antworten einreichen
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

export default QuestionForm;

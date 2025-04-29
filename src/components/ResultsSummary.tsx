
import { Question, Answer } from "../services/apiService";

interface ResultsSummaryProps {
  procurementType: string;
  description: string;
  questions: Question[];
  answers: Answer[];
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  procurementType,
  description,
  questions,
  answers
}) => {
  // Find answer for a specific question
  const findAnswer = (questionId: string): string => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer ? answer.text : "Keine Antwort";
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Projektinformation</h3>
        <div className="p-4 border border-border rounded-md bg-muted mb-2">
          <p className="font-medium">Beschaffungstyp:</p>
          <p className="mb-2">{procurementType}</p>
          <p className="font-medium">Projektbeschreibung:</p>
          <p>{description}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Fragen und Antworten</h3>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="p-4 border border-border rounded-md bg-card">
              <p className="font-medium mb-1">Frage {index + 1}: {question.text}</p>
              <p className="text-muted-foreground">Antwort: {findAnswer(question.id)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;

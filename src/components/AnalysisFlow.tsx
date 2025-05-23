
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  generateInitialQuestions, 
  generateMoreQuestions, 
  generateDescription, 
  Question, 
  Answer, 
  setUserApiKey 
} from "../services/apiService";
import { generatePDF } from "../services/pdfService";
import { toast } from "sonner";
import { Download, ChevronRight, CheckCircle, FileText, Edit, MessageSquare } from "lucide-react";
import QuestionForm from "./QuestionForm";
import ResultsSummary from "./ResultsSummary";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

// Define the steps of the analysis flow
enum Step {
  ProjectInfo = 1,
  InitialQuestions,
  FollowUpQuestions,
  Summary,
  FinalDescription
}

interface ApiKeyFormProps {
  onSubmit: (apiKey: string) => void;
}

// Form for entering an API key for anonymous users
const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("Bitte geben Sie einen API-Schlüssel ein");
      return;
    }
    onSubmit(apiKey);
  };

  return (
    <Card className="notion-card mb-6 animate-scale-in">
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <MessageSquare className="text-primary h-5 w-5" />
          API-Schlüssel eingeben
        </h3>
        <p className="text-muted-foreground mb-4">
          Als nicht angemeldeter Nutzer benötigen Sie einen OpenRouter API-Schlüssel, 
          um die KI-Funktionen zu nutzen.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenRouter API-Schlüssel</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ihren API-Schlüssel eingeben..."
              className="notion-input"
            />
            <p className="text-xs text-muted-foreground">
              Ihren Schlüssel erhalten Sie bei <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="notion-link">OpenRouter.ai</a>
            </p>
          </div>
          <Button type="submit" className="notion-btn-primary">
            Schlüssel speichern
          </Button>
        </form>
      </div>
    </Card>
  );
};

// Progress indicator for the analysis flow
const ProgressIndicator = ({ currentStep }: { currentStep: Step }) => {
  const steps = [
    { id: Step.ProjectInfo, label: "Projekt" },
    { id: Step.InitialQuestions, label: "Fragen" },
    { id: Step.FollowUpQuestions, label: "Details" },
    { id: Step.Summary, label: "Zusammenfassung" },
    { id: Step.FinalDescription, label: "Ergebnis" },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div className="flex items-center" key={step.id}>
          <div 
            className={`progress-step ${
              currentStep === step.id ? "active" : 
              currentStep > step.id ? "completed" : ""
            }`}
            title={step.label}
          >
            {currentStep > step.id ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          
          {index < steps.length - 1 && (
            <div 
              className={`progress-line ${
                currentStep > step.id ? "active" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const AnalysisFlow = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(Step.ProjectInfo);
  const [apiKeySubmitted, setApiKeySubmitted] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");
  const [procurementType, setProcurementType] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finalDescription, setFinalDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle API key submission for non-authenticated users
  const handleApiKeySubmit = (apiKey: string) => {
    setUserApiKey(apiKey);
    setApiKeySubmitted(true);
    toast.success("API-Schlüssel gespeichert");
  };
  
  // Start the analysis by generating initial questions
  const startAnalysis = async () => {
    if (!projectDescription.trim() || !procurementType.trim()) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return;
    }
    
    setIsLoading(true);
    try {
      const generatedQuestions = await generateInitialQuestions(
        projectDescription,
        procurementType,
        isAuthenticated ? `Bearer ${user?.id}` : undefined
      );
      
      if (generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setCurrentStep(Step.InitialQuestions);
        toast.success("Fragen wurden generiert");
      } else {
        toast.error("Keine Fragen konnten generiert werden");
      }
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast.error("Fehler beim Generieren der Fragen");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission for a set of questions
  const handleQuestionsSubmit = async (newAnswers: Answer[]) => {
    // Merge new answers with existing ones
    const updatedAnswers = [...answers, ...newAnswers];
    setAnswers(updatedAnswers);
    
    // If it's the initial questions round, move to follow-up
    if (currentStep === Step.InitialQuestions) {
      setIsLoading(true);
      try {
        const followUpQuestions = await generateMoreQuestions(
          questions,
          updatedAnswers,
          isAuthenticated ? `Bearer ${user?.id}` : undefined
        );
        
        if (followUpQuestions.length > 0) {
          setQuestions((prev) => [...prev, ...followUpQuestions]);
          setCurrentStep(Step.FollowUpQuestions);
          toast.success("Weitere Fragen wurden generiert");
        } else {
          // If no follow-up questions, move to summary
          setCurrentStep(Step.Summary);
          toast.info("Keine weiteren Fragen verfügbar");
        }
      } catch (error) {
        console.error("Error generating follow-up questions:", error);
        toast.error("Fehler beim Generieren weiterer Fragen");
        // Move to summary even if there's an error
        setCurrentStep(Step.Summary);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For follow-up questions, go to summary
      setCurrentStep(Step.Summary);
    }
  };
  
  // Create final description based on all questions and answers
  const createFinalDescription = async () => {
    setIsLoading(true);
    try {
      const description = await generateDescription(
        projectDescription,
        procurementType,
        questions,
        answers,
        isAuthenticated ? `Bearer ${user?.id}` : undefined
      );
      
      setFinalDescription(description);
      setCurrentStep(Step.FinalDescription);
      toast.success("Bedarfsbeschreibung wurde erstellt");
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Fehler beim Erstellen der Bedarfsbeschreibung");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export the full analysis as a PDF
  const exportToPDF = () => {
    try {
      generatePDF(
        projectDescription,
        procurementType,
        questions,
        answers,
        finalDescription
      );
      toast.success("PDF wurde erstellt und wird heruntergeladen");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Fehler beim Erstellen des PDFs");
    }
  };

  // Reset the entire flow
  const resetFlow = () => {
    setCurrentStep(Step.ProjectInfo);
    setProjectDescription("");
    setProcurementType("");
    setQuestions([]);
    setAnswers([]);
    setFinalDescription("");
  };
  
  return (
    <div className="notion-container">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold notion-heading mb-2 animate-fade-in">
          Vergabebausteine
        </h1>
        <p className="text-muted-foreground animate-fade-in">
          Bedarfsanalyse für Ihren Vergabeprozess
        </p>
      </div>
      
      <ProgressIndicator currentStep={currentStep} />

      {/* API Key form for non-authenticated users */}
      {!isAuthenticated && !apiKeySubmitted && (
        <ApiKeyForm onSubmit={handleApiKeySubmit} />
      )}

      {/* Step 1: Project Information */}
      {currentStep === Step.ProjectInfo && (
        <Card className="notion-card">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-6 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Projektinformation
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="procurement-type">Beschaffungstyp</Label>
                <Input
                  id="procurement-type"
                  value={procurementType}
                  onChange={(e) => setProcurementType(e.target.value)}
                  placeholder="z.B. IT-Dienstleistung, Hardware, Bauleistung"
                  className="notion-input"
                  disabled={isLoading || (!isAuthenticated && !apiKeySubmitted)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-description">Projektbeschreibung</Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Beschreiben Sie Ihr Projekt..."
                  className="notion-input min-h-[150px]"
                  disabled={isLoading || (!isAuthenticated && !apiKeySubmitted)}
                />
              </div>
              
              <Button 
                onClick={startAnalysis} 
                className="notion-btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                disabled={isLoading || (!isAuthenticated && !apiKeySubmitted)}
              >
                {isLoading ? (
                  <span className="inline-block animate-pulse">Wird generiert...</span>
                ) : (
                  <>
                    Analyse starten
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2 & 3: Questions (Initial and Follow-up) */}
      {(currentStep === Step.InitialQuestions || currentStep === Step.FollowUpQuestions) && (
        <Card className="notion-card">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-6 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              {currentStep === Step.InitialQuestions
                ? "Initiale Fragen"
                : "Weiterführende Fragen"}
            </h2>
            
            <QuestionForm 
              questions={
                currentStep === Step.InitialQuestions 
                  ? questions 
                  : questions.slice(questions.length - (questions.length - answers.length))
              }
              onSubmit={handleQuestionsSubmit}
              isLoading={isLoading}
              existingAnswers={answers}
            />
          </div>
        </Card>
      )}

      {/* Step 4: Summary of All Questions & Answers */}
      {currentStep === Step.Summary && (
        <Card className="notion-card">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-6 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Zusammenfassung
            </h2>
            
            <ResultsSummary
              procurementType={procurementType}
              description={projectDescription}
              questions={questions}
              answers={answers}
            />
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={createFinalDescription} 
                className="notion-btn-primary flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-block animate-pulse">Wird generiert...</span>
                ) : (
                  <>
                    Bedarfsbeschreibung erstellen
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => setCurrentStep(Step.InitialQuestions)} 
                variant="outline" 
                className="notion-btn-secondary flex items-center gap-2"
                disabled={isLoading}
              >
                <Edit className="h-4 w-4" />
                Zurück zu den Fragen
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 5: Final Generated Description */}
      {currentStep === Step.FinalDescription && (
        <Card className="notion-card">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-6 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Generierte Bedarfsbeschreibung
            </h2>
            
            <div className="p-4 bg-muted rounded-md mb-6 whitespace-pre-line shadow-inner animate-fade-in">
              {finalDescription}
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={exportToPDF} 
                className="notion-btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2"
                disabled={isLoading}
              >
                <Download className="h-4 w-4" />
                Als PDF exportieren
              </Button>
              
              <Button 
                onClick={() => setCurrentStep(Step.Summary)} 
                variant="outline" 
                className="notion-btn-secondary flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Zurück zur Zusammenfassung
              </Button>
              
              <Button 
                onClick={resetFlow} 
                variant="ghost" 
                className="notion-btn-ghost flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Neue Analyse starten
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalysisFlow;

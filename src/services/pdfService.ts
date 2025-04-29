
import { jsPDF } from 'jspdf';
import { Question, Answer } from './apiService';

// Function to generate a PDF from the analysis results
export const generatePDF = (
  projectDescription: string,
  procurementType: string,
  questions: Question[],
  answers: Answer[],
  finalDescription: string
): void => {
  const doc = new jsPDF();
  
  // Set font sizes
  const titleSize = 18;
  const headingSize = 14;
  const normalSize = 12;
  
  // Add title
  doc.setFontSize(titleSize);
  doc.text('Vergabebausteine - Bedarfsanalyse', 20, 20);
  
  // Add project info
  doc.setFontSize(headingSize);
  doc.text('Projektinformation', 20, 35);
  doc.setFontSize(normalSize);
  doc.text(`Beschaffungstyp: ${procurementType}`, 20, 45);
  
  // Add project description with word wrapping
  doc.setFontSize(headingSize);
  doc.text('Projektbeschreibung:', 20, 60);
  doc.setFontSize(normalSize);
  const splitDescription = doc.splitTextToSize(projectDescription, 170);
  doc.text(splitDescription, 20, 70);
  
  // Calculate current y position after description
  let yPos = 70 + (splitDescription.length * 7);
  
  // Add questions and answers
  doc.setFontSize(headingSize);
  doc.text('Fragen und Antworten:', 20, yPos + 10);
  yPos += 20;
  
  // Process each question and answer
  const qaPairs = questions.map((question, index) => {
    const answer = answers.find(a => a.questionId === question.id);
    return {
      question: question.text,
      answer: answer ? answer.text : 'Keine Antwort'
    };
  });
  
  qaPairs.forEach((pair, index) => {
    // Check if we need to add a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(normalSize);
    doc.setFont(undefined, 'bold');
    const questionText = `Frage ${index + 1}: ${pair.question}`;
    const splitQuestion = doc.splitTextToSize(questionText, 170);
    doc.text(splitQuestion, 20, yPos);
    yPos += splitQuestion.length * 7;
    
    doc.setFont(undefined, 'normal');
    const answerText = `Antwort: ${pair.answer}`;
    const splitAnswer = doc.splitTextToSize(answerText, 170);
    doc.text(splitAnswer, 20, yPos);
    yPos += (splitAnswer.length * 7) + 5;
  });
  
  // Add final description
  doc.addPage();
  doc.setFontSize(headingSize);
  doc.text('Generierte Bedarfsbeschreibung:', 20, 20);
  doc.setFontSize(normalSize);
  const splitFinalDescription = doc.splitTextToSize(finalDescription, 170);
  doc.text(splitFinalDescription, 20, 30);
  
  // Save the PDF
  doc.save('Vergabebausteine-Bedarfsanalyse.pdf');
};

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/configs/db";
import { CourseList } from "@/db/schema/chapter";
import { eq } from "drizzle-orm";

type QuizModalProps = {
  isOpen: boolean;
  onClose: () => void;
  questions: Array<{ question: string; options: string[]; answer: string }>;
  courseId: string;
  totalChapters: number;
};

const QuizModal = ({ isOpen, onClose, questions,courseId,totalChapters }: QuizModalProps) => {
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].answer) score++;
    });
    setShowResults(true);
  
    const percentage = (score / questions.length) * 100;
  
    // Fetch the current progress from the database
    const currentProgress = await db
      .select({ progress: CourseList.progress })
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));
  
    if (currentProgress?.[0]) {
      // Calculate the progress increment as a percentage
      const progressIncrement = 100 / totalChapters; // Divide by total chapters to get the increment per chapter
  
      // Add the increment to the existing progress
      let newProgress = currentProgress[0].progress + progressIncrement;
  
      // Ensure the progress does not exceed 100%
      newProgress = Math.min(newProgress, 100);
  
      // Update the progress in the database
      await db
        .update(CourseList)
        .set({ progress: newProgress }) // Store as a percentage (0–100)
        .where(eq(CourseList.courseId, courseId));
    }
  };
  

  const handleClose = () => {
    setAnswers(new Array(questions.length).fill("")); // Reset answers
    setShowResults(false); // Hide result view
    setCurrentQuestionIndex(0); // Reset question index
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Quiz</h2>

        {!showResults ? (
          <>
            {/* Question Navigation */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4">
                <h3 className="text-lg">{questions[currentQuestionIndex].question}</h3>
                {questions[currentQuestionIndex].options.map((option, optionIndex) => (
                  <label key={optionIndex} className="block mt-2">
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={answers[currentQuestionIndex] === option}
                      onChange={() => handleAnswerChange(currentQuestionIndex, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </motion.div>

            <div className="flex justify-between mt-4">
              <Button
                onClick={handlePrev}
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <Button
                onClick={handleNext}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={answers[currentQuestionIndex] === ""}
              >
                Next
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              className="mt-4 py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
              disabled={answers.includes("")}
            >
              Submit Quiz
            </Button>
          </>
        ) : (
          <div>
            <h3 className="text-lg text-center">
              Your Score:{" "}
              {answers.filter((answer, index) => answer === questions[index].answer).length} / {questions.length}
            </h3>
            <Button
              onClick={handleClose}
              className="mt-4 py-2 px-6 bg-gray-600 text-white rounded-md hover:bg-gray-700 w-full"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;

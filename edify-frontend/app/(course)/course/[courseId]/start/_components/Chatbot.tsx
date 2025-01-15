'use client'
import 'regenerator-runtime/runtime'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from 'ai/react'
import { X, Send, Bot, User, Mic, VolumeX } from 'lucide-react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import 'regenerator-runtime/runtime'
import { CourseType } from '@/types/resume.type'

type ChatbotModalProps = {
    course:CourseType;
}

export default function ChatbotModal(
{course}:ChatbotModalProps
) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { messages, input, handleInputChange, setInput, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = 
    typeof window !== 'undefined' 
      ? useSpeechRecognition() 
      : { transcript: '', listening: false, resetTranscript: () => {}, browserSupportsSpeechRecognition: false };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript, setInput])

  const startListening = () => {
    try {
      SpeechRecognition.startListening({ continuous: true });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    try {
      SpeechRecognition.stopListening();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };

  const handleVoiceInput = () => {
    if (listening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  }

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (listening) {
      stopListening();
    }
    const payload = { 
        input,
        course
     }
     try{
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
    
          if (!response.ok) {
            throw new Error('Failed to send message');
          }
    
          const data = await response.json();
          console.log('Chat response:', data.result);
          speakMessage(data.result);
            setInput('');
            messages.push({
                content: data.result, role: 'system',
                id:  (messages.length + 1).toString(),
            });
     }
     catch(e){
       console.log("Error",e);
     }
    // if (result && 'content' in result) {
    //   speakMessage(result.content);
    // }
    
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  if (!browserSupportsSpeechRecognition) {
    console.warn("Browser doesn't support speech recognition.")
  }

  return (
    <>
      <button
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-6 w-6" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 w-80 sm:w-96 bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 bg-blue-500 text-white">
              <h2 className="text-lg font-semibold">Chatbot</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start space-x-2 mb-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role !== 'user' && (
                    <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 shadow'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 bg-gray-300 rounded-full p-2">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start space-x-2 mb-4 justify-start"
                >
                  <div className="flex-shrink-0 bg-red-500 rounded-full p-2">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[75%] p-3 rounded-lg bg-red-100 text-red-800 shadow">
                    {error.message || "I'm sorry, but I'm having trouble connecting to my brain right now. Please try again later."}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`bg-blue-500 text-white rounded-full p-2 transition-all duration-200 ${
                    listening ? 'bg-red-500' : ''
                  } hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50`}
                >
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-blue-500 text-white rounded-full p-2 transition-all duration-200 ${
                    isLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="bg-red-500 text-white rounded-full p-2 transition-all duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                  >
                    <VolumeX className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
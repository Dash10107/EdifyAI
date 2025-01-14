'use client';

import { Button } from "@/components/ui/button";
import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';
import { Playfair_Display } from 'next/font/google';
import { toast } from "sonner";

const playfair = Playfair_Display({ subsets: ['latin'] });

export default function CertificatePage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateData = {
    userName: "Sarah Johnson",
    courseName: "Advanced Full Stack Development",
    completionDate: "January 13, 2025",
    certificateId: "CERT-EUWZ1XNFQ",
    platformName: "TechEdu Platform",
    instructorName: "Dr. Michael Smith"
  };

  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Add a small delay to ensure styles are fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(certificateRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: 1056,
        height: 768,
        style: {
          margin: '0',
          padding: '0',
        },
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `${certificateData.userName.replace(/\s+/g, '-')}-certificate.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      console.error('Error generating certificate:', err);
      toast.error("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div 
        ref={certificateRef} 
        className="bg-white w-[1056px] h-[768px] relative shadow-2xl mx-auto"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(229, 231, 235, 0.1) 0%, transparent 70%)'
        }}
      >
        {/* Double Border */}
        <div className="absolute inset-0 m-8 border-[1px] border-gray-800">
          <div className="absolute inset-0 m-2 border-[1px] border-gray-800"></div>
        </div>

        {/* Decorative Corners */}
        <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-gray-800" />
        <div className="absolute top-12 right-12 w-16 h-16 border-t-2 border-r-2 border-gray-800" />

        {/* Platform Name and Logo */}
        <div className="absolute top-16 right-20 flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
            T
          </div>
          <p className="text-sm font-medium text-gray-700">
            {certificateData.platformName}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-between h-full relative z-10 p-16">
          {/* Header */}
          <div className="text-center space-y-12 w-full">
            <h1 className={`${playfair.className} text-5xl font-bold text-gray-800 tracking-wide mb-16`}>
              Certificate of Completion
            </h1>
            
            {/* Recipient Name */}
            <div className="space-y-2">
              <p className="text-lg text-gray-600">is proudly presented to</p>
              <h2 className={`${playfair.className} text-4xl font-bold text-gray-800 mt-4`}>
                {certificateData.userName}
              </h2>
            </div>

            {/* Course Name */}
            <div className="space-y-2">
              <p className="text-lg text-gray-600">for completing a training program on</p>
              <h3 className={`${playfair.className} text-3xl font-bold text-gray-800 mt-4`}>
                {certificateData.courseName}
              </h3>
            </div>

            {/* Congratulatory Message */}
            <div className="mt-12 max-w-2xl mx-auto">
              <p className="text-gray-600 text-lg leading-relaxed">
                We hereby acknowledge your outstanding achievement and dedication in completing 
                this comprehensive course. Your commitment to excellence and professional growth 
                has been exemplary throughout this learning journey.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="w-full flex justify-between items-end mt-auto relative">
            {/* Lines with content above them */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">
              <div className="w-64 border-t border-gray-400" />
              <div className="w-64 border-t border-gray-400" />
            </div>

            {/* Content positioned above lines */}
            <div className="text-center mb-1">
              <p className="font-bold text-xl text-gray-800">
                {certificateData.instructorName}
              </p>
              <p className="text-sm text-gray-600">
                Course Instructor
              </p>
            </div>

            <div className="text-center mb-1">
              <p className="font-bold text-xl text-gray-800">
                {certificateData.completionDate}
              </p>
              <p className="text-sm text-gray-600">
                Date of Completion
              </p>
            </div>
          </div>

          {/* Certificate ID with improved styling */}
          <div className="absolute bottom-16 left-0 right-0 flex justify-center">
            <div className="px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-500 font-mono">
                Certificate ID: {certificateData.certificateId}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Corners */}
        <div className="absolute bottom-12 left-12 w-16 h-16 border-b-2 border-l-2 border-gray-800" />
        <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-gray-800" />
      </div>

      {/* Download Button */}
      <Button 
        onClick={downloadCertificate}
        disabled={isDownloading}
        className="mt-8 bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 flex items-center gap-2"
      >
        {isDownloading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
              />
            </svg>
            Download Certificate
          </>
        )}
      </Button>
    </div>
  );
}


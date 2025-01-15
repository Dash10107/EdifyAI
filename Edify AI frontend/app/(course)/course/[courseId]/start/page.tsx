"use client";

import { db } from "@/configs/db";
import { CourseChapters, CourseList } from "@/db/schema/chapter";
import { ChapterContentType, ChapterType, CourseType } from "@/types/resume.type";
import { and, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import Image from "next/image";
import UserToolTip from "./_components/UserToolTip";
import ScrollProgress from "@/components/ui/scroll-progress";
import QuizModal from "./_components/QuizModal";
import ChatbotModal from "./_components/Chatbot";
import { useRouter } from 'next/navigation';
type CourseStartProps = {
  params: { courseId: string };
};

const CourseStart = ({ params }: CourseStartProps) => {
 
  const [course, setCourse] = useState<CourseType | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterType | null>(
    null
  );

  const [chapterContent, setChapterContent] =useState<ChapterContentType | null>(null);
     const [isQuizOpen, setIsQuizOpen] = useState(false);
    const router = useRouter();
    const getCourse = async () => {
    try {
      const result = await db
        .select()
        .from(CourseList)
        .where(eq(CourseList.courseId, params.courseId));

      setCourse(result[0] as CourseType);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    params && getCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (!course) return <div>Loading...</div>;

  const getChapterContent = async (chapterId: number) => {
    const res = await db
      .select()
      .from(CourseChapters)
      .where(
        and(
          eq(CourseChapters.chapterId, chapterId),
          eq(CourseChapters.courseId, course.courseId)
        )
      );

    // console.log("content", res);

    setChapterContent(res[0] as ChapterContentType);
  };

  

  //   console.log("chapterContent", chapterContent);
  const handleNext = () => {
    if (chapterContent?.quiz) {
      setIsQuizOpen(true); // Open the quiz modal
    } else {
      // Handle next chapter logic here
    }
  };

  

  return (
    <div>
      <div className="fixed md:w-64 hidden md:block h-screen border-r shadow-sm">
        <h2 className="font-medium text-lg bg-primary p-4 text-white">
          {course?.courseOutput.topic}
        </h2>
        <div>
          {course?.courseOutput.chapters.map((chapter, index) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
<div
              key={index}
              className={`cursor-pointer hover:bg-purple-100 ${
                selectedChapter?.chapter_name === chapter.chapter_name &&
                "bg-purple-50"
              }`}
              onClick={() => {
                setSelectedChapter(chapter);
                getChapterContent(index);
              }}
            >
              <ChapterListCard chapter={chapter} index={index} />
            </div>
          ))}
            <div
  className="cursor-pointer hover:bg-purple-100"
  onClick={() => router.push(`/forum/${course.id}`)}  
>
  <ChapterListCard
    chapter={{ chapter_name: "Go to Forum" ,
    description: "Discuss with other learners",
    duration: "0"
    }}
    index={course.courseOutput.chapters.length}
  />
</div>
        </div>
      </div>

      <div className="md:ml-64">
        {selectedChapter ? (
          <div>
            <ChapterContent
              course={course}
              chapter={selectedChapter}
              content={chapterContent}
              handleNext={handleNext}
            />
          {isQuizOpen && chapterContent?.quiz && (
        <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        questions={chapterContent.quiz}
        courseId ={course.courseId}
        totalChapters={course.courseOutput.chapters.length}
        />
      )}
            <ScrollProgress />
          </div>
        ) : (
          <div className="p-10 flex justify-center flex-col items-center">
            <Image
              src={course.courseBanner || "/thumbnail.png"}
              alt={course.courseName || "AI Course Generator"}
              width={350}
              height={10}
              priority
              className="rounded-lg hover:shadow-lg hover:scale-105 transition-transform duration-500 cursor-pointer mt-20"
            />
            <p className="felx justify-center gap-3 mt-10">
              lets get started with the course {course.courseOutput.topic}.
              Click on the chapters to get started. Enjoy learning!
            </p>
            <p className="mt-10">
              <UserToolTip
                username={course.username || "AI Course Generator"}
                userProfileImage={course.userprofileimage || "/userProfile.png"}
              />
            </p>
          </div>
        )}
        <ChatbotModal 
          course={course}
        />
      </div>
    </div>
  );
};

export default CourseStart;

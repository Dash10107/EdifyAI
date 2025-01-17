"use client";

// import ChapterList from "@/app/create-course/[courseId]/_components/ChapterList";
// import CourseBasicInfo from "@/app/create-course/[courseId]/_components/CourseBasicInfo";
// import CourseDetail from "@/app/create-course/[courseId]/_components/CourseDetail";
// import Header from "@/app/course-dashboard/_components/Header";
import { db } from "@/configs/db";
import { CourseList } from "@/db/schema/chapter";
import { CourseType } from "@/types/resume.type";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import ChapterList from "../../create-course/[courseId]/_components/ChapterList";
import CourseDetail from "../../create-course/[courseId]/_components/CourseDetail";
import CourseBasicInfo from "../../create-course/[courseId]/_components/CourseBasicInfo";
import Header from "../../course-dashboard/_components/Header";

type CourseParams = {
  params: {
    courseId: string;
  };
};

const Course = ({ params }: CourseParams) => {
  const [course, setCourse] = useState<CourseType | null>(null);
  const getCourse = async () => {
    const result = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, params.courseId));

    setCourse(result[0] as CourseType);
    // console.log(result);
  };

  useEffect(() => {
    params && getCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div>
      <Header />
      <div className="px-10 p-10 md:px-20 lg:px-44">
        <CourseBasicInfo
          courseInfo={course}
          onRefresh={() => console.log("REfreshing")}
          edit={false}
        />

        <CourseDetail courseDetail={course} />

        <ChapterList
          course={course}
          onRefresh={() => console.log("refreshing")}
          edit={false}
        />
      </div>
    </div>
  );
};

export default Course;

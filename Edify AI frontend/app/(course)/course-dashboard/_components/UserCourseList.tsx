"use client";

import { db } from "@/configs/db";
import { CourseList } from "@/db/schema/chapter";
import { CourseType } from "@/types/resume.type";
import { eq } from "drizzle-orm";
import { useContext, useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { UserCourseListContext } from "@/app/(course)/_context/UserCourseList.context";
import SkeletonLoading from "./SkeletonLoading";

import {
  useKindeBrowserClient,
} from "@kinde-oss/kinde-auth-nextjs";

const UserCourseList = () => {
  const { user } = useKindeBrowserClient();
  const [courses, setCourses] = useState<CourseType[] | null>(null);
  const { setUserCourseList } = useContext(UserCourseListContext);

  useEffect(() => {
    user && getUserCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getUserCourses = async () => {
    const res = await db
      .select()
      .from(CourseList)
      .where(
        eq(CourseList.createdBy, user?.email ?? "")
      );

    setCourses(res as CourseType[]);
    setUserCourseList(res as CourseType[]);
  };

  if (courses?.length === 0) return <div className="flex justify-center items-center mt-44">No courses found</div>;
  return (
    <div className="">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {courses ? (
          courses.map((course, index) => (
            <CourseCard
              key={index}
              course={course}
              onRefresh={() => getUserCourses()}
            />
          ))
        ) : (
          <SkeletonLoading items={5} />
        )}
      </div>
    </div>
  );
};

export default UserCourseList;

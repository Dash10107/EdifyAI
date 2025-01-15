"use client";
import 'regenerator-runtime/runtime'
import { useState } from "react";
import { UserCourseListContext } from "../_context/UserCourseList.context";
import { CourseType } from "@/types/resume.type";

const courseDashboardLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [userCourseList, setUserCourseList] = useState<CourseType[]>([]);
  return (
    <UserCourseListContext.Provider
      value={{ userCourseList, setUserCourseList }}
    >
      <div className='max-w-[90%] mx-auto px-12 mt-8'>
          <div className="">{children}</div>
      </div>
    </UserCourseListContext.Provider>
  );
};

export default courseDashboardLayout;

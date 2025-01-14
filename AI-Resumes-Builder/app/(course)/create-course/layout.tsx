"use client";
import 'regenerator-runtime/runtime'
import { useState } from "react";
import { UserInputContext } from "../_context/UserInputContext";
import Header from "../course-dashboard/_components/Header";
import { CourseType, UserInputType } from "@/types/resume.type";
import { UserCourseListContext } from "../_context/UserCourseList.context";

const CreateCourseLayout = ({ children }: { children: React.ReactNode }) => {
  const [userInput, setUserInput] = useState<UserInputType>({});
  const [userCourseList, setUserCourseList] = useState<CourseType[]>([]);

  return (
    <div>
      <UserInputContext.Provider value={{ userInput, setUserInput }}>
        <UserCourseListContext.Provider
          value={{ userCourseList, setUserCourseList }}
        >
          <Header />
          {children}
        </UserCourseListContext.Provider>
      </UserInputContext.Provider>
    </div>
  );
};

export default CreateCourseLayout;

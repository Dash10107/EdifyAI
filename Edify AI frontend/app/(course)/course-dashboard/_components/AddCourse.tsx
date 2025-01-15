"use client";
import { UserCourseListContext } from "@/app/(course)/_context/UserCourseList.context";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useContext } from "react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import {
  LogoutLink,
  useKindeBrowserClient,
} from "@kinde-oss/kinde-auth-nextjs";

const AddCourse = () => {
  const { userCourseList } = useContext(UserCourseListContext);
  const { user, isAuthenticated } = useKindeBrowserClient();
  console.log(user)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-between items-center">
      <div>
      <h2 className="font-bold text-4xl">Customize Your Own Course</h2>
      <p className=" mb-8 text-xl px-1">Explore courses build with AI </p>
      </div>
      <Link href={userCourseList.length >= 5 ? "/course-dashboard/upgrade" : "/create-course"}>
        <Button className="gap-2 text-lg font-semibold">
          <FaWandMagicSparkles />
          Create AI course
        </Button>
      </Link>
    </div>
  );
};

export default AddCourse;
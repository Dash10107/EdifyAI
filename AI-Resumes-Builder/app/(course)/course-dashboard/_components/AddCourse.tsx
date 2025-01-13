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
        <h2 className="text-3xl">
          Hello, <span className="font-bold">{user?.given_name + " " + user?.family_name}</span>
        </h2>
        <p className="text-xs text-gray-500">
          Create new course with AI, share with friends and Earn some penny
        </p>
      </div>
      <Link href={userCourseList.length >= 5 ? "/course-dashboard/upgrade" : "/create-course"}>
        <Button className="gap-2">
          <FaWandMagicSparkles />
          Create AI course
        </Button>
      </Link>
    </div>
  );
};

export default AddCourse;
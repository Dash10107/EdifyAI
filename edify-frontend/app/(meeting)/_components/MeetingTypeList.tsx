/* eslint-disable camelcase */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import HomeCard from "./HomeCard";
import MeetingModal from "./MeetingModal";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import {
  LogoutLink,
  useKindeBrowserClient,
} from "@kinde-oss/kinde-auth-nextjs";
import Loader from "./Loader";
import { Textarea } from "@/components/ui/textarea";
import ReactDatePicker from "react-datepicker";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, VideoIcon } from 'lucide-react'

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: "Please select a date and time" });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create meeting");

      const starts_at =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      await call.getOrCreate({
        data: {
          starts_at,
          custom: {
            description: values.description || "Instant Meeting",
          },
        },
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: "Meeting Created",
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to create Meeting" });
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <>
    <section>
    <main className=" flex items-center justify-center p-4">
      <div className="w-full max-w-[90%] mx-auto grid lg:grid-cols-2 gap-8 items-center px-10">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight lg:text-5xl text-black">
              Video calls and meetings for everyone
            </h1>
            <p className="text-lg text-muted-foreground">
              Connect, collaborate and celebrate from anywhere with Google Meet
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setMeetingState("isInstantMeeting")}
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              New meeting
            </Button>
            <div className="flex-1 min-w-[260px] max-w-sm flex gap-2">
            <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border"
        />
              <Button variant="outline"
              onClick={() => router.push(values.link)}>
                Join
              </Button>
            </div>
          </div>

          <div>
            <Link 
              href="#" 
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Learn more
            </Link>
            <span className="text-muted-foreground text-sm"> about Google Meet</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="relative">
          <div className="relative aspect-square max-w-xl mx-auto">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Uvjot3H7O9yGpZsTIH6loiCm9IOF44.png"
              alt="Illustration of people in a video call"
              fill
              className="object-contain"
            />
            <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white shadow-lg">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white shadow-lg">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center mt-8 space-y-2">
            <h2 className="text-xl font-medium">Get a link that you can share</h2>
            <p className="text-muted-foreground">
              Click <span className="font-medium text-foreground">New meeting</span> to get a link that you can send to people that you want to meet with
            </p>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === 0 ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
    </section>
    </>
  );
};

export default MeetingTypeList;
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { usernameSchema } from "@/app/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/use-fetch";
import { updateUsername } from "@/actions/users";
import { BarLoader } from "react-spinners";
import { getLatestUpdates } from "@/actions/dashboard";
import { format } from "date-fns";

const Page = () => {
  const { isLoaded, user } = useUser();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(usernameSchema),
  });

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    if (isLoaded && user?.username) {
      setValue("username", user.username);
    }
  }, [isLoaded, user, setValue]);

  const {
    loading,
    error,
    data,
    fn: fnUpdateUsername,
  } = useFetch(updateUsername);

  const onSubmit = async (data) => {
    const result = await fnUpdateUsername(data.username);

    if (result?.success) {
      alert("Username updated successfully! 🎉");
      
    }
  };
  const {
    loading: loadingUpdates,
    data: upcomingMeetings,
    fn: fnUpdates,
  } = useFetch(getLatestUpdates);

  useEffect(() => {
    (async () => await fnUpdates())();
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.firstName}</CardTitle>
        </CardHeader>
        <CardContent>
          {!loadingUpdates ? (
            <div>
              {upcomingMeetings && upcomingMeetings.length > 0 ? (
                <ul>
                  {upcomingMeetings.map((meeting) => {
                    return (
                      <li key={meeting.id}>
                        -{meeting.event.title} on{" "}
                        {format(
                          new Date(meeting.startTime),
                          "MMM d, yyyy h:m a"
                        )}{" "}
                        with {meeting.name}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No upcoming meetings</p>
              )}
            </div>
          ) : (
            <p>Loading Updates...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Unique Link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span>{origin}/</span>
                <Input {...register("username")} placeholder="username" />
              </div>
              {errors.username && (
                <p className="text-red-500">{errors.username.message}</p>
              )}
              {/* {error && <p className="text-red-500">{error}</p>} */}
            </div>

            {loading && (
              <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;

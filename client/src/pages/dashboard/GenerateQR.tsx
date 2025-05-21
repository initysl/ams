import { Card, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const qrSchema = z.object({
  courseTitle: z.string().min(5, "Course title is required"),
  courseCode: z.string().min(5, "Course code is required"),
  courseLevel: z.enum(["100", "200", "300", "400", "500"], {
    required_error: "Course level is required",
  }),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(60, "Duration must be at most 60 minutes"),
});

type GenerateQR = {
  courseTitle: string;
  courseCode: string;
  courseLevel: string;
  duration: number;
};

type GenerateFields = z.infer<typeof qrSchema>;

const GenerateQR = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateFields>({
    resolver: zodResolver(qrSchema),
  });

  return (
    <div>
      <Card className="max-w-4xl mx-auto bg-white p-5">
        <CardDescription>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="courseTitle">Course Title</Label>
              <Input
                id="courseTitle"
                type="text"
                placeholder="Enter course title"
                {...register("courseTitle")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  type="text"
                  placeholder="Enter course code"
                  {...register("courseCode")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseLevel">Course Level</Label>
                <Select defaultValue="400">
                  <SelectTrigger className="w-full bg-gray-100 border border-gray-300 rounded-md">
                    <SelectValue placeholder="Choose level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-md">
                    <SelectGroup>
                      {["100", "200", "300", "400", "500"].map((level) => (
                        <SelectItem
                          key={level}
                          value={level}
                          className="hover:bg-gray-200"
                        >
                          {level}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={60}
                  placeholder="20"
                  {...register("duration", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        </CardDescription>
      </Card>
    </div>
  );
};

export default GenerateQR;

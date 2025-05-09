import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";

type AttendanceRecord = {
  courseTitle: string;
  courseCode: string;
  level: string;
  status: "present" | "absent";
};

const Attendance = async (credentials: { matricNumber: string }) => {
  try {
    const response = await api.get("attendance/record", {
      params: credentials,
      withCredentials: true,
    });
    const records: AttendanceRecord[] = response.data;
    if (records) {
      return records;
    }
  } catch (error: any) {
    if (error?.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("An error occurred while fetching attendance records");
    }
  }

  const { user } = useAuth();

  return (
    <div>
      <h2 className="font-semibold">Attendance records </h2>
      <Card className="bg-white mt-5">
        <CardContent className="">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter matric number"
              value={user?.matricNumber || ""}
            />
            <Button type="submit" className="bg-blue-500 text-white">
              Enter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;

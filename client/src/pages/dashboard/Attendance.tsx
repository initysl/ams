import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Loader, FileQuestion, BookOpenCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Table } from "@/components/ui/table";

type AttendanceRecord = {
  courseTitle: string;
  courseCode: string;
  level: string;
  status: "present";
};

const Attendance = () => {
  const { user } = useAuth();
  const [matricNumber] = useState(user?.matricNumber || "");
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Load records from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("attendanceRecords");
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get("attendance/record", {
        params: { matricNumber },
        withCredentials: true,
      });
      setRecords(response.data);
      sessionStorage.setItem(
        "attendanceRecords",
        JSON.stringify(response.data)
      );
      toast.success("Attendance records fetched successfully");
    } catch (error: any) {
      if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred while fetching attendance records");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearRecords = () => {
    setRecords(null);
    sessionStorage.removeItem("attendanceRecords");
    toast.info("Attendance records cleared");
  };

  return (
    <div className="space-y-5 flex flex-col items-center justify-center">
      <h2 className="font-semibold text-xl text-center">Attendance Records</h2>

      <Card className="flex flex-col justify-center items-center bg-white mt-5 max-w-full">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 w-full">
            <Input
              type="text"
              value={matricNumber}
              readOnly
              className="cursor-not-allowed bg-gray-100 w-full"
            />
            <Button
              onClick={fetchAttendance}
              className="bg-blue-500 text-white w-full md:w-auto"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin w-4 h-4" /> : "Enter"}
            </Button>
            {records && (
              <Button
                onClick={clearRecords}
                variant="outline"
                className="w-full md:w-auto"
              >
                Clear Records
              </Button>
            )}
          </div>

          <div className="mt-20 px-4">
            {loading && (
              <div className="text-center text-gray-500">
                <Loader className="mx-auto h-6 w-6 animate-spin" />
                <p>Fetching records...</p>
              </div>
            )}

            {!loading && records?.length === 0 && (
              <div className="flex flex-col items-center text-gray-500 mt-4">
                <FileQuestion className="h-10 w-10 mb-2" />
                <p>No attendance records found.</p>
              </div>
            )}

            <AnimatePresence>
              {!loading && records && records.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-full max-w-[250px] md:max-w-full overflow-x-auto border rounded-md">
                    <Table className="min-w-[500px] md:w-full text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="truncate max-w-[200px]">
                              {record.courseTitle}
                            </TableCell>
                            <TableCell>{record.courseCode}</TableCell>
                            <TableCell>{record.level}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-sm font-semibold ${
                                  record.status === "present"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-yellow-600"
                                }`}
                              >
                                {record.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      <Card className="flex flex-col justify-center items-center bg-yellow-100 mt-5 max-w-full">
        <CardContent>
          <div className="flex flex-col items-center">
            <div className=" flex items-center justify-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Attendance Summary
              </h2>
              <BookOpenCheck className="h-10 w-10 text-yellow-600 " />
            </div>
            {records && records.length > 0 ? (
              <p className="text-gray-600">
                You have attended{" "}
                {
                  records.filter(
                    (r) => r.status.trim().toLowerCase() === "present"
                  ).length
                }{" "}
                out of {records.length} classe(s).
              </p>
            ) : (
              <p className="text-gray-500">No records available.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;

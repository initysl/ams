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
import { Loader, FileQuestion } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Table } from "@/components/ui/table";

type AttendanceRecord = {
  courseTitle: string;
  courseCode: string;
  level: string;
  status: "present" | "absent";
};

const Attendance = () => {
  const { user } = useAuth();
  const [matricNumber] = useState(user?.matricNumber || "");
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get("attendance/record", {
        params: { matricNumber },
        withCredentials: true,
      });
      setRecords(response.data);
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

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-xl text-center">Attendance Records</h2>

      <Card className="flex flex-col justify-center items-center bg-white mt-5 max-w-2xl mx-auto">
        <CardContent className="p-4">
          <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
            <Input
              type="text"
              value={matricNumber}
              readOnly
              className="cursor-not-allowed bg-gray-100"
            />
            <Button
              onClick={fetchAttendance}
              className="bg-blue-500 text-white"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin w-4 h-4" /> : "Enter"}
            </Button>
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
                  <Table>
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
                          <TableCell>{record.courseTitle}</TableCell>
                          <TableCell>{record.courseCode}</TableCell>
                          <TableCell>{record.level}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-sm font-semibold ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {record.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-yellow-500 text-white">
        <CardContent>
          <p>Seamlessly track and view your attendance records in one click </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;

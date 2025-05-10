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
  date: number;
};

const Attendance = () => {
  const { user } = useAuth();
  const [matricNumber] = useState(user?.matricNumber || "");
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("attendanceRecords");
    if (saved) setRecords(JSON.parse(saved));
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
      toast.success("Attendance records retrieved successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "An error occurred while retrieving attendance records"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearRecords = () => {
    setRecords(null);
    sessionStorage.removeItem("attendanceRecords");
    toast.info("Attendance records cleared");
  };

  const presentCount =
    records?.filter((r) => r.status.trim().toLowerCase() === "present")
      .length || 0;
  const totalCount = records?.length || 0;
  const attendancePercentage = totalCount
    ? Math.round((presentCount / totalCount) * 100)
    : 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <h2 className="font-semibold text-xl ">Attendance Records</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Input & Fetch */}
        <Card className="bg-white col-span-1 md:col-span-2">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Input
                type="text"
                value={matricNumber}
                readOnly
                className="cursor-not-allowed bg-gray-100"
              />
              <Button
                onClick={fetchAttendance}
                className="bg-blue-500 text-white w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  "Get Records"
                )}
              </Button>
              {records && (
                <Button
                  onClick={clearRecords}
                  variant="outline"
                  className="w-full"
                >
                  Clear Records
                </Button>
              )}
            </div>
            <div className="mt-10">
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

              {/* Attendance Table */}
              <AnimatePresence>
                {!loading && records && records.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full overflow-x-auto border rounded-md">
                      <Table className="min-w-[500px] w-full text-sm">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
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
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {record.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(record.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  }
                                )}
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

        {/* Attendance Summary */}
        <Card className="bg-yellow-100 col-span-1 flex flex-col justify-center">
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="font-semibold text-gray-800">Summary</h2>
              <BookOpenCheck className="text-yellow-600 h-6 w-6" />
            </div>
            {totalCount > 0 ? (
              <p className="text-gray-600">
                Attended <strong>{presentCount}</strong> of{" "}
                <strong>{totalCount}</strong> classes.
              </p>
            ) : (
              <p className="text-gray-500">No records available.</p>
            )}
          </CardContent>
        </Card>

        {/* Total Attended */}
        <Card className="bg-green-50 col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-green-700 font-bold text-xl">{presentCount}</p>
            <p className="text-gray-500">Classes Attended</p>
          </CardContent>
        </Card>

        {/* Attendance Percentage */}
        <Card className="bg-blue-50 col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-blue-700 font-bold text-xl">
              {attendancePercentage}%
            </p>
            <p className="text-gray-500">Attendance Rate</p>
          </CardContent>
        </Card>

        {/* Most Recent Attendance */}
        <Card className="bg-purple-50 col-span-1">
          <CardContent className="p-4 text-center">
            {records && records.length > 0 ? (
              <>
                <p className="text-purple-700 font-bold">
                  {records[records.length - 1].courseTitle}
                </p>
                <p className="text-gray-500 text-sm">Most Recent Class</p>
              </>
            ) : (
              <p className="text-gray-500">No recent class</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;

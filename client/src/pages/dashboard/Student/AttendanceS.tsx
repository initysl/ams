import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import {
  Loader,
  FileQuestion,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  BarChart3,
  Award,
  Clock,
  Trash2,
  Search,
  ListFilter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type AttendanceRecord = {
  courseTitle: string;
  courseCode: string;
  level: string;
  status: "present";
  date: string | number;
};

const AttendanceS = () => {
  const { user } = useAuth();
  const [matricNumber] = useState(user?.matricNumber || "");
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedView, setSelectedView] = useState<"all" | "recent">("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Calculate statistics
  const presentCount =
    records?.filter((r) => r.status.trim().toLowerCase() === "present")
      .length || 0;
  const totalCount = records?.length || 0;
  const attendancePercentage = totalCount
    ? Math.round((presentCount / totalCount) * 100)
    : 0;

  // Get courses and their attendance counts
  const coursesAttended = records
    ? Array.from(new Set(records.map((record) => record.courseCode))).length
    : 0;

  // Get most recent class
  const mostRecentClass =
    records && records.length > 0
      ? [...records].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]
      : null;

  // Get least attended course
  const courseAttendance = records
    ? records.reduce((acc: Record<string, number>, record) => {
        const key = `${record.courseCode} - ${record.courseTitle}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    : {};

  // Filter records based on search term
  const filteredRecords = records
    ? records.filter(
        (record) =>
          record.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  // Get displayed records based on view selection
  const displayedRecords = filteredRecords
    ? selectedView === "recent"
      ? [...filteredRecords]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5)
      : [...filteredRecords].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    : null;

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-semibold text-xl md:text-2xl">Attendance Record</h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fetch Controls & Table */}
        <div className="md:col-span-2">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap justifybe items-center gap-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="text"
                    value={matricNumber}
                    readOnly
                    className="cursor-not-allowed bg-gray-100 w-36"
                  />
                  <Button
                    onClick={fetchAttendance}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader className="animate-spin w-4 h-4 mr-2" />
                    ) : null}
                    {loading ? "Loading..." : "Get Records"}
                  </Button>
                  {records && (
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={clearRecords}
                      variant="outline"
                      size="icon"
                    >
                      <span className="sr-only">Clear</span>
                      <Trash2 />
                    </Button>
                  )}

                  {/* View selection buttons moved next to trash button */}
                  {records && records.length > 0 && (
                    <div className="flex items-center gap-2 text-sm mx-auto mt-2 sm:mt-0">
                      <Button
                        variant={selectedView === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedView("all")}
                        className={
                          selectedView === "all"
                            ? "bg-yellow-500 text-white hover:bg-yellow-600"
                            : ""
                        }
                      >
                        All Records
                      </Button>
                      <Button
                        variant={
                          selectedView === "recent" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedView("recent")}
                        className={
                          selectedView === "recent"
                            ? "bg-teal-500 text-white hover:bg-teal-600"
                            : ""
                        }
                      >
                        Recent 5
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {loading && (
                <div className="text-center py-12">
                  <Loader className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                  <p className="mt-2 text-gray-500">
                    Fetching your attendance records...
                  </p>
                </div>
              )}

              {!loading && !records && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Calendar className="h-16 w-16 mb-4 opacity-20" />
                  <div>
                    <p className="font-medium">No attendance records loaded</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Click "Get Records" to fetch your attendance history
                    </p>
                  </div>
                </div>
              )}

              {!loading && filteredRecords?.length === 0 && (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <FileQuestion className="h-12 w-12 mb-3 text-gray-300" />
                  <p className="font-medium">No matching records found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search or view settings
                  </p>
                </div>
              )}

              {searchTerm && filteredRecords && filteredRecords.length > 0 && (
                <div className="mb-3 flex items-center gap-2 text-sm text-blue-600">
                  <ListFilter className="h-4 w-4" />
                  <span>
                    Found {filteredRecords.length} matching records for "
                    {searchTerm}"
                  </span>
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs py-0 h-6"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}

              <AnimatePresence>
                {!loading &&
                  displayedRecords &&
                  displayedRecords.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-white overflow-x-auto sm:mx-0 border rounded-md">
                        <Table className="min-w-full ">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-medium">
                                Course
                              </TableHead>
                              <TableHead className="font-medium">
                                Code
                              </TableHead>
                              <TableHead className="font-medium">
                                Level
                              </TableHead>
                              <TableHead className="font-medium">
                                Status
                              </TableHead>
                              <TableHead className="font-medium">
                                Date
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {displayedRecords.map((record, index) => (
                              <TableRow
                                key={index}
                                className="hover:bg-gray-50"
                              >
                                <TableCell
                                  className="max-w-[200px] truncate font-medium"
                                  title={record.courseTitle}
                                >
                                  {record.courseTitle}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {record.courseCode}
                                </TableCell>
                                <TableCell>{record.level}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      record.status === "present"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-600"
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {record.date
                                    ? new Date(record.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        }
                                      )
                                    : "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>

                      {selectedView === "recent" &&
                        filteredRecords &&
                        filteredRecords.length > 5 && (
                          <div className="mt-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedView("all")}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View All ({filteredRecords.length}) Records
                            </Button>
                          </div>
                        )}

                      {selectedView === "all" &&
                        displayedRecords.length > 10 && (
                          <div className="mt-4 text-center text-sm text-gray-500">
                            Showing all {displayedRecords.length} records
                          </div>
                        )}
                    </motion.div>
                  )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Stats */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <BookOpenCheck className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalCount > 0 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">
                      You've attended <strong>{presentCount}</strong> out of{" "}
                      <strong>{totalCount}</strong> classes.
                    </p>

                    <div className="mt-3 w-full bg-white rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${attendancePercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm mt-1 text-blue-600 font-medium">
                      {attendancePercentage}% Attendance
                    </p>
                  </div>

                  <div className="pt-2 border-t border-blue-100">
                    <p className="text-sm text-gray-600 font-medium">
                      Course Breakdown:
                    </p>
                    <ul className="mt-2 space-y-1">
                      {Object.entries(courseAttendance)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([course, count], index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="truncate" title={course}>
                              {course}
                            </span>
                            <span className="font-medium text-blue-700">
                              {count} classes
                            </span>
                          </li>
                        ))}
                    </ul>
                    {Object.keys(courseAttendance).length > 3 && (
                      <p className="text-xs text-gray-500 mt-2">
                        + {Object.keys(courseAttendance).length - 3} more
                        courses
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <p>No attendance records available.</p>
                  <p className="text-sm mt-1">
                    Click "Get Records" to fetch your data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {records && records.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mostRecentClass && (
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-amber-100">
                      <p className="font-medium text-amber-800">
                        {mostRecentClass.courseTitle}
                      </p>
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-gray-500">
                          {mostRecentClass.courseCode}
                        </p>
                        <p className="text-sm text-amber-600">
                          {new Date(mostRecentClass.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      Last attended course was{" "}
                      <strong>{mostRecentClass.courseTitle}</strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats Cards */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Classes Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            <p className="text-sm text-gray-500">out of {totalCount} total</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {attendancePercentage}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {coursesAttended}
            </p>
            <p className="text-sm text-gray-500">unique courses</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Last Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostRecentClass ? (
              <>
                <p
                  className="text-lg font-medium text-amber-600 truncate"
                  title={mostRecentClass.courseTitle}
                >
                  {mostRecentClass.courseCode}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(mostRecentClass.date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No classes yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceS;

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
  Loader2,
  FileQuestion,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  BarChart3,
  Award,
  Clock,
  Search,
  ListFilter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

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
  const [selectedView, setSelectedView] = useState<"all" | "recent">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("attendanceRecords");
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  // Fetch attendance mutation
  const fetchAttendanceMutation = useMutation({
    mutationFn: async (matricNumber: string) => {
      const response = await api.get("attendance/record", {
        params: { matricNumber },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setRecords(data);
      sessionStorage.setItem("attendanceRecords", JSON.stringify(data));
      toast.success("Attendance records generated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          "An error occurred while generating attendance records"
      );
    },
  });

  const handleFetchAttendance = () => {
    if (matricNumber) {
      fetchAttendanceMutation.mutate(matricNumber);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 },
    },
  };

  const isLoading = fetchAttendanceMutation.isPending;

  return (
    <motion.div
      className="container mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Search Bar */}
      <motion.div variants={itemVariants} className="flex gap-2 w-full">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            id="search-courses"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full rounded-md bg-white"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fetch Controls & Table */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 backdrop-blur-sm shadow-xl"
        >
          <Card className="bg-white shadow-sm">
            <CardHeader className="card-header">
              <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 w-full">
                {/* Top row: Primary Action + Filter Controls */}
                <div className="flex items-center flex-wrap gap-2 flex-1">
                  {/* Primary Action */}
                  <div>
                    <Button
                      onClick={handleFetchAttendance}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      ) : null}
                      {isLoading ? "Loading..." : "Get Records"}
                    </Button>
                  </div>

                  {/* Filter Controls */}
                  <div>
                    {records && records.length > 0 && (
                      <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <Button
                          variant={selectedView === "all" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setSelectedView("all")}
                          className={
                            selectedView === "all"
                              ? "bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm"
                              : "hover:bg-gray-200"
                          }
                        >
                          All Records
                        </Button>
                        <Button
                          variant={
                            selectedView === "recent" ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setSelectedView("recent")}
                          className={
                            selectedView === "recent"
                              ? "bg-teal-500 text-white hover:bg-teal-600 shadow-sm"
                              : "hover:bg-gray-200"
                          }
                        >
                          Recent 5
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Destructive Action - Full width on mobile, inline on larger screens */}
                <div className="w-full sm:w-auto">
                  {records && (
                    <Button
                      onClick={clearRecords}
                      variant="outline"
                      className="w-full sm:w-auto bg-red-50 border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                    >
                      Clear Records
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading && (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                  <p className="mt-2 text-gray-500">
                    Retreving attendance records...
                  </p>
                </div>
              )}

              {!isLoading && !records && (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 text-gray-400"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Calendar className="h-16 w-16 mb-4 opacity-20" />

                  <div className="text-center space-y-2">
                    <p className="font-medium">No attendance records loaded</p>
                    <p className="text-sm text-granoy-400">
                      Click "Get Records" to fetch your attendance history
                    </p>
                  </div>
                </motion.div>
              )}

              {!isLoading && filteredRecords?.length === 0 && (
                <motion.div
                  className="flex flex-col items-center py-12 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FileQuestion className="h-12 w-12 mb-3 text-gray-300" />
                  <p className="font-medium">No matching records found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search or view settings
                  </p>
                </motion.div>
              )}

              {searchTerm && filteredRecords && filteredRecords.length > 0 && (
                <motion.div
                  className="mb-3 flex items-center gap-2 text-sm text-blue-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              )}

              <AnimatePresence>
                {!isLoading &&
                  displayedRecords &&
                  displayedRecords.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="bg-white overflow-x-auto overflow-y-auto sm:mx-0 border rounded-md">
                        <Table className="min-w-full">
                          <TableHeader className="table-header">
                            <TableRow>
                              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Course
                              </TableHead>
                              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Code
                              </TableHead>
                              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Level
                              </TableHead>
                              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Status
                              </TableHead>
                              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Date
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="table-body font-bold">
                            {displayedRecords.map((record, index) => (
                              <motion.tr
                                key={index}
                                className="hover:bg-gray-50"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: index * 0.05,
                                  ease: "easeOut",
                                }}
                                whileHover={{ backgroundColor: "#f9fafb" }}
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
                                  <motion.span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      record.status === "present"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-600"
                                    }`}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.05 + 0.2 }}
                                  >
                                    {record.status}
                                  </motion.span>
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
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>

                      {selectedView === "recent" &&
                        filteredRecords &&
                        filteredRecords.length > 5 && (
                          <motion.div
                            className="mt-4 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedView("all")}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View All ({filteredRecords.length}) Records
                            </Button>
                          </motion.div>
                        )}

                      {selectedView === "all" &&
                        displayedRecords.length > 10 && (
                          <motion.div
                            className="mt-4 text-center text-sm text-gray-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            Showing all {displayedRecords.length} records
                          </motion.div>
                        )}
                    </motion.div>
                  )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary & Stats Section */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="backdrop-blur-sm shadow-xl card-header bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 h-full">
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
                            You've attended <strong>{presentCount}</strong> out
                            of <strong>{totalCount}</strong> classes.
                          </p>

                          <div className="mt-3 w-full  bg-white rounded-full h-3">
                            <motion.div
                              className="bg-blue-500 h-3 rounded-full"
                              initial={{ width: 0 }}
                              whileInView={{
                                width: `${attendancePercentage}%`,
                              }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.3 }}
                            />
                          </div>
                          <p className="text-right text-sm mt-1 text-blue-600 font-medium">
                            {attendancePercentage}% Attendance
                          </p>
                        </div>

                        <div className="pt-2 border-t border-blue-100 ">
                          <p className="text-sm text-gray-600 font-medium">
                            Course Breakdown:
                          </p>
                          <ul className="mt-2 space-y-1">
                            {Object.entries(courseAttendance)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 3)
                              .map(([course, count], index) => (
                                <motion.li
                                  key={index}
                                  className="flex justify-between items-center text-sm"
                                  initial={{ opacity: 0, x: -10 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: index * 0.1 + 0.5 }}
                                >
                                  <span className="truncate" title={course}>
                                    {course}
                                  </span>
                                  <span className="font-medium text-blue-700">
                                    {count} class
                                  </span>
                                </motion.li>
                              ))}
                          </ul>
                          {Object.keys(courseAttendance).length > 3 && (
                            <motion.p
                              className="text-xs text-gray-500 mt-2"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.8 }}
                            >
                              + {Object.keys(courseAttendance).length - 3} more
                              courses
                            </motion.p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        className="flex flex-col items-center justify-center py-8 text-gray-500 "
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-center space-y-2 ">
                          <p>No attendance records available.</p>
                          {/* <p className="text-sm mt-1">
                            Click "Get Records" to fetch your data.
                          </p> */}
                          <p className="text-sm">
                            Senior man, load your record naa, abi you never
                            attend any class nii 👀.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {records && records.length > 0 && (
                <motion.div variants={cardVariants} whileHover="hover">
                  <Card className="backdrop-blur-sm shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100 h-full">
                    <CardHeader className="card-header pb-2">
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <Clock className="h-5 w-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mostRecentClass && (
                        <div className="space-y-3">
                          <motion.div
                            className="p-3 bg-white rounded-lg border border-amber-100"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                          >
                            <p className="font-medium text-amber-800">
                              {mostRecentClass.courseTitle}
                            </p>
                            <div className="flex justify-between mt-1">
                              <p className="text-sm text-gray-500">
                                {mostRecentClass.courseCode}
                              </p>
                              <p className="text-sm text-amber-600">
                                {new Date(
                                  mostRecentClass.date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </motion.div>

                          <p className="text-sm text-gray-600">
                            Last attended course was{" "}
                            <strong>{mostRecentClass.courseTitle}</strong>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
              {[
                {
                  title: "Classes Attended",
                  value: presentCount,
                  subtitle: `out of ${totalCount} total`,
                  icon: CheckCircle2,
                  color: "green",
                  delay: 0.1,
                },
                {
                  title: "Attendance Rate",
                  value: `${attendancePercentage}%`,
                  subtitle: "",
                  icon: BarChart3,
                  color: "blue",
                  delay: 0.2,
                  showProgress: true,
                },
                {
                  title: "Courses",
                  value: coursesAttended,
                  subtitle: "unique courses",
                  icon: Award,
                  color: "purple",
                  delay: 0.3,
                },
                {
                  title: "Last Attended",
                  value: mostRecentClass?.courseCode || "None",
                  subtitle: mostRecentClass
                    ? new Date(mostRecentClass.date).toLocaleDateString()
                    : "No classes yet",
                  icon: Clock,
                  color: "amber",
                  delay: 0.4,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: stat.delay,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Card className="bg-white backdrop-blur-sm shadow-xl hover:shadow-lg transition-shadow duration-300 h-full">
                    <CardHeader className="card-header pb-2">
                      <CardTitle
                        className={`text-sm text-gray-500 flex items-center gap-2`}
                      >
                        <stat.icon
                          className={`h-4 w-4 text-${stat.color}-500`}
                        />
                        {stat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={`text-2xl font-bold text-${stat.color}-600 ${
                          stat.title === "Last Attended" ? "text-lg" : ""
                        }`}
                      >
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <p className="text-sm text-gray-500">{stat.subtitle}</p>
                      )}
                      {stat.showProgress && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <motion.div
                            className={`bg-${stat.color}-600 h-2.5 rounded-full`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${attendancePercentage}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 1,
                              delay: 0.5,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AttendanceS;

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Filter,
  Loader2,
  Search,
  Users,
  AlertCircle,
  Check,
  X,
  FileText,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAttendance } from "@/context/AttendanceContex";

interface AttendanceProps {
  attendanceCount?: number;
  onUpdateRecord?: (count: number) => void;
}

type LectureSession = {
  _id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
};

type AttendanceRecord = {
  name: string;
  matricNumber: string;
  courseTitle: string;
  courseCode: string;
  level: string;
  status: string;
  date: string | number;
};

type AttendanceReportResponse = {
  report: AttendanceRecord[];
};

const AttendanceL: React.FC<AttendanceProps> = ({ onUpdateRecord }) => {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [report, setReport] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { updateTotalStudents } = useAttendance();

  // Fetch lecture sessions
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["lectureSessions"],
    queryFn: async (): Promise<LectureSession[]> => {
      const response = await api.get("attendance/lecture", {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaced cacheTime)
  });

  // Generate attendance report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (
      sessionId: string
    ): Promise<AttendanceReportResponse> => {
      const response = await api.get(`attendance/report/${sessionId}`, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setReport(data.report);
      // Cache the report for this session
      if (selectedSession) {
        const cachedReportKey = `report_${selectedSession}`;
        sessionStorage.setItem(cachedReportKey, JSON.stringify(data.report));
      }
      toast.success("Attendance report generated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to generate report");
      setReport([]);
    },
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      // Simulate async operation for consistency
      return new Promise<void>((resolve) => {
        // Clear specific cache items related to attendance
        const keysToRemove = [];

        // Find all report keys
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith("report_")) {
            keysToRemove.push(key);
          }
        }

        // Remove specific keys
        keysToRemove.forEach((key) => sessionStorage.removeItem(key));
        sessionStorage.removeItem("selectedSession");

        resolve();
      });
    },
    onSuccess: () => {
      // Reset state
      setReport([]);
      setSelectedSession("");
      // Refetch sessions
      refetchSessions();
      toast.success("Cache cleared successfully");
    },
    onError: () => {
      toast.error("Failed to clear cache");
    },
  });

  // Statistics
  const totalStudents = report.length;
  const presentCount = report.filter(
    (r) => r.status.toLowerCase() === "present"
  ).length;
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Get unique levels in the report
  const levels = [...new Set(report.map((r) => r.level))].sort();
  const levelCounts = levels.reduce((acc, level) => {
    acc[level] = report.filter((r) => r.level === level).length;
    return acc;
  }, {} as Record<string, number>);

  // Load cached data on mount
  useEffect(() => {
    // Load cached selected session
    const cachedSelectedSession = sessionStorage.getItem("selectedSession");
    if (cachedSelectedSession) {
      setSelectedSession(cachedSelectedSession);

      // Load cached report based on the selected session
      const cachedReportKey = `report_${cachedSelectedSession}`;
      const cachedReport = sessionStorage.getItem(cachedReportKey);
      if (cachedReport) {
        setReport(JSON.parse(cachedReport));
      }
    }
  }, []);

  // Update total students count whenever report changes
  useEffect(() => {
    updateTotalStudents(totalStudents);
    // update via props
    if (onUpdateRecord) {
      onUpdateRecord(totalStudents);
    }
  }, [totalStudents, onUpdateRecord, updateTotalStudents]);

  // Handle session selection change
  const handleSessionChange = (value: string) => {
    setSelectedSession(value);
    sessionStorage.setItem("selectedSession", value);

    // Check if we already have a cached report for this session
    const cachedReportKey = `report_${value}`;
    const cachedReport = sessionStorage.getItem(cachedReportKey);

    if (cachedReport) {
      setReport(JSON.parse(cachedReport));
    } else {
      setReport([]);
    }
  };

  // Generate report handler
  const handleGenerateReport = () => {
    if (!selectedSession) {
      toast.error("Please select a lecture session");
      return;
    }

    // Check if we have cached report for this session
    const cachedReportKey = `report_${selectedSession}`;
    const cachedReport = sessionStorage.getItem(cachedReportKey);

    if (cachedReport) {
      setReport(JSON.parse(cachedReport));
      toast.success("Loaded cached attendance report");
      return;
    }

    generateReportMutation.mutate(selectedSession);
  };

  // Export functions
  const exportAsCSV = () => {
    if (!report.length) return;

    const selectedSessionData = (sessions as LectureSession[]).find(
      (s: LectureSession) => s._id === selectedSession
    );
    const headers = ["Name", "Matric Number", "Course Code", "Level", "Status"];
    const csvData = report.map((r) => [
      r.name,
      r.matricNumber,
      r.courseCode,
      r.level,
      r.status,
    ]);

    let csvContent = headers.join(",") + "\n";
    csvData.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${selectedSessionData?.courseCode}-attendance-report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report exported successfully");
  };

  const exportAsPDF = () => {
    if (!report.length) return;

    const selectedSessionData = (sessions as LectureSession[]).find(
      (s: LectureSession) => s._id === selectedSession
    );
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(
      `Attendance Report for ${selectedSessionData?.courseCode}`,
      20,
      20
    );
    doc.setFontSize(12);
    doc.text(`Course Title: ${selectedSessionData?.courseTitle}`, 20, 30);
    doc.text(
      `Date: ${
        selectedSessionData?.date
          ? new Date(selectedSessionData.date).toLocaleDateString()
          : "N/A"
      }`,
      20,
      40
    );
    autoTable(doc, {
      head: [["Name", "Matric Number", "Course Code", "Level", "Status"]],
      body: report.map((r) => [
        r.name,
        r.matricNumber,
        r.courseCode,
        r.level,
        r.status,
      ]),
      startY: 50,
    });
    doc.save(`${selectedSessionData?.courseCode}-attendance-report.pdf`);
    toast.success("Report exported successfully");
  };

  // Filter report based on search and status
  const filteredReport = report.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.matricNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      record.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const selectedSessionData = (sessions as LectureSession[]).find(
    (s: LectureSession) => s._id === selectedSession
  );

  // Handle sessions error
  useEffect(() => {
    if (sessionsError) {
      toast.error("Failed to load lecture sessions");
    }
  }, [sessionsError]);

  return (
    <div className="container mx-auto space-y-6 pb-8">
      {/* Session Selection */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100 shadow-xl">
        <CardHeader className="card-header pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calendar className="h-5 w-5" />
            Select Lecture Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Select
                value={selectedSession}
                onValueChange={handleSessionChange}
                disabled={sessionsLoading}
              >
                <SelectTrigger className="w-full bg-white border-none">
                  <SelectValue placeholder="Select a lecture session" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {sessionsLoading && (
                    <div className="flex items-center justify-center py-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading sessions...
                    </div>
                  )}
                  {!sessionsLoading && sessions.length === 0 && (
                    <div className="text-center py-2 text-gray-500">
                      No lecture sessions found
                    </div>
                  )}
                  {(sessions as LectureSession[]).map(
                    (session: LectureSession) => (
                      <SelectItem key={session._id} value={session._id}>
                        {session.courseCode} - {session.courseTitle} (
                        {new Date(session.date).toLocaleDateString()})
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 space-x-2">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedSession || generateReportMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {generateReportMutation.isPending ? (
                  <>
                    Loading...
                    <Loader2 className="animate-spin w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>Generate Report</>
                )}
              </Button>
              <Button
                onClick={() => clearCacheMutation.mutate()}
                disabled={clearCacheMutation.isPending}
                variant="outline"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {clearCacheMutation.isPending ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  "Clear"
                )}
              </Button>
            </div>
          </div>

          {selectedSessionData && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-yellow-800">
                    {selectedSessionData.courseTitle}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedSessionData.courseCode}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end">
                  <p className="text-sm text-gray-600">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    {new Date(selectedSessionData.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Filter and Export Controls */}
      {report.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-1 flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or matric number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-md bg-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-yellow-100 hover:bg-yellow-400 border-none">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Status</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem className="hover:bg-amber-300" value="all">
                  All Statuses
                </SelectItem>
                <SelectItem className="hover:bg-teal-300" value="present">
                  Present
                </SelectItem>
                <SelectItem className="hover:bg-indigo-300" value="absent">
                  Absent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={exportAsCSV}
              disabled={!report.length}
              className="flex items-center gap-2 bg-lime-100 hover:bg-lime-400 hover:text-white border-none"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={exportAsPDF}
              disabled={!report.length}
              className="flex items-center gap-2 bg-green-100 hover:bg-green-400 hover:text-white border-none"
            >
              <File className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      )}
      {/* Attendance Table */}
      <div className="bg-white overflow-x-auto rounded-md shadow-xl">
        {/* Regular Table for Medium and Up Screens */}
        <div className="hidden md:block max-h-[70vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Matric Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Course Code
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Level
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="table-body bg-white divide-y divide-gray-200">
              {filteredReport.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500">No matching records found</p>
                  </td>
                </tr>
              ) : (
                filteredReport.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.matricNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.courseCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status.toLowerCase() === "present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredReport.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-gray-500">No matching records found</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-200 relative">
              {filteredReport.map((record, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">
                      {record.name}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status.toLowerCase() === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Matric:</span>{" "}
                    {record.matricNumber}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Course:</span>{" "}
                    {record.courseCode}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Level:</span> {record.level}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Report Content */}
      {report.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-yellow-100 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalStudents}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {presentCount}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Absent</p>
                    <p className="text-2xl font-bold text-red-600">
                      {totalStudents - presentCount}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-100 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attendanceRate}%
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Breakdown */}
          {levels.length > 0 && (
            <Card className="bg-white shadow-xl mb-6">
              <CardHeader className="card-header pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Attendance by Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {levels.map((level) => (
                    <div
                      key={level}
                      className="p-3 bg-gray-200 rounded-lg border border-gray-100"
                    >
                      <p className="text-sm text-gray-500">Level {level}</p>
                      <p className="text-xl font-semibold text-gray-700">
                        {levelCounts[level]} students
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredReport.length > 0 && (
            <div className="text-sm text-gray-500 mt-4 text-center">
              Showing {filteredReport.length} of {report.length} records
            </div>
          )}
        </motion.div>
      )}
      {/* Empty State */}
      {!report.length &&
        !generateReportMutation.isPending &&
        selectedSession && (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No Report Generated Yet / No Report Found
            </h3>
            <p className="text-gray-500 mb-6">
              Select a lecture session and click "Generate Report" to view
              attendance data.
            </p>
            <Button
              onClick={handleGenerateReport}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={generateReportMutation.isPending}
            >
              {generateReportMutation.isPending ? (
                <>
                  Generating...
                  <Loader2 className="animate-spin w-4 h-4 ml-2" />
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>
        )}
      {/* Initial State */}
      {!report.length &&
        !generateReportMutation.isPending &&
        !selectedSession && (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Select a Lecture Session
            </h3>
            <p className="text-gray-500">
              Choose a session from the dropdown above to view its attendance
              report.
            </p>
          </div>
        )}
    </div>
  );
};

export default AttendanceL;

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { TooltipProps as RechartsTooltipProps } from "recharts";
import { Loader2, TrendingUp, BarChart3, Users, Percent } from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
  sessionDate: string;
  attendanceCount: number;
  courseCode: string;
  totalCourseStudents: number;
  attendanceRate: number;
}

interface ChartDataPoint {
  name: string;
  attendance: number;
  attendanceRate: number;
  courseCode: string;
  date: string;
  totalStudents: number;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

interface QuickStatsProps {
  averageAttendance: number;
  maxAttendance: number;
  averageRate: number;
  totalSessions: number;
  isLoading: boolean;
}

const ChartOne = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("week");
  const [courses, setCourses] = useState<string[]>([]);
  const [stats, setStats] = useState({
    averageAttendance: 0,
    maxAttendance: 0,
    averageRate: 0,
    totalSessions: 0,
  });

  // Format date string from "2025-05-13" to "Mon 13/05"
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = days[date.getDay()];
      const dayOfMonth = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${day} ${dayOfMonth}/${month}`;
    } catch (error) {
      console.warn("Error formatting date:", error);
      return dateString;
    }
  };

  const fetchAttendanceMutation = useMutation({
    mutationFn: async (): Promise<AttendanceRecord[]> => {
      const response = await api.get<AttendanceRecord[]>("attendance/trend", {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      // Extract all unique courses
      const uniqueCourses = Array.from(
        new Set(data.map((entry: AttendanceRecord) => entry.courseCode))
      );
      setCourses(uniqueCourses);

      const formattedData: ChartDataPoint[] = data.map(
        (entry: AttendanceRecord) => ({
          name: formatDate(entry.sessionDate),
          attendance: entry.attendanceCount,
          attendanceRate: entry.attendanceRate,
          courseCode: entry.courseCode,
          date: entry.sessionDate,
          totalStudents: entry.totalCourseStudents,
        })
      );

      // Calculate comprehensive statistics
      const totalAttendance = formattedData.reduce(
        (sum, entry) => sum + entry.attendance,
        0
      );
      const totalRates = formattedData.reduce(
        (sum, entry) => sum + entry.attendanceRate,
        0
      );

      const avgAttendance =
        formattedData.length > 0
          ? Math.round(totalAttendance / formattedData.length)
          : 0;

      const avgRate =
        formattedData.length > 0
          ? Math.round(totalRates / formattedData.length)
          : 0;

      const maxAttendance =
        formattedData.length > 0
          ? Math.max(...formattedData.map((entry) => entry.attendance))
          : 0;

      setStats({
        averageAttendance: avgAttendance,
        maxAttendance: maxAttendance,
        averageRate: avgRate,
        totalSessions: formattedData.length,
      });

      setChartData(formattedData);
    },
    onError: (error: any) => {
      console.error("Error fetching attendance trend:", error);
      const errorMessage =
        error?.response?.data?.error || error?.message || "Unknown error";
      toast.error(`Error fetching attendance trend: ${errorMessage}`);

      // Reset state on error
      setChartData([]);
      setCourses([]);
      setStats({
        averageAttendance: 0,
        maxAttendance: 0,
        averageRate: 0,
        totalSessions: 0,
      });
    },
  });

  useEffect(() => {
    fetchAttendanceMutation.mutate();
  }, []);

  // Error state helpers
  const isNoRecordsFound =
    fetchAttendanceMutation.isError &&
    fetchAttendanceMutation.error?.response?.status === 404;

  const hasError = fetchAttendanceMutation.isError && !isNoRecordsFound;

  // Filter data based on selected course and time range
  const filteredData = chartData.filter((entry: ChartDataPoint) => {
    // Filter by course
    if (selectedCourse !== "all" && entry.courseCode !== selectedCourse) {
      return false;
    }

    // Filter by time range
    if (timeRange !== "all") {
      const entryDate = new Date(entry.date);
      const today = new Date();

      if (timeRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return entryDate >= weekAgo;
      } else if (timeRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return entryDate >= monthAgo;
      }
    }

    return true;
  });

  // Calculate filtered stats
  const filteredStats = (() => {
    if (filteredData.length === 0) return stats;

    const totalAttendance = filteredData.reduce(
      (sum, entry) => sum + entry.attendance,
      0
    );
    const totalRates = filteredData.reduce(
      (sum, entry) => sum + entry.attendanceRate,
      0
    );

    return {
      averageAttendance: Math.round(totalAttendance / filteredData.length),
      maxAttendance: Math.max(...filteredData.map((entry) => entry.attendance)),
      averageRate: Math.round(totalRates / filteredData.length),
      totalSessions: filteredData.length,
    };
  })();

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  // Enhanced tooltip with more information
  const renderTooltipContent = (
    props: RechartsTooltipProps<number, string>
  ) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }

    const dataPoint = props.payload[0].payload as ChartDataPoint;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">
          {`${dataPoint.name} - ${dataPoint.courseCode}`}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600">
            <span className="font-medium">Attendance:</span>{" "}
            {dataPoint.attendance} students
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Total:</span>{" "}
            {dataPoint.totalStudents} students
          </p>
          <p className="text-green-600">
            <span className="font-medium">Rate:</span>{" "}
            {dataPoint.attendanceRate}%
          </p>
        </div>
      </div>
    );
  };

  const QuickStats = ({
    averageAttendance,
    maxAttendance,
    averageRate,
    totalSessions,
  }: QuickStatsProps) => (
    <div className="flex mt-3 gap-3 text-sm flex-wrap">
      <div className="bg-blue-50 p-2 rounded-lg flex items-center gap-2 min-w-[120px]">
        <Users className="h-4 w-4 text-blue-600" />
        <div>
          <div className="font-medium text-blue-800">Average</div>
          <div className="text-blue-600">{averageAttendance} students</div>
        </div>
      </div>
      <div className="bg-green-50 p-2 rounded-lg flex items-center gap-2 min-w-[120px]">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <div>
          <div className="font-medium text-green-800">Highest</div>
          <div className="text-green-600">{maxAttendance} students</div>
        </div>
      </div>
      <div className="bg-purple-50 p-2 rounded-lg flex items-center gap-2 min-w-[120px]">
        <Percent className="h-4 w-4 text-purple-600" />
        <div>
          <div className="font-medium text-purple-800">Avg Rate</div>
          <div className="text-purple-600">{averageRate}%</div>
        </div>
      </div>
      <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 min-w-[120px]">
        <BarChart3 className="h-4 w-4 text-gray-600" />
        <div>
          <div className="font-medium text-gray-800">Sessions</div>
          <div className="text-gray-600">{totalSessions}</div>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ title, description, icon: Icon }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <Icon className="h-12 w-12 mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-center max-w-sm leading-relaxed">
        {description}
      </p>
    </div>
  );

  return (
    <div>
      <Card className="bg-white shadow-sm">
        <CardHeader className="">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
              <h2 className="text-lg font-semibold text-gray-800">
                Attendance Trend
              </h2>
            </CardTitle>
            <div className="flex space-x-3">
              <select
                id="select-course"
                value={selectedCourse}
                onChange={handleCourseChange}
                disabled={fetchAttendanceMutation.isPending}
                className="p-1 text-sm rounded-md bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <select
                id="time-range"
                value={timeRange}
                onChange={handleTimeRangeChange}
                disabled={fetchAttendanceMutation.isPending}
                className="p-1 text-sm rounded-md bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          {!fetchAttendanceMutation.isPending &&
            !hasError &&
            !isNoRecordsFound &&
            chartData.length > 0 && (
              <QuickStats
                averageAttendance={filteredStats.averageAttendance}
                maxAttendance={filteredStats.maxAttendance}
                averageRate={filteredStats.averageRate}
                totalSessions={filteredStats.totalSessions}
                isLoading={fetchAttendanceMutation.isPending}
              />
            )}
        </CardHeader>

        <CardContent className="">
          {fetchAttendanceMutation.isPending ? (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm text-gray-500">
                Loading attendance trend...
              </p>
            </div>
          ) : hasError ? (
            <EmptyState
              icon={BarChart3}
              title="Unable to Load Trend Data"
              description="There was an error loading your attendance trend data. Please check your connection and try again."
            />
          ) : isNoRecordsFound ? (
            <EmptyState
              icon={BarChart3}
              title="No Attendance Records Found"
              description="You don't have any attendance records yet. Your attendance trends will appear here once you start conducting sessions."
            />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No Data for Selected Filters"
              description={`No attendance data available for the selected ${timeRange}${
                selectedCourse !== "all" ? ` and course ${selectedCourse}` : ""
              }. Try adjusting your filters or select a different time range.`}
            />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    fontSize={12}
                    tick={{ fill: "#6b7280" }}
                    stroke="#6b7280"
                  />
                  <Tooltip content={renderTooltipContent} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="line"
                    wrapperStyle={{ paddingBottom: "20px" }}
                  />

                  {/* Reference line for average attendance */}
                  <ReferenceLine
                    y={filteredStats.averageAttendance}
                    stroke="#3b82f6"
                    strokeDasharray="4 4"
                    opacity={0.6}
                    label={{
                      position: "insideTopRight",
                      value: `Avg: ${filteredStats.averageAttendance}`,
                      fill: "#3b82f6",
                      fontSize: 12,
                      offset: 10,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Students Present"
                    dot={{
                      r: 5,
                      fill: "#10b981",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#059669",
                      strokeWidth: 3,
                      stroke: "#fff",
                    }}
                    animationDuration={1200}
                    animationBegin={0}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Click on data points for detailed information</span>
                  <span>
                    Showing {filteredData.length} session
                    {filteredData.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOne;

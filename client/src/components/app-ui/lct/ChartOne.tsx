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
import api from "@/lib/axios";
import { TooltipProps as RechartsTooltipProps } from "recharts";

interface AttendanceRecord {
  sessionDate: string;
  attendanceCount: number;
  courseCode: string;
}
interface ChartDataPoint {
  name: string;
  attendance: number;
  courseCode: string;
  date: string;
}

const ChartOne = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("week");
  const [courses, setCourses] = useState<string[]>([]);
  const [averageAttendance, setAverageAttendance] = useState<number>(0);
  const [maxAttendance, setMaxAttendance] = useState<number>(0);

  // Format date string from "2025-05-13" to "Mon 13/05"
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = days[date.getDay()];
    const dayOfMonth = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day} ${dayOfMonth}/${month}`;
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get<AttendanceRecord[]>("attendance/trend", {
          withCredentials: true,
        });

        // Extract all unique courses
        const uniqueCourses = Array.from(
          new Set(res.data.map((entry: AttendanceRecord) => entry.courseCode))
        );
        setCourses(uniqueCourses);

        const formattedData: ChartDataPoint[] = res.data.map(
          (entry: AttendanceRecord) => ({
            name: formatDate(entry.sessionDate),
            attendance: entry.attendanceCount,
            courseCode: entry.courseCode,
            date: entry.sessionDate,
          })
        );

        // Calculate statistics
        const total = formattedData.reduce(
          (sum: number, entry: ChartDataPoint) => sum + entry.attendance,
          0
        );
        const avg =
          formattedData.length > 0
            ? Math.round(total / formattedData.length)
            : 0;
        setAverageAttendance(avg);

        const max =
          formattedData.length > 0
            ? Math.max(
                ...formattedData.map(
                  (entry: ChartDataPoint) => entry.attendance
                )
              )
            : 0;
        setMaxAttendance(max);

        setChartData(formattedData);
      } catch (err) {
        console.error("Error fetching attendance trend:", err);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

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

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  // Custom tooltip formatter
  const renderTooltipContent = (
    props: RechartsTooltipProps<number, string>
  ) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }

    const dataPoint = props.payload[0].payload as ChartDataPoint;
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-semibold">{`${dataPoint.name} - ${dataPoint.courseCode}`}</p>
        <p className="text-sm">{`Attendance: ${dataPoint.attendance} students`}</p>
      </div>
    );
  };

  return (
    <div>
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center flex-wrap space-y-2">
            <CardTitle className="text-lg font-semibold">
              Attendance Trend
            </CardTitle>
            <div className="flex space-x-3">
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="p-1 text-sm rounded-md bg-yellow-100 "
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <select
                value={timeRange}
                onChange={handleTimeRangeChange}
                className="p-1 text-sm rounded-md bg-gray-100"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex mt-2 gap-4  text-sm flex-wrap">
            <div className="bg-blue-50 p-2 rounded-md">
              <span className="font-medium">Average: </span>
              <span className="text-blue-700">
                {averageAttendance} students
              </span>
            </div>
            <div className="bg-green-50 p-2 rounded-md">
              <span className="font-medium">Highest: </span>
              <span className="text-green-700">{maxAttendance} students</span>
            </div>
            <div className="bg-purple-50 p-2 rounded-md">
              <span className="font-medium">Sessions: </span>
              <span className="text-purple-700">{filteredData.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-zinc-500">Loading chart...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : filteredData.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No attendance data available for the selected filter
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={filteredData}
                margin={{ top: 10, right: 30, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#8884d8" fontSize={13} />
                <YAxis fontSize={13} />
                <Tooltip content={renderTooltipContent} />
                <Legend verticalAlign="top" height={36} />

                {/* Reference line for average attendance */}
                <ReferenceLine
                  y={averageAttendance}
                  stroke="#8884d8"
                  strokeDasharray="3 3"
                  label={{
                    position: "insideBottomRight",
                    value: "Average",
                    fill: "#8884d8",
                    fontSize: 13,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#4ade80"
                  strokeWidth={2}
                  name="Attendance"
                  dot={{ r: 8 }}
                  activeDot={{ r: 6, fill: "#166534" }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {!loading && !error && filteredData.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Click on data points for more details. Use the filters above to
              refine your view.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOne;

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

interface AttendanceRecord {
  sessionId: string;
  courseCode: string;
  courseTitle: string;
  level: number;
  status: string;
  date: string;
  exactDate: Date | null;
}

interface ChartDataPoint {
  day: string;
  date: string;
  courseCode: string;
  present: number;
  total: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

type TimeFilterType = "week" | "month";

const ChartTwo: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("week");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("attendance/record");
        if (response.status !== 200) {
          throw new Error(`Error: ${response.status}`);
        }
        const data: AttendanceRecord[] = response.data;
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setError("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [timeFilter]);

  // Process data for chart visualization based on time filter
  const prepareChartData = (): ChartDataPoint[] => {
    if (attendanceData.length === 0) return [];

    const now = new Date();
    const filteredData = attendanceData.filter((record) => {
      const recordDate = new Date(record.date);

      if (timeFilter === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return recordDate >= oneWeekAgo;
      } else {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);
        return recordDate >= oneMonthAgo;
      }
    });

    // Format date strings for display
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };
    const groupedByDay: Record<string, ChartDataPoint> = {};
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    filteredData.forEach((record) => {
      const recordDate = new Date(record.date);
      const formattedDate = formatDate(recordDate);
      const dayKey = formattedDate;
      const courseCode = record.courseCode;

      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = {
          day: daysOfWeek[recordDate.getDay()],
          date: formattedDate,
          courseCode: courseCode,
          present: 0,
          total: 0,
        };
      } else {
        // If we have multiple course codes on the same day, combine them
        // This approach keeps the most recent course code for display
        groupedByDay[dayKey].courseCode = courseCode;
      }
      if (record.status && record.status.toLowerCase() === "present") {
        groupedByDay[dayKey].present++;
      }
      groupedByDay[dayKey].total++;
    });

    // Convert to array and sort by date
    let chartData = Object.values(groupedByDay);

    // Sort chronologically
    chartData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return chartData;
  };

  const chartData = prepareChartData();

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      const courseCode = payload[0]?.payload.courseCode || "N/A";

      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold">{`${label} (${payload[0]?.payload.day})`}</p>
          <p className="text-gray-700">{`Course: ${courseCode}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Card className="bg-white rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <CardTitle className="text-lg font-semibold flex items-center mb-2">
              Attendance Trend
            </CardTitle>

            <div className="flex space-x-2">
              <button
                onClick={() => setTimeFilter("week")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  timeFilter === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                type="button"
                aria-pressed={timeFilter === "week"}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeFilter("month")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  timeFilter === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                type="button"
                aria-pressed={timeFilter === "month"}
              >
                This Month
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">
              {error}
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No attendance data found for the selected period
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 19, left: 1, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: 10 }}
                    formatter={(value, entry) => (
                      <span className="text-sm" style={{ color: entry.color }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="present"
                    name="present"
                    fill="#10B981"
                    radius={[10, 4, 0, 0]}
                    barSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartTwo;

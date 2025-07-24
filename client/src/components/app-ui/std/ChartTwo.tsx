import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Loader2, Calendar, TrendingUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
// import { toast } from "sonner";

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

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

type TimeFilterType = "week" | "month";

const ChartTwo: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("week");

  const fetchAttendanceMutation = useMutation({
    mutationFn: async (): Promise<AttendanceRecord[]> => {
      const response = await api.get("attendance/record");
      return response.data;
    },
    onSuccess: (data) => {
      setAttendanceData(data);
    },
    onError: () => {
      // toast.error("Error fetching attendance data");
      setAttendanceData([]);
    },
  });

  useEffect(() => {
    fetchAttendanceMutation.mutate();
  }, [timeFilter]);

  // Check if it's a 404 error (no records found)
  const isNoRecordsFound =
    fetchAttendanceMutation.isError &&
    // Narrow error type to AxiosError for response property
    (fetchAttendanceMutation.error as any)?.response?.status === 404;

  // Check if it's a different error
  const hasError = fetchAttendanceMutation.isError && !isNoRecordsFound;

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

  const EmptyState = ({ title, description, icon: Icon }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <Icon className="h-12 w-12 mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-center max-w-sm">{description}</p>
    </div>
  );

  return (
    <div>
      <Card className="bg-white rounded-xl">
        <CardHeader className="card-header pb-2">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <CardTitle className="text-lg font-semibold flex items-center mb-2">
              Attendance Trend
              <TrendingUp className="h-5 w-5 ml-2 text-blue-600" />
            </CardTitle>

            <div className="flex space-x-2">
              <button
                onClick={() => setTimeFilter("week")}
                disabled={fetchAttendanceMutation.isPending}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                  timeFilter === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                type="button"
                aria-pressed={timeFilter === "week"}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeFilter("month")}
                disabled={fetchAttendanceMutation.isPending}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                  timeFilter === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                type="button"
                aria-pressed={timeFilter === "month"}
              >
                This Month
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {fetchAttendanceMutation.isPending ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : hasError ? (
            <EmptyState
              icon={Calendar}
              title="Unable to Load Data"
              description="There was an error loading your attendance data. Please try again later."
            />
          ) : isNoRecordsFound ? (
            <EmptyState
              icon={Calendar}
              title="No Attendance Records"
              description="You don't have any attendance records yet. Your attendance data will appear here once you start attending classes."
            />
          ) : chartData.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Data for Selected Period"
              description={`No attendance records found for the selected ${timeFilter}. Try selecting a different time period.`}
            />
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

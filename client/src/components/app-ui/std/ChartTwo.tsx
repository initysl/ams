import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/lib/axios";

// Types
interface AttendanceRecord {
  sessionId: string;
  courseCode: string;
  courseTitle: string;
  level: number;
  status: 'present' | 'absent' | 'late';
  date: string;
  exactDate?: Date;
}

interface ChartDataPoint {
  day: string;
  date: string;
  dateValue: Date;
  courses: string[];
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: number;
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

type TimeFilterType = "week" | "month" | "quarter";

// Constants
const TIME_FILTERS = [
  { key: "week" as const, label: "This Week", days: 7 },
  { key: "month" as const, label: "This Month", days: 30 },
  { key: "quarter" as const, label: "This Quarter", days: 90 },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS = {
  present: "#10B981",
  absent: "#EF4444", 
  late: "#F59E0B",
} as const;

// Custom Hooks
const useAttendanceData = (timeFilter: TimeFilterType) => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNoRecords, setHasNoRecords] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasNoRecords(false);
    
    try {
      const response = await api.get("/attendance/record", {
        timeout: 10000, // 10 second timeout
        params: { filter: timeFilter }
      });
      
      if (response.status === 200) {
        const responseData = Array.isArray(response.data) ? response.data : [];
        setData(responseData);
        setLastFetch(new Date());
        setHasNoRecords(responseData.length === 0);
      } else if (response.status === 404) {
        // 404 means no records found, not an error
        setData([]);
        setHasNoRecords(true);
        setLastFetch(new Date());
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err: any) {
      // Check if it's a 404 error from axios
      if (err.response?.status === 404) {
        setData([]);
        setHasNoRecords(true);
        setLastFetch(new Date());
      } else {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to load attendance data: ${errorMessage}`);
        console.error("Attendance data fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, hasNoRecords, lastFetch, refetch };
};

// Utility Functions
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const isDateInRange = (date: Date, days: number): boolean => {
  const now = new Date();
  const rangeStart = new Date();
  rangeStart.setDate(now.getDate() - days);
  return date >= rangeStart && date <= now;
};

const calculateAttendanceRate = (present: number, total: number): number => {
  return total > 0 ? Math.round((present / total) * 100) : 0;
};

// Components
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg max-w-xs">
      <p className="font-semibold text-gray-900 mb-2">
        {`${label} (${data.day})`}
      </p>
      <div className="space-y-1">
        <p className="text-sm text-gray-600">
          Courses: {data.courses.join(", ") || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Attendance Rate: {data.attendanceRate}%
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="flex flex-col justify-center items-center h-64 space-y-2">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    <p className="text-sm text-gray-500">Loading attendance data...</p>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col justify-center items-center h-64 space-y-4">
    <AlertCircle className="h-12 w-12 text-red-500" />
    <div className="text-center">
      <p className="text-red-600 font-medium">Error Loading Data</p>
      <p className="text-sm text-gray-500 mt-1">{error}</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      type="button"
    >
      <RefreshCw className="h-4 w-4" />
      <span>Retry</span>
    </button>
  </div>
);

const NoRecordsState: React.FC<{ timeFilter: TimeFilterType }> = ({ timeFilter }) => (
  <div className="flex flex-col justify-center items-center h-64 space-y-4">
    <div className="text-6xl">📋</div>
    <div className="text-center">
      <p className="text-gray-700 font-medium text-lg">No Attendance Records Found</p>
      <p className="text-gray-500 text-sm mt-2">
        You haven't recorded any attendance for the selected {timeFilter} period.
      </p>
      <p className="text-gray-400 text-xs mt-1">
        Start attending classes to see your attendance analytics here.
      </p>
    </div>
  </div>
);

const EmptyState: React.FC<{ timeFilter: TimeFilterType }> = ({ timeFilter }) => (
  <div className="flex flex-col justify-center items-center h-64 space-y-2">
    <div className="text-gray-400 text-4xl">📊</div>
    <p className="text-gray-500 text-center">
      No attendance data available for the selected {timeFilter} period
    </p>
  </div>
);

// Main Component
const AttendanceChart: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("week");
  const { data: attendanceData, loading, error, hasNoRecords, lastFetch, refetch } = useAttendanceData(timeFilter);

  const chartData = useMemo((): ChartDataPoint[] => {
    if (attendanceData.length === 0) return [];

    const filterDays = TIME_FILTERS.find(f => f.key === timeFilter)?.days ?? 7;
    
    const filteredData = attendanceData.filter((record) => {
      const recordDate = new Date(record.date);
      return isDateInRange(recordDate, filterDays);
    });

    const groupedByDay: Record<string, ChartDataPoint> = {};

    filteredData.forEach((record) => {
      const recordDate = new Date(record.date);
      const formattedDate = formatDate(recordDate);
      const dayKey = formattedDate;

      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = {
          day: DAYS_OF_WEEK[recordDate.getDay()],
          date: formattedDate,
          dateValue: recordDate,
          courses: [],
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
          attendanceRate: 0,
        };
      }

      // Track unique courses
      if (!groupedByDay[dayKey].courses.includes(record.courseCode)) {
        groupedByDay[dayKey].courses.push(record.courseCode);
      }

      // Count by status
      const status = record.status?.toLowerCase();
      switch (status) {
        case 'present':
          groupedByDay[dayKey].present++;
          break;
        case 'absent':
          groupedByDay[dayKey].absent++;
          break;
        case 'late':
          groupedByDay[dayKey].late++;
          break;
      }
      
      groupedByDay[dayKey].total++;
    });

    // Calculate attendance rates and sort
    const chartData = Object.values(groupedByDay)
      .map(item => ({
        ...item,
        attendanceRate: calculateAttendanceRate(item.present, item.total)
      }))
      .sort((a, b) => a.dateValue.getTime() - b.dateValue.getTime());

    return chartData;
  }, [attendanceData, timeFilter]);

  const handleFilterChange = useCallback((filter: TimeFilterType) => {
    setTimeFilter(filter);
  }, []);

  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Attendance Analytics
            </CardTitle>
            {lastFetch && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastFetch.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {TIME_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timeFilter === filter.key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm"
                }`}
                type="button"
                aria-pressed={timeFilter === filter.key}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : hasNoRecords ? (
          <NoRecordsState timeFilter={timeFilter} />
        ) : chartData.length === 0 ? (
          <EmptyState timeFilter={timeFilter} />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: 20 }}
                />
                <Bar
                  dataKey="present"
                  name="Present"
                  fill={STATUS_COLORS.present}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="late"
                  name="Late"
                  fill={STATUS_COLORS.late}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="absent"
                  name="Absent"
                  fill={STATUS_COLORS.absent}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
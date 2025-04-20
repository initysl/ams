
import { Card, CardTitle } from "../ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Chart = () => {
  const chartData = [
    { name: "Mon", attendance: 10 },
    { name: "Tue", attendance: 15 },
    { name: "Wed", attendance: 12 },
    { name: "Thu", attendance: 17 },
    { name: "Fri", attendance: 9 },
  ];

  return (
    <div>
      <Card className="p-5 bg-white rounded-xl shadow-md">
        <CardTitle className="mb-2">Weekly Attendance Trend</CardTitle>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#4ade80"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

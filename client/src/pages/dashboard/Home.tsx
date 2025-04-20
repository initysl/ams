import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import * as Icons from "lucide-react";
import rawCardData from "@/components/json/card.json";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type CardItem = {
  id: number;
  title: string;
  value: string;
  description: string;
  icon: keyof typeof Icons;
};

const cardData: { cards: CardItem[] } = rawCardData as { cards: CardItem[] };
const cardColors = [
  "bg-gray-200",
  "bg-green-400",
  "bg-yellow-100",
  "bg-purple-100",
];

const Icon = ({ name }: { name: keyof typeof Icons }) => {
  const LucideIcon = Icons[name];
  return LucideIcon ? (
    <LucideIcon className="h-10 w-10 text-primary bg-white shadow p-2 rounded-2xl" />
  ) : null;
};

const mockActivity = [
  { time: "08:30", activity: "Logged in" },
  { time: "09:00", activity: "Generated QR Code for CSC301" },
  { time: "10:15", activity: "Viewed Attendance Log" },
];

const chartData = [
  { name: "Mon", attendance: 10 },
  { name: "Tue", attendance: 15 },
  { name: "Wed", attendance: 12 },
  { name: "Thu", attendance: 17 },
  { name: "Fri", attendance: 9 },
];

const Home: React.FC = () => {
  const username = "Yusola";
  const today = new Date().toLocaleDateString();

  return (
    <div className="space-y-8">
      {/* Top Section with Date and Profile */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Welcome Back, @{username} 👋</h2>
          <p className="text-sm text-muted-foreground">Today is {today}</p>
        </div>
      </div>

      {/* Card Summary Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cardData.cards.map((text) => (
          <Card
            key={text.id}
            className={`bg-white shadow-md transition hover:shadow-xl rounded-xl ${
              cardColors[text.id % cardColors.length]
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {text.title}
                </CardTitle>
                <Icon name={text.icon} />
              </div>
              <CardDescription className="text-sm mt-1 text-muted-foreground">
                {text.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 font-medium">{text.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Stats Chart */}
      <Card className="p-6 bg-white rounded-xl shadow-md">
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

      {/* Extra Info Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5 bg-blue-100">
          <CardTitle className="mb-1">Today’s Attendance Status</CardTitle>
          <p className="text-sm text-gray-800">
            0 students marked present so far.
          </p>
        </Card>

        <Card className="p-5 bg-yellow-100">
          <CardTitle className="mb-1">Upcoming Events</CardTitle>
          <p className="text-sm text-gray-800">
            "Tech Seminar" scheduled for April 25.
          </p>
        </Card>

        <Card className="p-5 bg-purple-100">
          <CardTitle className="mb-1">Quick Actions</CardTitle>
          <ul className="text-sm list-disc pl-4 text-gray-800">
            <li>Generate QR Code</li>
            <li>View Attendance Log</li>
            <li>Download Attendance Log</li>
            <li>Project QR Code</li>
            <li>Download QR Code</li>
          </ul>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-5 bg-white shadow-md rounded-xl">
        <CardTitle className="mb-3">Recent Activity</CardTitle>
        <ul className="space-y-2 text-sm text-gray-800">
          {mockActivity.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.activity}</span>
              <span className="text-muted-foreground">{item.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Home;

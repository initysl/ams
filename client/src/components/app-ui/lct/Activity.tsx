import { Card, CardTitle } from "@/components/ui/card";

export const Activity = () => {
  const mockActivity = [
    { time: "08:30", activity: "Logged in" },
    { time: "09:00", activity: "Generated QR Code for CSC301" },
    { time: "10:15", activity: "Viewed Attendance Log" },
  ];

  return (
    <div>
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

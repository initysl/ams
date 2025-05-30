import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Trophy, Bell } from "lucide-react";

// Mock data for new components
const recentActivities = [
  {
    id: 1,
    action: "Attended Lecture",
    subject: "Computer Science",
    time: "2 hours ago",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    id: 2,
    action: "Missed Class",
    subject: "Mathematics",
    time: "1 day ago",
    icon: AlertCircle,
    color: "text-red-500",
  },
  {
    id: 3,
    action: "Perfect Week",
    subject: "All Classes",
    time: "1 week ago",
    icon: Trophy,
    color: "text-yellow-500",
  },
];

const Activity = () => {
  return (
    <motion.div
      className="bg-white rounded-3xl "
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
        <Bell className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50"
          >
            <div
              className={`p-2 rounded-full bg-white shadow-sm ${activity.color}`}
            >
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{activity.action}</p>
              <p className="text-sm text-gray-600">{activity.subject}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Activity;

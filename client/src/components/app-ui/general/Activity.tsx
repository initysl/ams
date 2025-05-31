import { motion } from "framer-motion";
import { CheckCircle, Trophy, Bell, BookOpen } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

// Define types for activity and attendance data
type AttendanceRecord = {
  sessionId?: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  level?: string;
  status?: string;
};

type Activity = {
  id: string;
  action: string;
  subject: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  level?: string;
  status?: string;
};

const Activity = () => {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Fetch recent attendance data
  const recentAttendanceMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get("attendance/record");
      return response.data;
    },
    onSuccess: (data) => {
      processRecentActivities(data);
    },
    onError: (error) => {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([]);
    },
  });

  // Helper function to format relative time
  const getRelativeTime = (date: string): string => {
    const now = new Date();
    const recordDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - recordDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  // Process attendance data into activities
  const processRecentActivities = (
    attendanceData: AttendanceRecord[]
  ): void => {
    if (!attendanceData || attendanceData.length === 0) {
      setRecentActivities([]);
      return;
    }

    // Sort by date (most recent first) and take the last 10 activities
    const sortedData = attendanceData
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const activities = [];

    // Add individual attendance records
    sortedData.forEach((record, index) => {
      activities.push({
        id: `attendance-${record.sessionId || index}`,
        action: "Attended Lecture",
        subject: `${record.courseCode} - ${record.courseTitle}`,
        time: getRelativeTime(record.date),
        icon: CheckCircle,
        color: "text-green-500",
        level: record.level,
        status: record.status,
      });
    });

    // Calculate streaks and achievements for recent activities
    let currentStreak = 0;
    let consecutiveDays = 0;
    const today = new Date();

    for (let i = 0; i < sortedData.length; i++) {
      const attendanceDate = new Date(sortedData[i].date);
      const daysDiff = Math.floor(
        (today.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === consecutiveDays) {
        currentStreak++;
        consecutiveDays++;
      } else {
        break;
      }
    }

    // Add streak achievement activity if applicable
    if (currentStreak >= 7) {
      activities.unshift({
        id: "streak-achievement",
        action: currentStreak >= 15 ? "Amazing Streak!" : "Great Streak!",
        subject: `${currentStreak} consecutive days`,
        time: "Ongoing",
        icon: Trophy,
        color: "text-yellow-500",
      });
    }

    // Check for perfect week (7 days in a row within the last week)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastWeekAttendance = attendanceData.filter(
      (record) => new Date(record.date) >= lastWeek
    );

    if (lastWeekAttendance.length >= 5) {
      // Assuming 5+ classes in a week is perfect
      activities.unshift({
        id: "perfect-week",
        action: "Perfect Week",
        subject: `${lastWeekAttendance.length} classes attended`,
        time: "This week",
        icon: Trophy,
        color: "text-yellow-500",
      });
    }

    // Add milestone activities based on total attendance
    const totalClasses = attendanceData.length;
    const milestones = [10, 25, 50, 100];

    milestones.forEach((milestone) => {
      if (totalClasses === milestone) {
        activities.unshift({
          id: `milestone-${milestone}`,
          action: "Milestone Reached",
          subject: `${milestone} classes completed`,
          time: getRelativeTime(sortedData[0]?.date),
          icon: Trophy,
          color: "text-purple-500",
        });
      }
    });

    // Limit to 8 activities to prevent overwhelming the UI
    setRecentActivities(activities.slice(0, 8));
  };

  // Fetch data on component mount
  useEffect(() => {
    recentAttendanceMutation.mutate();
  }, []);

  // Optional: Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      recentAttendanceMutation.mutate();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-xl"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
        <div className="flex items-center space-x-2">
          {recentAttendanceMutation.isPending && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {recentAttendanceMutation.isPending ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : recentActivities.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`p-2 rounded-full bg-white shadow-sm ${activity.color}`}
              >
                <activity.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.subject}</p>
                {activity.level && (
                  <p className="text-xs text-gray-500">
                    Level: {activity.level}
                  </p>
                )}
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No recent activities found.</p>
          <p className="text-sm">
            Start attending classes to see your activity!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Activity;

import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Calendar,
  Award,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { AxiosError } from "axios";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

type SessionRecord = {
  courseCode: string;
  sessionDate: string; // Keep for backward compatibility
  sessionDateTime?: string; // Add optional full datetime
  attendanceCount: number;
  totalCourseStudents: number;
  attendanceRate: number;
};

type LecturerActivity = {
  id: string;
  action: string;
  subject: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  metadata?: {
    attendanceCount?: number;
    courseCode?: string;
    achievementType?: string;
  };
};

const Activity = () => {
  const [recentActivities, setRecentActivities] = useState<LecturerActivity[]>(
    []
  );

  // Fetch lecturer's session data
  const lecturerSessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get("attendance/trend");
      return response.data;
    },
    onSuccess: (data) => {
      processLecturerActivities(data);
    },
    onError: () => {
      // console.error("Error fetching lecturer activities:", error); error
      setRecentActivities([]);
    },
  });

  const isNoSessionsFound =
    lecturerSessionsMutation.isError &&
    (lecturerSessionsMutation.error as AxiosError)?.response?.status === 404;
  (lecturerSessionsMutation.error as AxiosError)?.response?.status === 404;

  // Check if it's a different error
  const hasError = lecturerSessionsMutation.isError && !isNoSessionsFound;

  // Format time
  const getRelativeTime = (dateTimeString: string): string => {
    const sessionDate = new Date(dateTimeString);
    const now = new Date();

    const diffInMinutes = Math.floor(
      (now.getTime() - sessionDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
      }
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }
  };

  // Get attendance description based on attendance rate
  const getAttendanceDescription = (attendanceRate: number): string => {
    if (attendanceRate >= 80) return "Excellent turnout";
    if (attendanceRate >= 60) return "Great attendance";
    if (attendanceRate >= 40) return "Good attendance";
    if (attendanceRate >= 20) return "Moderate attendance";
    return "Low attendance";
  };

  // Get color based on attendance rate
  const getAttendanceColor = (attendanceRate: number): string => {
    if (attendanceRate >= 80) return "text-green-500";
    if (attendanceRate >= 60) return "text-blue-500";
    if (attendanceRate >= 40) return "text-yellow-500";
    return "text-orange-500";
  };

  // Process session data into lecturer activities
  const processLecturerActivities = (sessionData: SessionRecord[]): void => {
    if (!sessionData || sessionData.length === 0) {
      setRecentActivities([]);
      return;
    }

    // Sort by date (most recent first) - use full datetime if available
    const sortedData = sessionData
      .sort((a, b) => {
        const dateA = new Date(a.sessionDateTime || a.sessionDate);
        const dateB = new Date(b.sessionDateTime || b.sessionDate);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);

    const activities: LecturerActivity[] = [];

    // Add recent class sessions
    sortedData.forEach((session, index) => {
      const attendanceDescription = getAttendanceDescription(
        session.attendanceRate
      );

      activities.push({
        id: `session-${session.courseCode}-${session.sessionDate}-${index}`,
        action: "Conducted Class",
        subject: `${session.courseCode} - ${session.attendanceCount}/${session.totalCourseStudents} students (${session.attendanceRate}% - ${attendanceDescription})`,
        time: getRelativeTime(session.sessionDateTime || session.sessionDate),
        icon: Users,
        color: getAttendanceColor(session.attendanceRate),
        metadata: {
          attendanceCount: session.attendanceCount,
          courseCode: session.courseCode,
        },
      });
    });

    // Calculate achievements and insights
    const achievements = calculateLecturerAchievements(sessionData);
    activities.unshift(...achievements);

    // Limit to 8 activities
    setRecentActivities(activities.slice(0, 8));
  };

  // Calculate lecturer achievements
  const calculateLecturerAchievements = (
    sessions: SessionRecord[]
  ): LecturerActivity[] => {
    const achievements: LecturerActivity[] = [];

    // Recent high attendance rate sessions (80%+ attendance)
    const recentHighAttendance = sessions.filter((session) => {
      const sessionDate = new Date(session.sessionDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo && session.attendanceRate >= 80;
    });

    if (recentHighAttendance.length >= 3) {
      achievements.push({
        id: "high-engagement-week",
        action: "High Engagement Week",
        subject: `${recentHighAttendance.length} sessions with 80%+ attendance`,
        time: "This week",
        icon: Award,
        color: "text-purple-500",
        metadata: { achievementType: "engagement" },
      });
    }

    // Consistency achievement (lecture regularly)
    const lastWeekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.sessionDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    if (lastWeekSessions.length >= 5) {
      achievements.push({
        id: "consistent-lecture",
        action: "Consistent Lecture",
        subject: `${lastWeekSessions.length} classes this week`,
        time: "This week",
        icon: Calendar,
        color: "text-blue-500",
        metadata: { achievementType: "consistency" },
      });
    }

    // Total sessions milestone
    const totalSessions = sessions.length;
    const milestones = [10, 25, 50, 100, 200];

    milestones.forEach((milestone) => {
      if (totalSessions === milestone) {
        achievements.push({
          id: `milestone-${milestone}`,
          action: "Lecturing Milestone",
          subject: `${milestone} classes conducted`,
          time: "Achievement unlocked",
          icon: Award,
          color: "text-gold-500",
          metadata: { achievementType: "milestone" },
        });
      }
    });

    // Best attendance session recently (90%+ attendance rate)
    const bestRecentSession = sessions
      .filter((session) => {
        const sessionDate = new Date(session.sessionDate);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return sessionDate >= monthAgo;
      })
      .sort((a, b) => b.attendanceRate - a.attendanceRate)[0];

    if (bestRecentSession && bestRecentSession.attendanceRate >= 90) {
      achievements.push({
        id: "best-attendance",
        action: "Outstanding Turnout",
        subject: `${bestRecentSession.courseCode} - ${bestRecentSession.attendanceRate}% attendance`,
        time: getRelativeTime(bestRecentSession.sessionDate),
        icon: TrendingUp,
        color: "text-green-500",
        metadata: {
          achievementType: "attendance",
          courseCode: bestRecentSession.courseCode,
          attendanceCount: bestRecentSession.attendanceCount,
        },
      });
    }

    return achievements;
  };

  // Fetch data on component mount
  useEffect(() => {
    lecturerSessionsMutation.mutate();
  }, []);

  // Optional: Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      lecturerSessionsMutation.mutate();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const EmptyState = ({ title, description, icon: Icon }: EmptyStateProps) => (
    <div className="text-center py-8 text-gray-500">
      <Icon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p className="font-medium">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  );

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-sm "
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Lecture Activity
        </h2>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {lecturerSessionsMutation.isPending ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : hasError ? (
        <EmptyState
          icon={BookOpen}
          title="Unable to Load Activity"
          description="There was an error loading your lecture activity. Please try again later."
        />
      ) : isNoSessionsFound ? (
        <EmptyState
          icon={BookOpen}
          title="No Lecture Sessions Yet"
          description="You haven't conducted any classes yet. Your lecture activity will appear here once you start."
        />
      ) : recentActivities.length > 0 ? (
        <div className="space-y-4 max-h-70 overflow-y-auto">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-200 transition-colors"
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
                <p className="font-medium text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.subject}</p>
                {activity.metadata?.achievementType && (
                  <p className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1 inline-block mt-1">
                    {activity.metadata.achievementType}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Recent Activity"
          description="No recent lecture activity found. Start conducting classes to see your activity here!"
        />
      )}
    </motion.div>
  );
};

export default Activity;

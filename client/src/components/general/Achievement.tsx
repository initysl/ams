import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  Target,
  Award,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Type definitions
interface AttendanceRecord {
  sessionId: string;
  courseCode: string;
  courseTitle: string;
  level: string;
  status: string;
  date: string;
  exactDate?: Date | null;
}

interface AchievementItem {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const Achievement = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  // Fetch recent attendance data
  const recentAttendanceMutation = useMutation({
    mutationFn: async (): Promise<AttendanceRecord[]> => {
      const response = await api.get("attendance/record");
      return response.data;
    },
    onSuccess: (data: AttendanceRecord[]) => {
      calculateAchievements(data);
    },
    onError: (error) => {
      console.error("Error fetching recent attendance:", error);
      // Fallback to empty achievements or show error state
      setAchievements([]);
    },
  });

  // Calculate achievements based on attendance data
  const calculateAchievements = (attendanceData: AttendanceRecord[]): void => {
    const achievementsList: AchievementItem[] = [];

    if (!attendanceData || attendanceData.length === 0) {
      setAchievements([]);
      return;
    }

    // Sort attendance by date (most recent first)
    const sortedAttendance = attendanceData.sort(
      (a: AttendanceRecord, b: AttendanceRecord) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate streak
    let currentStreak = 0;
    let consecutiveDays = 0;
    const today = new Date();

    for (let i = 0; i < sortedAttendance.length; i++) {
      const attendanceDate = new Date(sortedAttendance[i].date);
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

    // Achievement: Consistent Learner (streak)
    if (currentStreak >= 7) {
      achievementsList.push({
        id: 1,
        title: currentStreak >= 15 ? "Dedication Master" : "Consistent Learner",
        description: `${currentStreak} days streak`,
        icon: Target,
        color: "bg-green-100 text-green-600",
      });
    }

    // Achievement: Perfect Attendance (this month)
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthAttendance = attendanceData.filter(
      (record: AttendanceRecord) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getMonth() === thisMonth &&
          recordDate.getFullYear() === thisYear
        );
      }
    );

    if (thisMonthAttendance.length >= 15) {
      // Assuming 15+ classes is good attendance
      achievementsList.push({
        id: 2,
        title: "Perfect Attendance",
        description: `${thisMonthAttendance.length} classes this month`,
        icon: Trophy,
        color: "bg-yellow-100 text-yellow-600",
      });
    }

    // Achievement: Early Bird (morning classes - assuming classes before 12pm)
    const morningClasses = attendanceData.filter((record: AttendanceRecord) => {
      const recordDate = new Date(record.date);
      return recordDate.getHours() < 12;
    });

    if (morningClasses.length >= 10) {
      achievementsList.push({
        id: 3,
        title: "Early Bird",
        description: `${morningClasses.length} morning classes attended`,
        icon: Star,
        color: "bg-blue-100 text-blue-600",
      });
    }

    // Achievement: Subject Expert (most attended subject)
    const subjectCounts: Record<string, number> = {};
    attendanceData.forEach((record: AttendanceRecord) => {
      subjectCounts[record.courseCode] =
        (subjectCounts[record.courseCode] || 0) + 1;
    });

    const mostAttendedSubject = Object.entries(subjectCounts).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0];

    if (mostAttendedSubject && (mostAttendedSubject[1] as number) >= 10) {
      achievementsList.push({
        id: 4,
        title: "Subject Expert",
        description: `${mostAttendedSubject[1]} classes in ${mostAttendedSubject[0]}`,
        icon: BookOpen,
        color: "bg-purple-100 text-purple-600",
      });
    }

    // Achievement: Active Learner (total classes)
    if (attendanceData.length >= 50) {
      achievementsList.push({
        id: 5,
        title: "Active Learner",
        description: `${attendanceData.length} total classes attended`,
        icon: Award,
        color: "bg-orange-100 text-orange-600",
      });
    }

    setAchievements(achievementsList);
  };

  // Fetch data on component mount
  useEffect(() => {
    recentAttendanceMutation.mutate();
  }, []);

  return (
    <div className="grid gap-6 grid-cols-1">
      {/* Achievements */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl p-6"
        initial={{ opacity: 0, x: 10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Achievements</h3>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>

        {recentAttendanceMutation.isPending ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : achievements.length > 0 ? (
          <div className="space-y-4">
            {achievements.map((achievement: AchievementItem) => (
              <motion.div
                key={achievement.id}
                className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: achievement.id * 0.1 }}
              >
                <div className={`p-3 rounded-full ${achievement.color}`}>
                  <achievement.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Keep attending classes to unlock achievements!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Achievement;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { FileText, Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { useAttendance } from "@/context/AttendanceContex";

const Status = () => {
  const { user } = useAuth();
  const { totalStudents, presentStudents, absentStudents, attendanceRate } =
    useAttendance();

  // Different status messages based on user role
  const getStatusMessage = () => {
    if (user?.role === "lecturer") {
      if (totalStudents === 0) {
        return "No attendance session active. Start a session to track attendance.";
      }
      return `${presentStudents} out of ${totalStudents} students are present (${attendanceRate}%)`;
    } else {
      // For students
      if (totalStudents === 0) {
        return "No active attendance session. Check back when your lecturer starts a session.";
      }
      return "Check your attendance status and session details.";
    }
  };

  const getStatusColor = () => {
    if (totalStudents === 0) return "text-gray-600";
    if (attendanceRate >= 80) return "text-green-600";
    if (attendanceRate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCardGradient = () => {
    if (totalStudents === 0) return "from-gray-50 to-gray-100 border-gray-200";
    if (attendanceRate >= 80)
      return "from-green-50 to-emerald-50 border-green-200";
    if (attendanceRate >= 60)
      return "from-yellow-50 to-amber-50 border-yellow-200";
    return "from-red-50 to-rose-50 border-red-200";
  };

  return (
    <div>
      <Card className={`bg-gradient-to-r ${getCardGradient()} shadow-sm`}>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Attendance Status
                </h2>
              </CardTitle>

              <div className="space-y-3">
                <p className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusMessage()}
                </p>

                {/* Show detailed stats for lecturers when there's data */}
                {user?.role === "lecturer" && totalStudents > 0 && (
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2 text-xs bg-white/60 px-3 py-2 rounded-lg">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Present:</span>
                      <span className="text-green-700">{presentStudents}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-white/60 px-3 py-2 rounded-lg">
                      <UserX className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Absent:</span>
                      <span className="text-red-700">{absentStudents}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-white/60 px-3 py-2 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Rate:</span>
                      <span className="text-blue-700">{attendanceRate}%</span>
                    </div>
                  </div>
                )}

                <Link to="/dashboard/attendance">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mt-3">
                    <FileText className="h-4 w-4" />
                    {user?.role === "lecturer"
                      ? "Manage Attendance"
                      : "View My Attendance"}
                  </Button>
                </Link>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg ${
                totalStudents === 0
                  ? "bg-gray-100"
                  : attendanceRate >= 80
                  ? "bg-green-100"
                  : attendanceRate >= 60
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}
            >
              {totalStudents === 0 ? (
                <Users className="h-5 w-5 text-gray-500" />
              ) : (
                <UserCheck
                  className={`h-5 w-5 ${
                    attendanceRate >= 80
                      ? "text-green-600"
                      : attendanceRate >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Status;

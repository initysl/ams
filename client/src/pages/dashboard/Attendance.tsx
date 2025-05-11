import AttendanceL from "./Lecturer/AttendanceL";
import AttendanceS from "./Student/AttendanceS";
import { useAuth } from "@/context/AuthContext";

const Attendance = () => {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === "lecturer" ? (
        <AttendanceL />
      ) : user?.role === "student" ? (
        <AttendanceS />
      ) : (
        <div>Invalid role</div>
      )}
    </div>
  );
};

export default Attendance;

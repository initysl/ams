import AttendanceL from "./Lecturer/AttendanceL";
import AttendanceS from "./Student/AttendanceS";
import { useAuth } from "@/context/AuthContext";

const Attendance = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role === "lecturer" ? (
        <AttendanceL />
      ) : user?.role === "student" ? (
        <AttendanceS />
      ) : (
        <div className="text-2xl">404</div>
      )}
    </>
  );
};

export default Attendance;

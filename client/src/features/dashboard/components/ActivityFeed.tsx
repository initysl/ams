import Activity from "@/features/dashboard/components/lecturer/Activity";
import Achievement from "@/features/dashboard/components/student/Achievement";
import { useAuth } from "@/context/AuthContext";

const ActivityFeed = () => {
  const { user } = useAuth();
  return (
    <>
      {user?.role === "lecturer" ? (
        <Activity />
      ) : user?.role === "student" ? (
        <Achievement />
      ) : (
        <div className="text-2xl">404</div>
      )}
    </>
  );
};

export default ActivityFeed;

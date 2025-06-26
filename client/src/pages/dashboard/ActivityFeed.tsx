import Activity from "@/components/app-ui/lct/Activity";
import Achievement from "@/components/app-ui/std/Achievement";
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

import { useAuth } from "@/context/AuthContext";
import ChartOne from "@/features/dashboard/components/lecturer/ChartOne";
import ChartTwo from "@/features/dashboard/components/student/ChartTwo";

const Chart = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role == "lecturer" ? (
        <ChartOne />
      ) : user?.role == "student" ? (
        <ChartTwo />
      ) : (
        <div className="text-2xl">404</div>
      )}
    </>
  );
};

export default Chart;

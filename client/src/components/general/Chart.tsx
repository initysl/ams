import { useAuth } from "@/context/AuthContext";
import ChartOne from "@/components/lctui/ChartOne";
import ChartTwo from "@/components/stdui/ChartTwo";

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

import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";

export const Status = () => {
  return (
    <div>
      <Card className="p-5 bg-blue-100">
        <CardTitle className="mb-1">Today’s Attendance Status</CardTitle>
        <p className="text-sm text-gray-800">
          0 students marked present so far.
        </p>
        <p className="text-sm text-gray-800">Download Attendance.</p>
        <Link to="/dashboard/attendance">
          <Button className=" bg-white cursor-pointer">View Attendance</Button>
        </Link>
      </Card>
    </div>
  );
};

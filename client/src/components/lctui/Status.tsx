import { Card, CardTitle } from "../ui/card";

export const Status = () => {
  return (
    <div>
      <Card className="p-5 bg-blue-100">
        <CardTitle className="mb-1">Today’s Attendance Status</CardTitle>
        <p className="text-sm text-gray-800">
          0 students marked present so far.
        </p>
      </Card>
    </div>
  );
};

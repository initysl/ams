import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardTitle } from "../ui/card";
import { useAuth } from "@/context/AuthContext";
import { FileText } from "lucide-react";

const Status = ({ totalStudents = 0 }) => {
  const { user } = useAuth();

  // Create appropriate message based on role
  const statusMessage =
    user?.role === "lecturer"
      ? `${totalStudents} students recorded in attendance database.`
      : `You are currently marked as present for today's classes.`;

  return (
    <div>
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="mb-2">Today's Attendance Status</CardTitle>
              <p className="text-sm text-gray-700 mb-2">{statusMessage}</p>
              <Link to="/dashboard/attendance">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mt-2">
                  <FileText className="h-4 w-4" />
                  View Full Attendance
                </Button>
              </Link>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Status;

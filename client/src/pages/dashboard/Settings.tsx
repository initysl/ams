import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  return (
    <div>
      <Card className="bg-white max-w-xs">
        <CardContent>
          <div className="flex flex-col items-center">
            <img
              src={
                user?.profilePicture ||
                `${import.meta.env.VITE_API_URL}/images/default.png`
              }
              className="w-32 h-32 rounded-full object-cover"
              alt="profilepic"
            />
            <div className="mt-4 text-center">
              <ul className="space-y-2">
                <li className="font-semibold">{user?.name}</li>
                <li className="font-semibold">{user?.matricNumber}</li>
                <li className="">{user?.email}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

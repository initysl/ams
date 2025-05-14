import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import * as Icons from "lucide-react";

import rawCardData from "@/components/json/card.json";
import { Status } from "@/components/lctui/Status";
import { Activity } from "@/components/lctui/Activity";
import { Chart } from "@/components/general/Chart";
import img1 from "@/assets/images/card/qrb.png";
import img2 from "@/assets/images/card/qrw.png";

import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

type CardItem = {
  id: number;
  title: string;
  value: string;
  description: string;
  icon: keyof typeof Icons;
};

const cardData: { cards: CardItem[] } = rawCardData as { cards: CardItem[] };
const cardColors = [
  "bg-gray-200",
  "bg-green-400",
  "bg-yellow-100",
  "bg-purple-100",
];

const Icon = ({ name }: { name: keyof typeof Icons }) => {
  const LucideIcon = Icons[name];
  return LucideIcon ? (
    <LucideIcon className="h-10 w-10 text-primary bg-white shadow p-2 rounded-2xl" />
  ) : null;
};

const Home: React.FC = () => {
  const [today, setToday] = React.useState(() => new Date().toLocaleString());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setToday(
        new Date().toLocaleString("en-US", {
          hour12: true,
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Top Section with Date and Profile */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome Back {user?.matricNumber}
          </h2>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
      </div>

      {/* Card Summary Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 lg:row-span-1 max-w-full rounded-xl bg-white shadow-sm">
          <div className="md:flex h-full">
            {/* Image Section */}
            <div className="md:w-1/2">
              <img
                className="h-48 w-full object-cover md:h-full md:w-full rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                src={img1}
                alt="Modern building architecture"
              />
            </div>

            {/* Text Content */}
            <div className="p-4 flex flex-col justify-center space-y-2">
              <div className="text-sm font-semibold tracking-wide text-indigo-500 uppercase mb-1">
                Your Digital Attendance Management System Solution!
              </div>
              <Link
                to={"/dashboard/home"}
                className="block text-xl leading-tight font-bold text-gray-900 hover:underline"
              >
                Manage Your Attendance with Ease
              </Link>
              <p className="mt-2 text-gray-600">
                A fully digital attendance management system that allows you to
                manage your attendance with ease. No more paper trails or manual
                tracking. With our system, you can easily track attendance,
                generate reports, and manage your team all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Cards */}
        {cardData.cards.map((text) => (
          <Card
            key={text.id}
            className={`bg-white shadow-md hover:shadow-xl transition rounded-xl p-4 flex flex-col justify-between ${
              cardColors[text.id % cardColors.length]
            }`}
          >
            <CardHeader className="p-0 mb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold">
                  {text.title}
                </CardTitle>
                <Icon name={text.icon} className="text-indigo-500" />
              </div>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {text.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-gray-700 font-medium">{text.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Stats Chart */}
      <Chart />
      {/* Extra Info Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Status />
        <Card className="p-5 bg-yellow-100">
          <CardTitle className="mb-1">Upcoming Events</CardTitle>
          <p className="text-sm text-gray-800">
            "Tech Seminar" scheduled for April 25.
          </p>
        </Card>
      </div>
      <Activity />
    </div>
  );
};

export default Home;

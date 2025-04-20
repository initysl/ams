import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import * as Icons from "lucide-react";
import rawCardData from "@/components/json/card.json";

// Define TypeScript type for each card item
type CardItem = {
  id: number;
  title: string;
  value: string;
  description: string;
  icon: keyof typeof Icons;
};

// Cast the JSON import with proper typing
const cardData: { cards: CardItem[] } = rawCardData as { cards: CardItem[] };

const Icon = ({ name }: { name: keyof typeof Icons }) => {
  const LucideIcon = Icons[name];
  return LucideIcon ? (
    <LucideIcon className="h-10 w-10 text-primary bg-white shadow p-2 rounded-2xl" />
  ) : null;
};

const Home: React.FC = () => {
  return (
    <div>
      <Card className=" bg-green-700 text-white p-10 mb-5">
        <h2 className="font-bold text-2xl">Welcome Back @name</h2>
        <div>
          <p>Your ultimate attendance management solution</p>
        </div>
      </Card>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cardData.cards.map((text) => (
          <Card key={text.id} className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>{text.title}</CardTitle>
                <Icon name={text.icon} />
              </div>
              <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 font-semibold">{text.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;

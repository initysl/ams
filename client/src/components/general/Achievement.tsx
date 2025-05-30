import { motion } from "framer-motion";
import { Trophy, Star, Target } from "lucide-react";

const achievements = [
  {
    id: 1,
    title: "Perfect Attendance",
    description: "100% attendance this month",
    icon: Trophy,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 2,
    title: "Early Bird",
    description: "Never missed morning classes",
    icon: Star,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    title: "Consistent Learner",
    description: "15 days streak",
    icon: Target,
    color: "bg-green-100 text-green-600",
  },
];

const Achievement = () => {
  return (
    <div className="grid gap-6 grid-cols-1 ">
      {/* Achievements */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl p-6"
        initial={{ opacity: 0, x: 10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Achievements</h3>
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50"
              whileHover={{ scale: 1.02 }}
            >
              <div className={`p-3 rounded-full ${achievement.color}`}>
                <achievement.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {achievement.title}
                </p>
                <p className="text-sm text-gray-600">
                  {achievement.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Achievement;

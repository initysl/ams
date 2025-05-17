import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of our context data
interface AttendanceContextType {
  totalStudents: number;
  updateTotalStudents: (count: number) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider = ({ children }: AttendanceProviderProps) => {
  const [totalStudents, setTotalStudents] = useState<number>(0);

  // Function to update total students count
  const updateTotalStudents = (count: number): void => {
    setTotalStudents(count);
  };

  return (
    <AttendanceContext.Provider
      value={{
        totalStudents,
        updateTotalStudents,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

// Custom hook to use the context
export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};

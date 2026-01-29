import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of our context data
interface AttendanceContextType {
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendanceRate: number;

  updateAttendanceStats: (present: number, total: number) => void;
  resetAttendanceStats: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined
);

interface AttendanceProviderProps {
  children: ReactNode;
}

export const AttendanceProvider = ({ children }: AttendanceProviderProps) => {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [presentStudents, setPresentStudents] = useState<number>(0);

  // Calculated values
  const absentStudents = totalStudents - presentStudents;
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

  // Function to update attendance statistics
  const updateAttendanceStats = (present: number, total: number): void => {
    setPresentStudents(present);
    setTotalStudents(total);
  };

  // Function to reset attendance statistics
  const resetAttendanceStats = (): void => {
    setPresentStudents(0);
    setTotalStudents(0);
  };

  return (
    <AttendanceContext.Provider
      value={{
        totalStudents,
        presentStudents,
        absentStudents,
        attendanceRate,
        updateAttendanceStats,
        resetAttendanceStats,
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

export type CourseData = {
  courseCode: string;
  courseTitle: string;
  level: string;
  duration: string;
  sessionTime: string;
};

export type AttendanceResponse = {
  success: boolean;
  message?: string;
  requiresConfirmation?: boolean;
  courseData?: CourseData;
};

export type LectureSession = {
  _id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
};

export type LecturerAttendanceRecord = {
  name: string;
  matricNumber: string;
  courseTitle: string;
  courseCode: string;
  level: string;
  status: string;
  date: string | number;
};

export type AttendanceReportResponse = {
  report: LecturerAttendanceRecord[];
  sessionData: {
    totalCourseStudents: number;
    attendanceRate: number;
    courseCode: string;
    courseTitle: string;
    level: string;
    sessionStart: string;
    sessionEnd: string;
  };
};

export type StudentAttendanceRecord = {
  courseTitle: string;
  courseCode: string;
  level: string;
  status: "present";
  date: string | number;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  professor: string;
  schedule: string;
  room: string;
  credits: number;
  color: string;
}

export type Assignment = {
  id: string;
  courseCode: string;
  title: string;
  dueDate: string;
  type: 'assignment' | 'exam' | 'project';
  status: 'pending' | 'in-progress' | 'completed';
}

export type ScheduleEvent = {
  id: string;
  title: string;
  type: 'class' | 'exam' | 'event' | 'office-hours';
  startTime: string;
  endTime: string;
  location: string;
  color: string;
  day: number;
}

export type Grade = {
  courseCode: string;
  courseName: string;
  grade: string | number;
  credits: number;
}
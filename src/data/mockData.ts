import type { Course, Assignment, ScheduleEvent, Grade } from '../types/index.js';

export const courses: Course[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    professor: 'Dr. Sarah Johnson',
    schedule: 'Mon, Wed 10:00-11:30',
    room: 'Science Building A-201',
    credits: 6,
    color: '#0066cc'
  },
  {
    id: '2',
    code: 'MATH201',
    name: 'Linear Algebra',
    professor: 'Prof. Michael Chen',
    schedule: 'Tue, Thu 13:00-14:30',
    room: 'Math Building M-105',
    credits: 6,
    color: '#28a745'
  },
  {
    id: '3',
    code: 'PHY101',
    name: 'Physics I: Mechanics',
    professor: 'Dr. Emma Williams',
    schedule: 'Mon, Wed 14:00-15:30',
    room: 'Physics Lab P-303',
    credits: 6,
    color: '#ff6b35'
  },
  {
    id: '4',
    code: 'ENG102',
    name: 'Academic Writing',
    professor: 'Prof. James Anderson',
    schedule: 'Fri 10:00-12:30',
    room: 'Humanities H-102',
    credits: 3,
    color: '#9c27b0'
  }
];

export const assignments: Assignment[] = [
  {
    id: '1',
    courseCode: 'CS101',
    title: 'Programming Assignment 3',
    dueDate: '2025-10-05',
    type: 'assignment',
    status: 'in-progress',
    isAllDay: true
  },
  {
    id: '2',
    courseCode: 'MATH201',
    title: 'Problem Set 5',
    dueDate: '2025-10-03',
    type: 'assignment',
    status: 'pending',
    isAllDay: true
  },
  {
    id: '3',
    courseCode: 'PHY101',
    title: 'Lab Report: Projectile Motion',
    dueDate: '2025-10-07',
    type: 'project',
    status: 'pending',
    isAllDay: true
  },
  {
    id: '4',
    courseCode: 'CS101',
    title: 'Midterm Exam',
    dueDate: '2025-10-15',
    type: 'exam',
    status: 'pending',
    isAllDay: true
  },
  {
    id: '5',
    courseCode: 'ENG102',
    title: 'Essay Draft 1',
    dueDate: '2025-10-04',
    type: 'assignment',
    status: 'completed',
    isAllDay: true
  }
];

export const scheduleEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'CS101 - Intro to CS',
    type: 'class',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Science A-201',
    color: '#0066cc',
    day: 1 // Monday
  },
  {
    id: '2',
    title: 'CS101 - Intro to CS',
    type: 'class',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Science A-201',
    color: '#0066cc',
    day: 3 // Wednesday
  },
  {
    id: '3',
    title: 'MATH201 - Linear Algebra',
    type: 'class',
    startTime: '13:00',
    endTime: '14:30',
    location: 'Math M-105',
    color: '#28a745',
    day: 2 // Tuesday
  },
  {
    id: '4',
    title: 'MATH201 - Linear Algebra',
    type: 'class',
    startTime: '13:00',
    endTime: '14:30',
    location: 'Math M-105',
    color: '#28a745',
    day: 4 // Thursday
  },
  {
    id: '5',
    title: 'PHY101 - Physics',
    type: 'class',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Physics P-303',
    color: '#ff6b35',
    day: 1 // Monday
  },
  {
    id: '6',
    title: 'PHY101 - Physics',
    type: 'class',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Physics P-303',
    color: '#ff6b35',
    day: 3 // Wednesday
  },
  {
    id: '7',
    title: 'ENG102 - Academic Writing',
    type: 'class',
    startTime: '10:00',
    endTime: '12:30',
    location: 'Humanities H-102',
    color: '#9c27b0',
    day: 5 // Friday
  },
  {
    id: '8',
    title: 'Prof. Johnson Office Hours',
    type: 'office-hours',
    startTime: '15:00',
    endTime: '16:00',
    location: 'Science A-210',
    color: '#17a2b8',
    day: 2 // Tuesday
  }
];

export const grades: Grade[] = [
  { courseCode: 'CS101', courseName: 'Intro to Computer Science', grade: 8.5, credits: 6 },
  { courseCode: 'MATH201', courseName: 'Linear Algebra', grade: 7.8, credits: 6 },
  { courseCode: 'PHY101', courseName: 'Physics I', grade: 8.0, credits: 6 },
  { courseCode: 'ENG102', courseName: 'Academic Writing', grade: 9.0, credits: 3 }
];
// Frontend course/stream configuration for the Profile page.
// Mirrors base44/shared/courseConfig.ts but in plain JS for the client bundle.

export const COURSES = [
  'B.Tech', 'B.E.', 'BCA', 'B.Sc', 'B.Com', 'B.A.',
  'M.Tech', 'MCA', 'MBA', 'M.Sc', 'Diploma', 'Other'
];

export const COURSE_STREAMS = {
  'B.Tech': ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'AI & ML', 'Data Science', 'Cyber Security', 'IoT', 'Robotics', 'Chemical', 'Biotech', 'All of them'],
  'B.E.': ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'AI & ML', 'Data Science', 'Cyber Security', 'IoT', 'Robotics', 'Chemical', 'Biotech', 'All of them'],
  'BCA': ['Computer Science', 'IT', 'Data Science', 'Cyber Security'],
  'B.Sc': ['Physics', 'Chemistry', 'Maths', 'CS', 'IT'],
  'B.Com': ['Accounting', 'Finance', 'Taxation', 'Business Analytics'],
  'B.A.': ['English', 'History', 'Political Science', 'Economics', 'Psychology'],
  'M.Tech': ['CSE', 'ECE', 'ME', 'CE', 'EE'],
  'MCA': ['Computer Science', 'IT', 'Data Science', 'Cyber Security'],
  'MBA': ['Finance', 'Marketing', 'HR', 'Operations', 'IT'],
  'M.Sc': ['Physics', 'Chemistry', 'Maths', 'CS', 'IT'],
  'Diploma': ['CSE', 'ECE', 'ME', 'CE', 'EE'],
  'Other': [],
};

export function streamsForCourse(course) {
  return COURSE_STREAMS[course] || [];
}
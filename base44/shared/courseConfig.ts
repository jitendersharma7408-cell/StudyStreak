// Shared course/stream configuration for challenge question generation.
// COURSE_STREAMS maps a course to its available streams/branches.
// STREAM_SUBJECTS maps a stream to the subjects used to filter QuestionPapers.
// null means "all subjects" (no subject filtering).

export const COURSES = [
  'B.Tech', 'B.E.', 'BCA', 'B.Sc', 'B.Com', 'B.A.',
  'M.Tech', 'MCA', 'MBA', 'M.Sc', 'Diploma', 'Other'
] as const;

export const COURSE_STREAMS: Record<string, string[]> = {
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

export const STREAM_SUBJECTS: Record<string, string[] | null> = {
  // Engineering streams — includes basic first-year subjects common to all
  CSE: ['Operating Systems', 'Database Management Systems', 'Data Structures & Algorithms', 'Computer Networks', 'Digital Electronics', 'Engineering Mathematics-I', 'Engineering Physics', 'Basic Electronics Engineering', 'Basic Electrical Engineering', 'Artificial Intelligence', 'Statistics'],
  IT: ['Operating Systems', 'Database Management Systems', 'Data Structures & Algorithms', 'Computer Networks', 'Software Engineering', 'Web Technologies', 'Engineering Mathematics-I', 'Basic Electronics Engineering', 'Basic Electrical Engineering', 'Statistics'],
  ECE: ['Digital Electronics', 'Network Analysis & Synthesis', 'Computer Networks', 'Engineering Mathematics-I', 'Engineering Physics', 'Basic Electronics Engineering', 'Basic Electrical Engineering'],
  EE: ['Network Analysis & Synthesis', 'Electrical Machines', 'Digital Electronics', 'Engineering Mathematics-I', 'Engineering Physics', 'Basic Electronics Engineering', 'Basic Electrical Engineering'],
  ME: ['Thermodynamics', 'Engineering Mechanics', 'Engineering Physics', 'Engineering Mathematics-I', 'Basic Electrical Engineering', 'Fluid Mechanics'],
  CE: ['Structural Analysis', 'Engineering Mechanics', 'Engineering Physics', 'Engineering Mathematics-I', 'Basic Electrical Engineering', 'Fluid Mechanics'],
  'AI & ML': ['Operating Systems', 'Database Management Systems', 'Data Structures & Algorithms', 'Machine Learning', 'Artificial Intelligence', 'Computer Networks', 'Engineering Mathematics-I', 'Basic Electronics Engineering', 'Basic Electrical Engineering', 'Statistics'],
  'Data Science': ['Operating Systems', 'Database Management Systems', 'Data Structures & Algorithms', 'Machine Learning', 'Statistics', 'Engineering Mathematics-I', 'Basic Electronics Engineering', 'Basic Electrical Engineering'],
  'Cyber Security': ['Operating Systems', 'Computer Networks', 'Database Management Systems', 'Cryptography', 'Network Security', 'Engineering Mathematics-I', 'Basic Electronics Engineering', 'Basic Electrical Engineering'],
  IoT: ['Digital Electronics', 'Computer Networks', 'Embedded Systems', 'Engineering Mathematics-I', 'Engineering Physics', 'Basic Electronics Engineering', 'Basic Electrical Engineering'],
  Robotics: ['Engineering Mechanics', 'Digital Electronics', 'Control Systems', 'Engineering Mathematics-I', 'Engineering Physics', 'Basic Electronics Engineering', 'Basic Electrical Engineering'],
  Chemical: ['Thermodynamics', 'Chemical Engineering', 'Engineering Mathematics-I', 'Basic Electrical Engineering', 'Fluid Mechanics'],
  Biotech: ['Engineering Physics', 'Biotechnology', 'Engineering Mathematics-I', 'Organic Chemistry', 'Basic Electronics Engineering', 'Basic Electrical Engineering'],
  // Non-engineering streams
  'Computer Science': ['Programming', 'Database Management Systems', 'Data Structures & Algorithms', 'Operating Systems', 'Computer Networks'],
  Physics: ['Physics', 'Mechanics', 'Electromagnetism', 'Quantum Mechanics'],
  Chemistry: ['Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
  Maths: ['Mathematics', 'Algebra', 'Calculus', 'Statistics'],
  CS: ['Programming', 'Database Management Systems', 'Data Structures & Algorithms', 'Operating Systems'],
  Accounting: ['Financial Accounting', 'Corporate Accounting', 'Business Law', 'Taxation'],
  Finance: ['Financial Accounting', 'Corporate Finance', 'Financial Markets', 'Business Statistics'],
  Taxation: ['Taxation', 'Corporate Accounting', 'Business Law', 'Financial Accounting'],
  'Business Analytics': ['Statistics', 'Data Analysis', 'Business Intelligence', 'Programming'],
  English: ['English Literature', 'Linguistics', 'Literary Criticism', 'Communication Skills'],
  History: ['History', 'Indian History', 'World History', 'Historiography'],
  'Political Science': ['Political Science', 'Indian Constitution', 'International Relations', 'Public Administration'],
  Economics: ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Statistics'],
  Psychology: ['Psychology', 'Social Psychology', 'Abnormal Psychology', 'Research Methods'],
  Marketing: ['Marketing Management', 'Consumer Behaviour', 'Digital Marketing', 'Business Strategy'],
  HR: ['Human Resource Management', 'Organizational Behaviour', 'Labour Laws', 'Training & Development'],
  Operations: ['Operations Management', 'Supply Chain Management', 'Project Management', 'Quality Management'],
  Other: null,
};

// Exact per-semester subject lists. When a course/stream/semester entry exists here,
// it is the authoritative subject set (used even when no QuestionPapers exist).
export const SEMESTER_SUBJECTS: Record<string, string[]> = {
  'B.Com|Accounting|Semester 1': ['Financial Accounting', 'Business Economics', 'Business Law', 'Business Mathematics & Statistics'],
  'B.Com|Accounting|Semester 2': ['Corporate Accounting', 'Cost Accounting', 'Company Law', 'Macro Economics'],
};

export function getSemesterSubjects(course: string | undefined, stream: string | undefined, semester: string | undefined): string[] | null {
  return SEMESTER_SUBJECTS[`${course}|${stream || ''}|${semester}`] || null;
}

/**
 * Returns the list of subjects for a given course + stream combination.
 * If stream is "All of them", returns the union of all subjects across
 * all streams of that course.
 * Returns null to indicate "all subjects" (no filtering).
 */
export function getSubjectsForCourseStream(course: string | undefined, stream: string | undefined): string[] | null {
  if (!course) return null;
  if (stream === 'All of them') {
    const streams = COURSE_STREAMS[course] || [];
    const allSubjects = new Set<string>();
    for (const s of streams) {
      if (s === 'All of them') continue;
      const subs = STREAM_SUBJECTS[s];
      if (subs) subs.forEach(sub => allSubjects.add(sub));
    }
    return allSubjects.size > 0 ? Array.from(allSubjects) : null;
  }
  if (!stream) return null;
  return STREAM_SUBJECTS[stream] ?? null;
}

/**
 * Returns true if the given course has specific stream options
 * (i.e., COURSE_STREAMS[course] is non-empty).
 */
export function courseHasStreams(course: string | undefined): boolean {
  return !!course && (COURSE_STREAMS[course] || []).length > 0;
}
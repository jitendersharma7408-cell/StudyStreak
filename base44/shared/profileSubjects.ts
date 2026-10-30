// Single source of truth for "which subjects belong to a course/stream/semester".
// Used by both the daily challenge (question generation) and focus topics.
import { courseHasStreams, getSubjectsForCourseStream, getSemesterSubjects } from './courseConfig.ts';

export function isProfileComplete(course, stream, semester) {
  return !!course && !!semester && (!courseHasStreams(course) || !!stream);
}

// QuestionPaper records for this profile: same semester, restricted to the profile's subjects.
export async function getProfilePapers(base44, course, stream, semester) {
  let papers = await base44.entities.QuestionPaper.filter({ semester });
  const subjects = getSemesterSubjects(course, stream, semester) || getSubjectsForCourseStream(course, stream);
  if (subjects && papers.length > 0) {
    const lowerSubs = subjects.map(s => s.toLowerCase());
    papers = papers.filter(p => p.subject && lowerSubs.includes(p.subject.toLowerCase()));
  }
  return papers;
}

// Subject names for this profile: the explicit semester mapping if one exists,
// otherwise the unique subjects present in the profile's papers.
export async function getProfileSubjects(base44, course, stream, semester) {
  const mapped = getSemesterSubjects(course, stream, semester);
  if (mapped) return mapped;
  const papers = await getProfilePapers(base44, course, stream, semester);
  return [...new Set(papers.map(p => p.subject))];
}
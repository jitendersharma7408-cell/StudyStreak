import React from 'react';
import { Link } from 'react-router-dom';
import { NotebookTabs, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/study/SectionHeading';
const cards = [
  { title: 'Topic Notes', description: 'Short notes, deeper explanations, exam points and important questions.', to: '/notes', icon: NotebookTabs, color: 'bg-study-accent-bg' },
  { title: 'Study Material', description: 'Subject-wise lessons and practice prompts for your next revision session.', to: '/material', icon: BookOpen, color: 'bg-study-purple-bg' },
  { title: 'Ask AI', description: 'Ask a question and get a simple step-by-step explanation with an example.', to: '/ask-ai', icon: Sparkles, color: 'bg-study-orange-bg' }
];
export default function Learn() {
  return <div>
    <SectionHeading eyebrow="Learn your way" title="Make it click." description="Pick a subject, revisit the essentials, or ask a question when you're stuck." />
    <div className="grid md:grid-cols-3 gap-4">
      {cards.map(({ title, description, to, icon: Icon, color }) =>
        <Link key={title} to={to} className={`select-none ${color} rounded-3xl p-6 min-h-56 flex flex-col hover:shadow-md transition-shadow`}>
          <Icon size={29} className="select-none" />
          <h2 className="text-xl font-black mt-7">{title}</h2>
          <p className="text-sm text-muted-foreground mt-2 flex-1">{description}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">Open <ArrowRight size={16} className="select-none" /></span>
        </Link>
      )}
    </div>
  </div>;
}
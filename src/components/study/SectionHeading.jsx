import React from 'react';
export default function SectionHeading({ eyebrow, title, description }) {
  return <div className="mb-7">
    <p className="select-none text-xs uppercase tracking-[.2em] font-extrabold text-study-accent">{eyebrow}</p>
    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">{title}</h1>
    {description && <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>}
  </div>;
}
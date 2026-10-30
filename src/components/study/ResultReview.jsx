import React from 'react';
export default function ResultReview({ review }) {
  return <div className="space-y-3">
    {review.map((item, i) =>
      <div key={i} className="bg-card border border-border rounded-2xl p-5">
        <div className="flex justify-between gap-3">
          <p className="font-semibold">{i + 1}. {item.text}</p>
          <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg h-fit ${item.is_correct ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
            {item.is_correct ? 'Correct' : 'Wrong'}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Your answer: <b>{item.selected}</b> · Correct answer: <b>{item.correct}</b></p>
        <p className="mt-2 text-sm text-muted-foreground">{item.explanation}</p>
      </div>
    )}
  </div>;
}
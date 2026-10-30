export const tiers = [
  ...['I','II','III'].map(n => ({ name: `Bronze ${n}`, size: 5, icon: 'Medal' })),
  ...['I','II','III'].map(n => ({ name: `Silver ${n}`, size: 5, icon: 'Award' })),
  ...['I','II','III','IV'].map(n => ({ name: `Gold ${n}`, size: 5, icon: 'Trophy' })),
  ...['I','II','III','IV'].map(n => ({ name: `Platinum ${n}`, size: 5, icon: 'Shield' })),
  ...['I','II','III','IV'].map(n => ({ name: `Diamond ${n}`, size: 5, icon: 'Gem' })),
  { name: 'Heroic', size: 25, icon: 'Flame' },
  { name: 'Grandmaster', size: 50, icon: 'Crown' }
];
export function rankFor(stars = 0) {
  let start = 0;
  for (const tier of tiers) {
    if (stars < start + tier.size) return { name: tier.name, icon: tier.icon, into: stars - start, size: tier.size, next: start + tier.size, ultimate: false };
    start += tier.size;
  }
  return { name: 'Grandmaster', icon: 'Crown', into: stars - start, size: 50, next: start, ultimate: true };
}
export function liveStreak(progress) {
  if (!progress?.last_completed_day) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return [today, yesterday].includes(progress.last_completed_day) ? progress.streak : 0;
}
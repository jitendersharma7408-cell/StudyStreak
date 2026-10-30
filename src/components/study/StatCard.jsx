import React from 'react';
export default function StatCard({ icon: Icon, label, value, detail, color = 'bg-card' }) {
  return <div className={`${color} rounded-2xl border border-border p-5 shadow-sm`}>
    <div className="flex items-center justify-between text-muted-foreground text-sm font-medium">
      <span className="select-none">{label}</span>
      {Icon && <Icon size={19} className="select-none" />}
    </div>
    <div className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{value}</div>
    {detail && <p className="text-xs text-muted-foreground mt-2">{detail}</p>}
  </div>;
}
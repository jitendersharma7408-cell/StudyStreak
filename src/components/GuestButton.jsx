import React from 'react';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { enterGuest } from '@/lib/guest';

export default function GuestButton() {
  return (
    <Button type="button" variant="secondary" className="select-none w-full h-12 text-sm font-medium mb-3" onClick={enterGuest}>
      <UserRound className="w-4 h-4 mr-2" />
      Continue as Guest
    </Button>
  );
}
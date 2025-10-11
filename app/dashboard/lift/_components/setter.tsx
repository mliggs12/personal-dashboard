import React, { useState } from 'react'
import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Setter() {
  const [goal, setGoal] = useState<number>(85.0);

  function onClick(adjustment: number) {
    setGoal(goal + adjustment);
  }

  return (
    <div>
      <div className="weight-setter">
        <div className="heading">WEIGHT (lbs)</div>
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="secondary"
            size="lg"
            className="rounded-none"
            onClick={() => onClick(-10)}
          // disabled={goal <= 200}
          >
            <Minus />
            <span className="sr-only">Decrease</span>
          </Button>
          <Input
            value={goal.toFixed(1)}
            onChange={(event) => setGoal(parseFloat(event.target.value))}
            className="border-0 border-b-2 border-primary focus-visible:ring-0 focus-visible:ring-offset-0 text-center text-3xl font-semibold w-32">
          </Input>
          <Button
            variant="secondary"
            size="lg"
            className="rounded-none"
            onClick={() => onClick(10)}
          // disabled={goal >= 400}
          >
            <Plus />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="reps-setter">
        <div className="heading">REPS</div>
        <div className="jimmy"></div>
      </div>
    </div>
  )
}

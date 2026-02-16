import { DailyCardState } from './DailyCardState';

export interface DailyCardProps {
  state: DailyCardState;
  streak: Streak;
  xpState: XPState;
  onStart: (opts?: { duration?: number; difficulty?: string }) => void;
  onComplete: (result: SessionResult) => void;
  onOpenDetails?: () => void;
  animate?: boolean;
  assignedDrill?: Drill;
}
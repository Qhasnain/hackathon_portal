import React from 'react';
import { HackathonStatus } from '@/services/hackathon.service';

interface StatusBadgeProps {
  status: HackathonStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case HackathonStatus.UPCOMING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case HackathonStatus.REGISTRATION_OPEN:
        return 'bg-green-100 text-green-800 border-green-200';
      case HackathonStatus.SUBMISSION_OPEN:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case HackathonStatus.CLOSED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (s: string) => s.replace('_', ' ');

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStyles()}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;

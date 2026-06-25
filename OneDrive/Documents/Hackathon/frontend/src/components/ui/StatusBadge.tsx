import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      // Hackathon statuses
      case 'UPCOMING':
      case 'SUBMITTED':
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REGISTRATION_OPEN':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUBMISSION_OPEN':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CLOSED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DRAFT':
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

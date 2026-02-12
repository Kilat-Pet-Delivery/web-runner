export function formatMYR(cents: number): string {
  return `RM ${(cents / 100).toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    requested: 'Requested',
    accepted: 'Accepted',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

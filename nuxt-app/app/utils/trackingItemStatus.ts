export type TrackingItemStatus =
  | 'new'
  | 'receivedAtWarehouse'
  | 'packing'
  | 'boxed'
  | 'delivering'
  | 'delivered'

export function getStatusLabel(status: TrackingItemStatus | string): string {
  const labels: Record<string, string> = {
    new: 'New',
    receivedAtWarehouse: 'Received at Warehouse',
    packing: 'Packing',
    boxed: 'Boxed',
    delivering: 'Delivering',
    delivered: 'Delivered'
  }
  return labels[status] || status
}

export function getStatusColor(status: TrackingItemStatus | string): string {
  const colors: Record<string, string> = {
    new: 'neutral',
    receivedAtWarehouse: 'info',
    packing: 'warning',
    boxed: 'primary',
    delivering: 'secondary',
    delivered: 'success'
  }
  return colors[status] || 'neutral'
}

export function getStatusBadgeText(status: TrackingItemStatus | string): string {
  return `Status: ${getStatusLabel(status)}`
}

export function getCurrentStatus(item: any): TrackingItemStatus {
  if (!item) return 'new'
  if (item.delivered_at) return 'delivered'
  if (item.delivering_at) return 'delivering'
  if (item.boxed_at) return 'boxed'
  if (item.packing_at) return 'packing'
  if (item.received_at_warehouse_at) return 'receivedAtWarehouse'
  return 'new'
}

export function getStatusUpdatedAt(item: any, status: TrackingItemStatus): string | null {
  if (!item) return null

  switch (status) {
    case 'delivered':
      return item.delivered_at
    case 'delivering':
      return item.delivering_at
    case 'boxed':
      return item.boxed_at
    case 'packing':
      return item.packing_at
    case 'receivedAtWarehouse':
      return item.received_at_warehouse_at
    default:
      return item.created_at
  }
}

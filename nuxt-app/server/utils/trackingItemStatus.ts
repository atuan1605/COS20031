export enum TrackingItemStatus {
  NEW = 'new',
  RECEIVED_AT_WAREHOUSE = 'receivedAtWarehouse',
  PACKING = 'packing',
  BOXED = 'boxed',
  CHANGING_WAREHOUSE = 'changingWarehouse',
  CHANGED_WAREHOUSE = 'changedWarehouse',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
}

export const STATUS_POWER = {
  [TrackingItemStatus.NEW]: 0,
  [TrackingItemStatus.RECEIVED_AT_WAREHOUSE]: 1,
  [TrackingItemStatus.PACKING]: 2,
  [TrackingItemStatus.BOXED]: 3,
  [TrackingItemStatus.CHANGING_WAREHOUSE]: 4,
  [TrackingItemStatus.CHANGED_WAREHOUSE]: 5,
  [TrackingItemStatus.DELIVERING]: 6,
  [TrackingItemStatus.DELIVERED]: 7,
}

// Get current status based on timestamps
export function getTrackingItemStatus(item: any): TrackingItemStatus {
  if (item.delivered_at) {
    return TrackingItemStatus.DELIVERED
  }
  if (item.delivering_at) {
    return TrackingItemStatus.DELIVERING
  }
  if (item.changed_warehouse_at) {
    return TrackingItemStatus.CHANGED_WAREHOUSE
  }
  if (item.changing_warehouse_at) {
    return TrackingItemStatus.CHANGING_WAREHOUSE
  }
  if (item.boxed_at) {
    return TrackingItemStatus.BOXED
  }
  if (item.packing_at) {
    return TrackingItemStatus.PACKING
  }
  if (item.received_at_warehouse_at) {
    return TrackingItemStatus.RECEIVED_AT_WAREHOUSE
  }
  return TrackingItemStatus.NEW
}

// Get status updated timestamp
export function getStatusUpdatedAt(item: any): Date | null {
  const status = getTrackingItemStatus(item)

  switch (status) {
    case TrackingItemStatus.RECEIVED_AT_WAREHOUSE:
      return item.received_at_warehouse_at
    case TrackingItemStatus.PACKING:
      return item.packing_at
    case TrackingItemStatus.BOXED:
      return item.boxed_at
    case TrackingItemStatus.CHANGING_WAREHOUSE:
      return item.changing_warehouse_at
    case TrackingItemStatus.CHANGED_WAREHOUSE:
      return item.changed_warehouse_at
    case TrackingItemStatus.DELIVERING:
      return item.delivering_at
    case TrackingItemStatus.DELIVERED:
      return item.delivered_at
    default:
      return item.created_at
  }
}

interface StatusUpdateResult {
  updates: Record<string, Date | null>
  payload?: {
    trackingNumber: string
    status: TrackingItemStatus
    timestamp: Date
  }
}

// Move tracking item to new status
export function moveToStatus(
  currentItem: any,
  newStatus: TrackingItemStatus
): StatusUpdateResult {
  const currentStatus = getTrackingItemStatus(currentItem)
  const now = new Date()

  // No change needed
  if (currentStatus === newStatus) {
    return { updates: {} }
  }

  const updates: Record<string, Date | null> = {}
  let payload: StatusUpdateResult['payload'] = undefined

  switch (`${currentStatus}-${newStatus}`) {
    // From NEW
    case `${TrackingItemStatus.NEW}-${TrackingItemStatus.RECEIVED_AT_WAREHOUSE}`:
      updates.received_at_warehouse_at = now
      payload = {
        trackingNumber: currentItem.tracking_number,
        status: newStatus,
        timestamp: now
      }
      break

    // From RECEIVED_AT_WAREHOUSE
    case `${TrackingItemStatus.RECEIVED_AT_WAREHOUSE}-${TrackingItemStatus.PACKING}`:
      updates.packing_at = now
      payload = {
        trackingNumber: currentItem.tracking_number,
        status: newStatus,
        timestamp: now
      }
      break

    // From PACKING
    case `${TrackingItemStatus.PACKING}-${TrackingItemStatus.RECEIVED_AT_WAREHOUSE}`:
      updates.packing_at = null
      break

    case `${TrackingItemStatus.PACKING}-${TrackingItemStatus.BOXED}`:
      updates.boxed_at = now
      payload = {
        trackingNumber: currentItem.tracking_number,
        status: newStatus,
        timestamp: now
      }
      break

    // From BOXED
    case `${TrackingItemStatus.BOXED}-${TrackingItemStatus.PACKING}`:
      updates.boxed_at = null
      break

    case `${TrackingItemStatus.BOXED}-${TrackingItemStatus.CHANGING_WAREHOUSE}`:
      updates.changing_warehouse_at = now
      payload = {
        trackingNumber: currentItem.tracking_number,
        status: newStatus,
        timestamp: now
      }
      break

    case `${TrackingItemStatus.BOXED}-${TrackingItemStatus.DELIVERING}`:
      updates.delivering_at = now
      payload = {
        trackingNumber: currentItem.tracking_number,
        status: newStatus,
        timestamp: now
      }
      break

    // From CHANGING_WAREHOUSE
    case `${TrackingItemStatus.CHANGING_WAREHOUSE}-${TrackingItemStatus.BOXED}`:
      updates.changing_warehouse_at = null
      break

    case `${TrackingItemStatus.CHANGING_WAREHOUSE}-${TrackingItemStatus.CHANGED_WAREHOUSE}`:
      updates.changed_warehouse_at = now
      payload = {
        trackingNumber: currentItem.tracking_number,
        status: newStatus,
        timestamp: now
      }
      break

    // From CHANGED_WAREHOUSE
    case `${TrackingItemStatus.CHANGED_WAREHOUSE}-${TrackingItemStatus.CHANGING_WAREHOUSE}`:
      updates.changed_warehouse_at = null
      break

    case `${TrackingItemStatus.CHANGED_WAREHOUSE}-${TrackingItemStatus.DELIVERING}`:
      updates.delivering_at = now
      payload = {
        trackingNumber: currentItem.tracking_number,
        status: newStatus,
        timestamp: now
      }
      break

    // From DELIVERING
    case `${TrackingItemStatus.DELIVERING}-${TrackingItemStatus.DELIVERED}`:
      updates.delivered_at = now
      payload = {
        trackingNumber: currentItem.tracking_number,
        status: newStatus,
        timestamp: now
      }
      break

    case `${TrackingItemStatus.DELIVERING}-${TrackingItemStatus.CHANGED_WAREHOUSE}`:
      updates.delivering_at = null
      break

    default:
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid status transition from ${currentStatus} to ${newStatus}`
      })
  }

  return { updates, payload }
}

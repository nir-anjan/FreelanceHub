# Dynamic Admin Sidebar Counts Implementation

## Overview

The AdminSidebar component now displays dynamic counts for "Jobs Pending" and "Disputes" that are fetched from the backend API in real-time.

## Implementation Details

### 1. Custom Hook: `useAdminStats`

**Location**: `frontend/src/hooks/useAdminStats.ts`

**Features**:

- Fetches admin statistics from `/auth/admin/overview/` endpoint
- Automatic refresh every 5 minutes (configurable)
- Loading and error state management
- Manual refetch capability
- Proper cleanup on component unmount

**Usage**:

```typescript
const { stats, loading, error, refetch } = useAdminStats({
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  enableAutoRefresh: true,
});
```

### 2. Updated AdminSidebar Component

**Location**: `frontend/src/admin/components/layout/AdminSidebar.tsx`

**Changes**:

- Removed static mock counts
- Integrated `useAdminStats` hook
- Dynamic navigation items based on real data
- Loading states with "..." indicator
- Error states with "!" indicator
- Fallback to 0 when data is available but count is undefined

### 3. Navigation Items Mapping

- **Jobs Pending**: Maps to `stats.pending_jobs`
- **Disputes**: Maps to `stats.open_disputes`
- **Dashboard**: No count (null)
- **Users**: No count (null)

## Backend Dependencies

The implementation relies on the existing `/auth/admin/overview/` endpoint which returns:

```json
{
  "success": true,
  "data": {
    "stats": {
      "pending_jobs": 12,
      "open_disputes": 3,
      "total_users": 150
      // ... other stats
    }
  }
}
```

## User Experience

### Loading State

- Shows "..." in badge while data is loading initially
- No badge shown during background refreshes to avoid UI flicker

### Error State

- Shows "!" in badge if API call fails
- Gracefully handles network errors
- No counts displayed when there's an error

### Real-time Updates

- Counts automatically refresh every 5 minutes
- Manual refresh available via `refetch()` function
- Efficient background updates without disturbing user interaction

## Performance Considerations

1. **Caching**: The hook maintains state to avoid unnecessary re-renders
2. **Cleanup**: Proper interval cleanup prevents memory leaks
3. **Background Updates**: Refresh doesn't show loading indicator to avoid UI disruption
4. **Error Resilience**: Failed refreshes don't clear existing data

## Future Enhancements

1. **WebSocket Integration**: Real-time updates via WebSocket connections
2. **Selective Refresh**: Only refresh specific counts that have changed
3. **User Preferences**: Allow users to configure refresh intervals
4. **Notifications**: Show toast notifications for significant count changes
5. **More Counts**: Add counts for other navigation items like total users

## Testing

The implementation can be tested by:

1. Creating/approving jobs to see pending count changes
2. Creating/resolving disputes to see dispute count changes
3. Simulating network errors to test error states
4. Waiting 5 minutes to observe automatic refresh

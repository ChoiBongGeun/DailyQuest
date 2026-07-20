# DailyQuest TODO Backlog

## In Progress (Today)
- [x] 1) Server-side task search/filter/sort + pagination
- [x] 2) Project detail page (stats/trend/bulk actions)

## Next
- [x] 3) Recurring task UI completion (full recurrence controls in task modal)
- [x] 4) Notification enhancements (dueTime-precise reminder timing, local notification history)
- [x] 5) Task UX upgrades (bulk select/actions, drag sort with persisted ordering, selection mode UI, complete/select button separation)
  - [x] P2) Reorder race condition — debounce API call 500ms, UI updates immediately
  - [x] P2) sortOrder not reset on project change — reset to null when task moved to different project
  - [x] P2) Reorder payload validation — reject non-permutation taskIds (missing/duplicate) with 400
  - [x] P2) Reorder failure rollback — restore optimistic order and show error toast on mutation failure
- [ ] 6) Collaboration features (project sharing, member roles, activity log)
- [ ] 7) Quality/ops tooling (E2E tests, error tracking, API performance monitoring)
- [ ] 8) Deployment/environment hardening (env template, runtime requirement docs)

## UI/UX Improvements (Medium Priority)
- [x] UI-M1) Task card priority-colored left border — HIGH=red, MEDIUM=orange, LOW=green for faster visual scanning (`TaskItem.tsx`)
- [x] UI-M2) Fix week summary completion rate — currently shows overall `completionRate`, should use `weekCompleted / weekTasks` for accuracy (`dashboard/page.tsx`)
- [x] UI-M3) Search clear button — add `X` icon button inside search input that appears when keyword is present (`dashboard/page.tsx`)
- [x] UI-M4) Task count badges on sidebar nav — show today/week task counts next to "오늘", "이번 주" nav items using `stats.todayTasks` / `stats.weekTasks` (`Sidebar.tsx`)

## UI/UX Improvements (Low Priority)
- [x] UI-L1) Replace raw `<button>` mobile sidebar toggle with `Button` component for design system consistency (`dashboard/page.tsx`)
- [x] UI-L2) Removed dead `trend` prop from `StatsCard` — no backend support for week-over-week delta (`StatsCard.tsx`)
- [x] UI-L3) Improve pagination UX — added numbered page buttons with ellipsis between Prev/Next (`dashboard/page.tsx`)

## UI Accessibility & Polish (Backlog)
- [x] ACC-1) `TaskItem.tsx` — add `aria-label` to MoreVertical menu button; add `aria-expanded` state; handle ESC key to close dropdown
- [x] ACC-2) `TaskItem.tsx` — raise dropdown z-index from `z-10/z-20` to `z-40/z-50` to prevent overlap with other fixed elements
- [x] ACC-3) Pagination buttons — add `aria-current="page"` to active page button (`dashboard/page.tsx`)
- [x] ACC-4) `Sidebar.tsx` — added `focus-visible` ring to action buttons; fixed `aria-label` separator (dash → colon); added `aria-label` to new-project plus button; added `focus-visible:opacity-100` so buttons appear on keyboard focus even without hover
- [x] STYLE-1) `StatsCard.tsx` — make value font size responsive: `text-2xl md:text-3xl` instead of fixed `text-3xl`
- [x] STYLE-2) `globals.css` — added `.dark select option` background/color rule for dark mode option visibility
- [x] STYLE-3) `projects/[id]/page.tsx` — added hover-reveal edit/delete buttons on task rows with TaskModal + ConfirmModal
- [x] A11Y-1) All modals — added `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title heading

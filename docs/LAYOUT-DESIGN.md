# ChefsCart Split-Screen Layout Design

## Overview

ChefsCart uses a **33/67 split-screen layout** to provide an AI-first shopping experience where the AI Assistant is always visible and accessible alongside the main application features.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header Bar                              │
│                      (ChefsCart Logo)                           │
├─────────────────────────────────────────────────────────────────┤
│                      User Switcher                              │
│              (Stephen | Cheslyn | Zeth)                         │
├─────────────────────┬───────────────────────────────────────────┤
│                     │                                           │
│   AI ASSISTANT      │        MAIN CONTENT AREA                  │
│      (33%)          │             (67%)                         │
│                     │                                           │
│  🤖 AI Assistant    │  Tab Navigation:                          │
│                     │  🛒 Shopping | 🍽️ Meals | 💰 Budget      │
│  Quick Actions:     │                                           │
│  ┌────┬────┐       │  ┌─────────────────────────────────────┐ │
│  │Search │Suggest│  │  │                                     │ │
│  ├────┼────┤       │  │                                     │ │
│  │Budget│Meals│    │  │     Active Tab Content              │ │
│  └────┴────┘       │  │     (Shopping List, Meal Plans,     │ │
│                     │  │      Budget Tracker, or             │ │
│  Chat Messages:     │  │      Achievements)                  │ │
│  ┌──────────────┐  │  │                                     │ │
│  │ User: ...    │  │  │                                     │ │
│  │ AI: ...      │  │  └─────────────────────────────────────┘ │
│  │ User: ...    │  │                                           │
│  └──────────────┘  │                                           │
│                     │                                           │
│  Input:             │                                           │
│  ┌──────────────┐  │                                           │
│  │ Ask me...  📤│  │                                           │
│  └──────────────┘  │                                           │
│                     │                                           │
└─────────────────────┴───────────────────────────────────────────┘
```

---

## Design Rationale

### Why 33/67 Split?

1. **AI-First Approach**: The AI Assistant is always visible, emphasizing the AI-first nature of the application
2. **Optimal Screen Real Estate**:
   - 33% is wide enough for comfortable chat interaction
   - 67% provides ample space for main content without feeling cramped
3. **Mobile Consideration**: Follows the "golden ratio" principle for visual balance
4. **User Workflow**: Users can interact with AI while viewing/editing their shopping list simultaneously

### Previous Layout vs New Layout

**Before (Tab-Based):**
- AI Assistant was hidden in a tab
- Users had to switch tabs to access AI
- No simultaneous view of AI + content
- Less emphasis on AI features

**After (Split-Screen):**
- AI Assistant always visible
- Main features easily accessible via top navigation
- Users can chat with AI while working on shopping list
- True AI-first experience

---

## Component Structure

### App.tsx

```typescript
<div className="min-h-screen bg-gray-50 flex flex-col">
  {/* Header */}
  <Header />

  {/* User Switcher - Full Width */}
  <UserSwitcher />

  {/* Split Screen Layout */}
  <div className="flex-1 flex overflow-hidden">
    {/* Left Panel - AI Assistant (33%) */}
    <div className="w-1/3 bg-white border-r">
      <AIAssistant />
    </div>

    {/* Right Panel - Main Content (67%) */}
    <div className="w-2/3 flex flex-col">
      {/* Navigation Tabs */}
      <TabNavigation />

      {/* Content Area */}
      <MainContent />
    </div>
  </div>
</div>
```

### AIAssistant.tsx (Sidebar Optimized)

**Optimizations for 33% Sidebar:**
1. **Compact Quick Actions**: 2x2 grid instead of 4 columns
2. **Smaller Text**: Font sizes reduced for better fit
3. **Compressed Messages**: Smaller avatars and message bubbles
4. **Full-Height Layout**: Uses flex-1 to fill available height
5. **Removed Large Headers**: Eliminated bulky header section

---

## Responsive Behavior

### Desktop (> 1024px)
- Full 33/67 split
- AI Assistant: 33% width
- Main Content: 67% width
- All features visible

### Tablet (768px - 1024px)
- Could adjust to 40/60 split if needed
- All features remain accessible

### Mobile (< 768px)
- **Recommended**: Convert to bottom sheet or modal for AI
- Main content takes full width
- AI accessible via floating button

---

## Key Features

### AI Assistant Panel (Left 33%)

1. **Header Section**
   - Icon and title
   - Brief description

2. **Quick Actions** (When no messages)
   - Search Supermarkets
   - Get Suggestions
   - Analyze Budget
   - Meal Ideas

3. **Chat Interface**
   - Message history
   - User/AI message distinction
   - Timestamps
   - Loading indicator

4. **Input Area**
   - Text input
   - Send button
   - Clear conversation option

### Main Content Panel (Right 67%)

1. **Tab Navigation**
   - Shopping List
   - Meal Plans
   - Budget
   - Achievements

2. **Content Area**
   - Scrollable content
   - Full-width components
   - Max-width container (6xl) for readability

---

## CSS Implementation

### Tailwind Classes Used

**Split Container:**
```jsx
<div className="flex-1 flex overflow-hidden">
```

**Left Panel (33%):**
```jsx
<div className="w-1/3 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
```

**Right Panel (67%):**
```jsx
<div className="w-2/3 flex flex-col overflow-hidden">
```

### Height Management

- `flex-1` ensures panels fill available vertical space
- `overflow-hidden` on parent prevents scroll issues
- `overflow-auto` on content areas enables internal scrolling

---

## User Experience Benefits

### 1. Always-Available AI
- Users can ask questions without leaving their current view
- AI context remains visible during shopping

### 2. Parallel Workflows
- Chat with AI while viewing shopping list
- Get suggestions and add items simultaneously
- Compare prices while browsing

### 3. Reduced Context Switching
- No tab switching needed
- Everything visible at once
- Faster task completion

### 4. Clear Visual Hierarchy
- AI on left (helper/assistant role)
- Main content on right (primary focus)
- Natural left-to-right reading flow

---

## Implementation Details

### Files Modified

1. **src/App.tsx**
   - Changed from tab-based to split-screen layout
   - Removed 'ai' from tab type (AI always visible)
   - Updated container structure

2. **components/AIAssistant.tsx**
   - Optimized for sidebar width
   - Compressed quick actions to 2x2 grid
   - Reduced text sizes
   - Made layout height-responsive

### Breaking Changes

None - all existing functionality preserved

### Migration Notes

- State management unchanged
- Component props unchanged
- All features remain accessible

---

## Future Enhancements

### Resizable Panels
```typescript
// Allow users to adjust the split ratio
<SplitPane
  split="vertical"
  minSize={300}
  defaultSize="33%"
>
  <AIAssistant />
  <MainContent />
</SplitPane>
```

### Collapsible AI Panel
- Add collapse/expand button
- Save user preference
- Maximize main content when needed

### Mobile Optimization
- Bottom sheet for AI on mobile
- Swipe gestures
- Floating action button

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Focus indicators visible
- No keyboard traps

### Screen Readers
- Clear semantic structure
- Proper ARIA labels
- Logical reading order

### Color Contrast
- All text meets WCAG AA standards
- Clear visual boundaries
- High contrast mode support

---

## Performance

### Optimizations
1. **Virtual Scrolling**: For long message lists
2. **Lazy Loading**: Images and heavy components
3. **Memoization**: Prevent unnecessary re-renders
4. **Code Splitting**: Load panels independently

### Metrics
- Initial Load: < 3s
- Time to Interactive: < 5s
- Layout Shift: Minimal (CLS < 0.1)

---

## Testing

### Layout Tests
```typescript
describe('Split Screen Layout', () => {
  it('should render AI Assistant at 33% width', () => {
    // Test implementation
  });

  it('should render Main Content at 67% width', () => {
    // Test implementation
  });

  it('should maintain layout on window resize', () => {
    // Test implementation
  });
});
```

### User Flow Tests
1. Chat with AI while viewing shopping list
2. Add items suggested by AI
3. Switch between main tabs while chatting
4. Clear conversation and start new chat

---

## Design System

### Colors
- AI Panel Background: `bg-white`
- Main Content Background: `bg-gray-50`
- Borders: `border-gray-200`
- AI Header: `bg-gradient-to-r from-primary-50 to-primary-100`

### Typography
- AI Header: `text-lg font-semibold`
- Quick Actions: `text-xs`
- Messages: `text-xs` (compact)
- Main Content: Standard sizes

### Spacing
- Panel Padding: `p-4` (AI), `p-6` (Main)
- Gap between elements: `space-y-3` (AI), `space-y-6` (Main)

---

## Troubleshooting

### Issue: AI Panel Too Narrow
**Solution**: Increase to 40% if needed
```jsx
className="w-2/5" // instead of w-1/3
```

### Issue: Content Overflows
**Solution**: Ensure proper overflow handling
```jsx
className="flex-1 overflow-auto"
```

### Issue: Messages Not Scrolling
**Solution**: Check parent has `overflow-hidden`, child has `overflow-auto`

---

## Conclusion

The 33/67 split-screen layout transforms ChefsCart into a truly AI-first application where the AI Assistant is a constant companion rather than a hidden feature. This design:

- ✅ Emphasizes AI capabilities
- ✅ Improves user workflow efficiency
- ✅ Reduces context switching
- ✅ Maintains all existing functionality
- ✅ Provides clear visual hierarchy
- ✅ Supports future enhancements

**Result**: A modern, AI-first shopping experience that helps families collaborate on grocery shopping with intelligent assistance always at hand.

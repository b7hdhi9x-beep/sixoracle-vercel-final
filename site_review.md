# Site Review - 六神ノ間 (Six Oracle)

## Review Date: 2026-01-20

## Functionality Test Results

### 1. Oracle Selection ✅
- All 6 oracles are displayed in the sidebar
- Each oracle shows correct image, name, and role
- Clicking on an oracle switches the chat context correctly
- Selected oracle is highlighted with gold border

### 2. Chat Functionality ✅
- Messages are sent successfully
- AI responds with character-appropriate personality
- Markdown formatting in responses works correctly
- Chat history is maintained during session

### 3. Usage Tracking ✅
- "残り X / X 回" counter is displayed
- Free users show 3/3 limit
- Premium users would show 100/100 limit

### 4. Subscription/Upgrade ⚠️ Issue Found
- "アップグレード" button exists but has NO onClick handler
- Button does not trigger Stripe checkout
- Need to add subscription.createCheckout mutation call

### 5. UI/UX Issues Found

#### Minor Issues:
1. **Mobile responsiveness**: Sidebar is hidden on mobile (md:block), but no mobile menu alternative
2. **Upgrade button non-functional**: Does not open Stripe checkout

### 6. Other Observations
- Logo displays correctly
- Logout button works
- Authentication flow works (redirects to login if not authenticated)
- Premium badge shows correctly for premium users

## Required Fixes

1. **Critical**: Add onClick handler to upgrade button to trigger Stripe checkout
2. **Important**: Add mobile navigation for oracle selection
3. **Nice to have**: Add loading state to upgrade button


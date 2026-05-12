# Admin Portal Guide & Feature Explanations

## 📧 Email Notifications System

### What is it?
The email notification system automatically sends confirmation emails to customers when they:
- Submit an inquiry through the contact form
- Book a tour package
- Submit a booking request

### How it works:
1. **Location**: `src/lib/email.ts` - Contains email templates and sending logic
2. **API Route**: `src/app/api/send-email/route.ts` - Handles email sending
3. **Integration**: Automatically triggered when inquiries/bookings are created

### Email Templates Include:
- **Inquiry Confirmation**: Sent when someone submits a contact form
- **Booking Confirmation**: Sent when a booking is made
- Beautiful HTML templates with company branding

### Setup Required:
Currently uses a placeholder. To enable real emails, integrate with:

**Option 1: Resend (Recommended)**
```bash
npm install resend
```
Then update `src/app/api/send-email/route.ts`:
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: 'Mir Baba Tours <noreply@mirbabatourandtravels.com>',
  to: data.to,
  subject: data.subject,
  html: data.html,
});
```

**Option 2: SendGrid**
- Sign up at sendgrid.com
- Get API key
- Update email route with SendGrid SDK

**Option 3: AWS SES**
- Configure AWS SES
- Use AWS SDK in email route

### Environment Variable Needed:
```env
RESEND_API_KEY=your_resend_api_key
# OR
SENDGRID_API_KEY=your_sendgrid_key
```

---

## 📊 Google Analytics Integration

### What is it?
Google Analytics tracks website visitors, page views, user behavior, and helps you understand:
- How many people visit your site
- Which pages are most popular
- Where visitors come from (search, social media, etc.)
- What devices they use (mobile, desktop, tablet)
- How long they stay on your site

### How it works:
1. **Component**: `src/components/analytics/GoogleAnalytics.tsx`
2. **Integration**: Automatically added to all pages via root layout
3. **Tracking**: Tracks page views automatically

### Setup Required:
1. Create a Google Analytics 4 (GA4) property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env.local`:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### What You Can Track:
- **Page Views**: See which pages are visited most
- **User Flow**: Understand how users navigate your site
- **Traffic Sources**: See if visitors come from Google, Facebook, etc.
- **Device Usage**: Know if more people use mobile or desktop
- **Popular Packages**: See which tour packages get the most views
- **Conversion Tracking**: Track when someone submits an inquiry

### Benefits:
- Make data-driven decisions about your website
- Understand customer behavior
- Improve marketing strategies
- See which packages are most popular

---

## 📱 Mobile Admin Panel Navigation

### Issue Fixed:
The sidebar navigation was hidden on mobile devices (`hidden lg:flex`), making it impossible to navigate the admin panel on phones/tablets.

### Solution Implemented:
- ✅ Added mobile menu button (hamburger icon) in top-left corner
- ✅ Mobile sidebar slides in from the left when opened
- ✅ Overlay background when menu is open
- ✅ Auto-closes when a navigation item is clicked
- ✅ Fully responsive design

### How to Use on Mobile:
1. Tap the menu icon (☰) in the top-left corner
2. Sidebar slides in from the left
3. Tap any navigation item (Dashboard, Inquiries, Packages, etc.)
4. Menu automatically closes after selection
5. Tap outside the menu or the X button to close

---

## 🐛 Bugs Fixed

### 1. **Navbar Showing in Admin Portal**
- ✅ Fixed: Created `ConditionalLayout` component that hides Navbar, Footer, Chatbot, and Snowfall on `/admin` routes

### 2. **Mobile Navigation Missing**
- ✅ Fixed: Added mobile menu with slide-in sidebar for admin panel

### 3. **Image Path Issues**
- ✅ Fixed: Updated adventure images to use `/videos/adventure-1.png` and `/videos/adventure-2.png`

### 4. **Search Functionality**
- ✅ Working: Search bar available in top navigation tabs
- ✅ Filters inquiries, FAQs, and users in real-time

---

## 🔧 Additional Improvements Made

1. **Responsive Design**: Admin panel now works perfectly on all screen sizes
2. **Mobile Menu**: Smooth slide-in animation for mobile navigation
3. **Better UX**: Auto-close menu on navigation selection
4. **Clean Layout**: Removed unnecessary header panel
5. **Toast Notifications**: User-friendly feedback for all actions

---

## 📝 Quick Setup Checklist

- [ ] Set up email service (Resend/SendGrid) and add API key to `.env.local`
- [ ] Add Google Analytics ID to `.env.local` (optional but recommended)
- [ ] Test admin panel on mobile device
- [ ] Verify email notifications are working
- [ ] Check that navbar doesn't appear in admin portal

---

## 🎯 Next Steps

1. **Enable Email Service**: Choose Resend (easiest) and integrate
2. **Add Analytics**: Get GA4 ID and add to environment variables
3. **Test Mobile**: Verify admin panel works on your phone
4. **Monitor**: Check analytics dashboard regularly for insights


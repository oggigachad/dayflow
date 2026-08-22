HRMS - Human Resource Management System (React + Vite)

One platform for every HR task, from onboarding to payroll.
Streamline attendance, leave, profiles, and approvals for your entire team with role-based access for Admins and Employees, built in.

OVERVIEW
This project is a React and Vite landing page and interface built with functional components, hooks (useState, useEffect), and pure CSS animations. It includes word-by-word heading reveals, interactive carousels with circular SVG progress timers, role-based comparison matrices, and dynamic annual/monthly pricing toggles.

FEATURES

* Hero Section: Includes a word-by-word animated title, gradient action buttons, and responsive product preview image.


* Logo Ticker: Infinite continuous horizontal scrolling ticker loop.


* Interactive Core Features Carousel: 5 to 6 rotating panels (Secure Sign In, Dashboards, Profiles, Attendance, Leave, Payroll) driven by auto-advancing timers and SVG progress rings.


* App Advert & Role Permissions Matrix: Detailed breakdown comparing Employee permissions versus Admin and HR Officer permissions.


* Interactive Pricing Section: Toggleable Annual and Monthly billing switcher with light/dark pricing cards and entrance animations.


* Coming Soon & Final CTA: Highlighted upcoming features with quick-action demo and trial buttons.



TECH STACK

* Framework: React with Vite template


* Language: JavaScript (JSX)


* Styling: Vanilla CSS / Single Global Stylesheet


* Animations: CSS Keyframes (spin-slow, ticker-scroll, fadeInUp, fadeInRight, slideInFromRight)



PROJECT STRUCTURE

* src/assets: Local images, screenshots, and SVG icons.


* src/components/Navbar.jsx: Navigation bar with links and actions.


* src/components/Hero.jsx: Hero section container.


* src/components/HeroContent.jsx: Main title, subtitle, and CTA buttons.


* src/components/AnimatedWord.jsx: Helper component for word-by-word staggered heading animations.


* src/components/PrimaryCta.jsx: Gradient call-to-action button with spinning border effect.


* src/components/OfferStrip.jsx: Transition strip leading into the feature set.


* src/components/LogoTicker.jsx: Seamless looping partner logo showcase.


* src/components/Scenarios.jsx: Core feature section container.


* src/components/Pagination.jsx: Circular SVG progress buttons for carousel navigation.


* src/components/ScenarioImage.jsx: Animated image display for active feature panels.


* src/components/AppAdvert.jsx: Role comparison and advert section.


* src/components/RoleComparisonTable.jsx: Capability table comparing Employee and HR permissions.


* src/components/ComingSoon.jsx: Feature preview strip.


* src/components/Pricing.jsx: Pricing section container.


* src/components/BillingToggle.jsx: Annual versus monthly state toggle switch.


* src/components/PricingCard.jsx: Modular card for Starter, Growth, and Enterprise tiers.


* src/components/FinalCta.jsx: Closing call-to-action banner and footer links.


* src/App.jsx: Root component assembling all sections sequentially.


* src/index.css: Reset styles, layout classes, responsive breakpoints, and keyframe animations.



GETTING STARTED

1. Install dependencies:
npm install


2. Run the local development server:
npm run dev
3. Build for production:
npm run build

RESPONSIVE BREAKPOINTS

* Desktop: Greater than 1024px


* Tablet: 1024px and below (nav collapse, adjusted spacing, stacked layouts)


* Mobile: 768px and below (compact typography, single-column alignment, mobile-optimized CTA heights)

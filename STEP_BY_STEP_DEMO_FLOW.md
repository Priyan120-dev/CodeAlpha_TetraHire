# TetraHire - Step-by-Step Demo Flow

This document details the exact visual actions to take on screen, along with the corresponding script to speak for a complete product demonstration.

---

## 🎬 Step 1: Landing Page
- **Visual Action**: Open `http://localhost:5173/` in a fresh browser tab. Slowly scroll down past the Hero section, showing the animated stats counters, the interactive toolkit grid, and the featured companies.
- **Voiceover**: 
  > *"We start here on the TetraHire Landing Page. The interface features a clean, responsive layout, fluid micro-animations, and full dark-theme toggle support. It serves as our entry point, highlighting active site stats and the core career toolkit."*

---

## 🎬 Step 2: Sign Up
- **Visual Action**: Click **Get Started** or **Register** in the top right. Fill out the form with a new user name, a test candidate email, select the **Candidate** role, enter a password, and click **Sign Up**.
- **Voiceover**: 
  > *"First, let's create a new candidate account. On the registration page, we input our credentials and select the 'Candidate' role to initialize the custom dashboard profile."*

---

## 🎬 Step 3: Login
- **Visual Action**: The system auto-redirects to login (or dashboard). If on the login page, enter the newly registered candidate email and password, then click **Sign In**.
- **Voiceover**: 
  > *"Now, we log in. The backend verifies the password using Bcrypt salting and issues secure JWT tokens. A silent refresh token lifecycle runs in the background to handle renewals without logouts."*

---

## 🎬 Step 4: Candidate Dashboard
- **Visual Action**: Point the cursor to the stats counters (Total Applications, Bookmarks, Interviews, Offers) and show the Profile Completion tracker.
- **Voiceover**: 
  > *"Once logged in, we land on the Candidate Dashboard. It gives us a bird's-eye view of our active applications, saved job bookmarks, scheduled interviews, and profile completion progress."*

---

## 🎬 Step 5: Search Jobs
- **Visual Action**: Click **Find Jobs** in the navigation bar. Type `React` in the keyword search input box.
- **Voiceover**: 
  > *"Next, let's look for jobs. Clicking 'Find Jobs' opens the job feed. We can search using the full-text search bar, which queries indexed fields in the MongoDB database."*

---

## 🎬 Step 6: Filter Jobs
- **Visual Action**: Apply filters: select **Remote** for job type, **Full Time** for employment type, and adjust the salary slider.
- **Voiceover**: 
  > *"We can filter listings by location, salary bounds, and type—such as Remote or Hybrid—to narrow down the results to our exact preferences."*

---

## 🎬 Step 7: View Job
- **Visual Action**: Click **View Details** or the title of a matching job card (e.g. *Frontend Developer*). Show the job description, skills required tags, and matching score indicators.
- **Voiceover**: 
  > *"Selecting a listing opens the Job Details view. Here, we see full requirements, skills tags, and our custom AI Job Match Score which compares our profile skills with the listing requirements."*

---

## 🎬 Step 8: Upload Resume
- **Visual Action**: Click the **Profile** tab in the navbar. Scroll down to the resume upload area, write/paste a resume draft or details, and click **Save**.
- **Voiceover**: 
  > *"To apply, we go to our Profile page. Here we can add experience, education details, and save our resume to the system database."*

---

## 🎬 Step 9: Apply Job
- **Visual Action**: Go back to the job detail page, click **Apply Now**, select your uploaded resume, paste a short cover letter, and click **Submit Application**.
- **Voiceover**: 
  > *"Now we submit our application. We select our uploaded resume, provide an optional cover letter, and click submit. A compound index checks for duplicates to prevent double-applying."*

---

## 🎬 Step 10: Track Application
- **Visual Action**: Navigate back to the **Candidate Dashboard** or click **Applications** in the profile dropdown to show the status tracker indicating the application is in the **Applied** status.
- **Voiceover**: 
  > *"Under the Applications tab, we can track our application status as it updates in real time through the recruitment stages."*

---

## 🎬 Step 11: Employer Login
- **Visual Action**: Logout of the candidate account, and log in with your recruiter/employer account credentials.
- **Voiceover**: 
  > *"Now, let's switch views. We log out and sign in using a registered Employer account to inspect the recruiter-side portal."*

---

## 🎬 Step 12: Post Job
- **Visual Action**: Click **Post a Job** on the Employer Dashboard. Fill in the job title, category, description, required skills, salary, and deadline. Click **Post Job**.
- **Voiceover**: 
  > *"Recruiters have a custom Job Posting Wizard. We define the title, descriptions, salary ranges, and specific skill tags, which immediately goes live across the platform."*

---

## 🎬 Step 13: Manage Applications
- **Visual Action**: Scroll down the Employer Dashboard to the **Recent Applications** list. Find the application submitted in Step 9. Click the status dropdown and update it from **Applied** to **Interview** or **Selected**.
- **Voiceover**: 
  > *"Recruiters track applicants using this tracking table. By updating the status dropdown, the candidate's profile is updated, automatically triggering a status change alert."*

---

## 🎬 Step 14: Admin Dashboard & Analytics
- **Visual Action**: Log out and log in with an **Admin** account. Show the admin analytics layout, user moderation list, and job moderator grid.
- **Voiceover**: 
  > *"Lastly, we log in as the System Administrator. The Admin Dashboard acts as a command center, displaying system-wide analytics, user management controls, and active job moderators."*

---

## 🎬 Step 15: Logout
- **Visual Action**: Click the user profile icon in the top right of the navbar, click **Logout**, showing the app returning cleanly to the public Homepage.
- **Voiceover**: 
  > *"Finally, we log out. All local tokens are cleared securely, returning us back to the homepage. That concludes our demo. Thank you!"*

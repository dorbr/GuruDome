# User Journeys - GuruDome

This document outlines the key user journeys within the GuruDome application, detailing the flows for Guests, Authenticated Users, and Administrators.

## Core Roles
- **Guest**: Unauthenticated visitor. Can browse and view content.
- **User**: Authenticated via Firebase (Google). Can contribute content (Gurus, Reviews).
- **Moderator/Admin**: Has elevated privileges to manage content and users.

---

## 1. Discovery & Exploration (Guest & User)

### **Browse Gurus**
*   **Entry Point**: Home Page (`/`)
*   **Actions**:
    *   View featured or trending Gurus.
    *   Filter by Category (e.g., Dropshipping, Crypto, Real Estate).
    *   Search by Name.
*   **Outcome**: User finds a specific Guru or browses a list.

### **View Guru Profile**
*   **Entry Point**: Click on a Guru Card from Home or Search results.
*   **Route**: `/guru/[id]`
*   **Content Visible**:
    *   **Profile Info**: Name, Bio, Instagram Link, Social Handles.
    *   **Stats**: Average Rating, Trustworthiness, Value for Money, Authenticity scores.
    *   **AI Analysis**: Summary of reviews, "Background Check" warnings, Fake/Scam indicators.
    *   **Performance Chart**: Historical trend of ratings (clickable/modal).
    *   **Reviews**: List of user reviews with tags (e.g., "Purchased", "Verified").
*   **Outcome**: User evaluates the credibility of a Guru.

### **Guru Battles (Comparison)**
*   **Entry Point**: "Guru Battles" in navigation (`/battles`).
*   **Actions**:
    *   Select two Gurus to compare side-by-side.
    *   View direct comparison of metrics (Trust, Value, Authenticity).
*   **Outcome**: User decides which Guru is better based on direct comparison.

---

## 2. Contribution (Authenticated User)

> **Note**: These actions require Authentication. If a Guest attempts them, they are prompted to Login via Google.

### **Add a New Guru**
*   **Entry Point**: "Add Guru" button in Header (`/add-guru`).
*   **Pre-requisite**: Must be logged in.
*   **Flow**:
    1.  User enters **Guru Name** and **Instagram URL**.
    2.  Selects **Category**.
    3.  (Optional) Adds a **Bio**.
    4.  Submits form.
*   **System Action**: Creates a specific `Guru` record in the database.
*   **Outcome**: Redirects to the new Guru's profile page.

### **Write a Review**
*   **Entry Point**: "Write a Review" button on a Guru Profile (`/guru/[id]`).
*   **Pre-requisite**: Must be logged in.
*   **Flow**:
    1.  **Rate**: Star rating (1-5).
    2.  **Detailed Ratings**: Trustworthiness, Value for Money, Authenticity (1-5).
    3.  **Details**: Title and written Review Text.
    4.  **Flags**: Toggle "I purchased a course" or "This is a scam".
    5.  Submits.
*   **System Action**:
    *   Saves `Review` to database.
    *   Triggers **AI Analysis** to check for fake content/spam.
    *   Updates Guru's aggregated stats.
*   **Outcome**: Review appears on the profile (unless flagged for review).

### **Manage Own Reviews**
*   **Entry Point**: User Menu -> "My Reviews" (`/my-reviews`).
*   **Actions**:
    *   View list of all reviews submitted by the user.
    *   Edit or Delete reviews (if implemented).
*   **Outcome**: User manages their contributions.

---

## 3. Moderation & Trust (Community & Admin)

### **Report Content (User)**
*   **Entry Point**: Flag icon on a Review Card.
*   **Flow**:
    1.  Select reason (Spam, Offensive, False Info).
    2.  Add description.
    3.  Submit.
*   **Outcome**: Creates a `ReviewReport` for Admin review.

### **Admin Dashboard (Admin only)**
*   **Entry Point**: `/admin` (Restricted).
*   **Capabilities**:
    *   **Dashboard**: Overview of stats (Users, Gurus, Reviews).
    *   **Manage Users**: Ban/Unban users, view user details.
    *   **Manage Gurus**: Edit Guru details, merge duplicates (if supported), remove Gurus.
    *   **Manage Reviews**: View reported reviews, hide/remove spam, validation overrides.
    *   **AI Triggers**: Manually trigger AI analysis for gurus/reviews.

---

## 4. Authentication Flow
*   **Provider**: Firebase Auth (Google Sign-In).
*   **Sync**:
    *   Frontend authenticates with Firebase.
    *   Frontend sends ID token/UID to Backend.
    *   Backend syncs Firebase User to MongoDB `User` collection.
*   **State**: Session persists across the app.

---

## Data Model Summary
*   **User**: Identity & Role (User/Admin).
*   **Guru**: The entity being reviewed. Contains stats and AI summaries.
*   **Review**: The core content unit. Links User to Guru.
*   **ReviewReport**: Moderation queue item.

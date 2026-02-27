# TRINETRA – Intelligent Rapid Alert System for Missing Children Requirements Document

## 1. Application Overview

### 1.1 Application Name
TRINETRA – Intelligent Rapid Alert System for Missing Children

### 1.2 Application Description
TRINETRA is a professional emergency response platform designed to facilitate rapid missing child alerts and community-based search coordination. The system features secure role-based authentication with authority verification, enabling verified police personnel to create alerts while citizens can view active cases and report sightings with photo evidence.

## 2. Core Features

### 2.1 Landing Page (Login Selection)
- Centered login selection panel with two options:
  - 👮 Login / Register as Police / Authority button
  - 👤 Login as Citizen button
- Simple card-style layout
- Professional blue and white theme

### 2.2 Police / Authority Authentication System

#### 2.2.1 Police Registration Page
When user selects Police / Authority option, display registration form with required fields:
- Full Name
- Official Email ID
- Username
- Password
- Confirm Password
- Police ID Number (Mandatory)
- Police Station Name
- Upload ID Proof (optional for demo)

#### 2.2.2 Police ID Verification Logic
Before allowing registration:
- System validates Police ID number format
- Simulate verification process (mock database validation)
- Display verification result message:
  - ✅ \"Police ID Verified – Registration Approved\"
  - OR ❌ \"Invalid Police ID – Access Denied\"
- Only after successful verification:
  - Allow account creation
  - Redirect to Police Dashboard

#### 2.2.3 Security Rules
- Citizens cannot access Police Dashboard
- Only verified Police accounts can create alerts
- Police ID field must be mandatory
- Without valid Police ID → Signup blocked

### 2.3 Police Login Panel
- Username field
- Password field
- Login button
- Redirect to Police Dashboard after successful login

### 2.4 Police Dashboard

#### 2.4.1 Create Alert Form
Form fields:
- Child Name
- Age
- Description
- Last Known Location
- Upload Photo
- Time of Disappearance
- Activate Alert button

#### 2.4.2 Active Alerts Panel
Display list of active alerts with:
- Alert details
- Child photo
- Location
- Time elapsed
- Status: Active
- Button: \"Mark as Found / Clear Alert\"
- Button: \"Delete Alert\"

Functionality:
- When Mark as Found button is clicked:
  - Change status to Resolved
  - Remove alert from citizen dashboard
  - Move to Resolved Cases section
- When Delete Alert button is clicked:
  - Permanently remove alert from system
  - Alert disappears from both police and citizen dashboards
  - Confirmation prompt before deletion

#### 2.4.3 Resolved Cases Section
- Display alerts marked as found/resolved

### 2.5 Citizen Login Panel
- Simple login form
- Username field
- Password field
- Login button
- Redirect to Citizen Dashboard after successful login

### 2.6 Citizen Dashboard

#### 2.6.1 Active Alerts Near You Section
Display alert cards showing:
- Child Photo
- Description
- Last Location
- Time since disappearance
- Button: \"Report Sighting\"

### 2.7 Report Sighting System
When citizen clicks Report Sighting button, open form with:
- Current Location field (auto or manual entry)
- Description field
- 📸 Camera Access Button
- Upload button

Camera feature requirements:
- Allow device camera access
- Capture photo as evidence
- Save timestamp automatically
- Photo upload mandatory before submission
- Display message: \"Photo evidence required to reduce false reports.\"

### 2.8 System Behavior and Admin Logic
- Only Police can clear alerts
- Only Police can delete alerts
- Citizens cannot edit alerts
- Alerts marked Found automatically disappear from citizen dashboard
- Deleted alerts are permanently removed from system
- Role-based authentication enforced throughout system
- Police ID verification simulation required

### 2.9 Footer
- About TRINETRA
- Contact
- Project Description

## 3. Design Requirements

### 3.1 Color Theme
- Professional blue and white theme

### 3.2 UI Style
- Simple and clean layout
- Professional design
- Easy to use interface
- Card-style components
- Clear dashboard layout
- Sans-serif font

### 3.3 Responsive Design
- Mobile responsive layout
- Optimized for various screen sizes
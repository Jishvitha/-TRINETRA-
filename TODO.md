# Task: Enhance TRINETRA with Police ID Verification System

## Plan
- [x] Step 1: Database Schema Updates
  - [x] Add fields to profiles table (full_name, official_email, police_id, police_station, id_proof_url, verified)
  - [x] Create police_ids table for verification simulation
  - [x] Update auth trigger to handle new fields
- [x] Step 2: Police Registration Enhancement
  - [x] Create enhanced PoliceRegister page with all required fields
  - [x] Add Police ID verification logic
  - [x] Add ID proof upload (optional)
  - [x] Show verification status messages
- [x] Step 3: Update Authentication
  - [x] Add signUpPolice function with extra fields
  - [x] Add verifyPoliceId function
  - [x] Update AuthContext
- [x] Step 4: Update Dashboards
  - [x] Ensure police dashboard checks verification status
  - [x] Update citizen registration (keep simple)
  - [x] Add security checks
- [x] Step 5: Testing & Polish
  - [x] Test police registration flow
  - [x] Test ID verification
  - [x] Run lint and fix issues
  - [x] Verify complete workflow

## Notes
- Police registration requires: full name, official email, username, password, police ID, station name
- Police ID verification is mandatory before account creation
- Citizens have simpler registration (username/password only)
- Only verified police can access police dashboard
- ID proof upload is optional for demo
- Sample Police IDs for testing: POL001, POL002, POL003, POL004, POL005, DEMO123
- All features implemented and tested successfully

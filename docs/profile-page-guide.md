# Profile Page Implementation

This document explains the profile page functionality added to the Micro-Entrepreneur Growth App.

## Overview

The profile page allows users to:
- View their account information
- Update personal and business details
- Upload a profile image
- Manage their professional online presence

## Features

1. **Profile Display**:
   - Personal information (name, email, phone)
   - Business details (business name, type, website)
   - Profile image
   - Account information

2. **Profile Editing**:
   - Personal information updates
   - Business information updates
   - Profile image upload

3. **Integration**:
   - Profile data is collected during signup
   - Profile can be accessed from the navigation bar

## Technical Implementation

### Backend Changes

1. **User Model Updates**:
   - Added new fields: `business_name`, `business_type`, `location`, `bio`, `profile_image`, `website`
   - Created database migration to add these fields

2. **API Endpoints**:
   - `/auth/profile`: GET and PUT endpoints for profile data
   - `/auth/profile/upload-image`: POST endpoint for profile image upload
   - `/auth/business-types`: GET endpoint to fetch business type options

3. **File Storage**:
   - Created uploads directory for profile images
   - Configured FastAPI to serve static files from this directory

### Frontend Changes

1. **New Components**:
   - `ProfilePage.tsx`: Main profile viewing and editing page
   - Updated `ProfileSetupScreen.tsx` to collect business information during signup

2. **API Service Updates**:
   - Added methods for profile updates and image upload
   - Extended signup data interface with new fields

3. **Navigation**:
   - Added profile link to the navigation bar

## Setup Instructions

1. **Run Database Migrations**:
   ```bash
   cd backend
   alembic upgrade head
   ```

2. **Set Up Uploads Directory**:
   ```bash
   cd backend
   ./setup_uploads.sh
   ```

3. **Start the Backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

4. **Start the Frontend**:
   ```bash
   npm run dev
   ```

## Usage

1. **Creating a Profile**:
   - Sign up for a new account
   - Fill in the profile setup form, including business information

2. **Editing Profile**:
   - Navigate to the Profile page from the navigation bar
   - Update information in the form
   - Click "Save Changes" to update your profile

3. **Uploading Profile Image**:
   - Go to the Profile page
   - Select an image file using the file input
   - Click "Upload" to upload your profile image

# Feature Specification: Flyer Save/Share Functionality

**Feature Branch**: `002-flyer-save-share`  
**Created**: January 30, 2026  
**Status**: Draft  
**Input**: User description: "Provide Save / Share functionality to download the flyer image. Make the primary action on mobile: Save / Share (not Download). On iOS Safari, the native share sheet usually includes Save Image if you share an actual image file (Blob/File). On Android Chrome, sharing a file opens the share sheet. UI becomes: Save to Photos / Share (primary on mobile), Download (secondary fallback)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mobile User Shares Flyer via Native Share Sheet (Priority: P1)

A mobile user viewing their recap flyer wants to share it directly to social media, messaging apps, or save it to their photo library using their device's native capabilities. They tap "Save / Share" and the device's native share sheet appears, allowing them to choose their preferred destination.

**Why this priority**: This is the core value proposition—making mobile sharing seamless with a 2-tap flow instead of download-then-upload. Mobile users represent the majority of social sharing activity.

**Independent Test**: Can be fully tested by generating a flyer on a mobile device, tapping "Save / Share," and verifying the native share sheet opens with the flyer image available to share or save.

**Acceptance Scenarios**:

1. **Given** a user is viewing their flyer on iOS Safari, **When** they tap "Save / Share", **Then** the native share sheet opens with the flyer image as a shareable file (not URL)
2. **Given** a user is viewing their flyer on Android Chrome, **When** they tap "Save / Share", **Then** the native share sheet opens allowing them to choose destination apps (Messages, Photos, Drive, etc.)
3. **Given** a user is viewing their flyer on mobile, **When** they tap "Save / Share" and select "Save Image" (iOS) or a gallery app (Android), **Then** the flyer is saved to their device's photo library
4. **Given** the Web Share API is supported with file sharing, **When** the user taps "Save / Share", **Then** the system shares the flyer as an actual image file (PNG Blob), not a URL

---

### User Story 2 - Desktop User Downloads Flyer (Priority: P2)

A desktop user viewing their recap flyer wants to download it to their computer. They click "Download" and the PNG file is saved to their downloads folder.

**Why this priority**: Desktop users still need a reliable way to get the flyer, but native share sheets are less common/useful on desktop, making direct download the preferred approach.

**Independent Test**: Can be fully tested by generating a flyer on a desktop browser, clicking "Download," and verifying the PNG file is saved to the downloads folder.

**Acceptance Scenarios**:

1. **Given** a user is viewing their flyer on desktop, **When** they click "Download", **Then** the flyer PNG is downloaded to their computer
2. **Given** the UI is displayed on desktop, **When** the page loads, **Then** "Download" is shown as the primary action (not "Save / Share")

---

### User Story 3 - Fallback Download on Unsupported Mobile Browsers (Priority: P3)

A mobile user on a browser that doesn't support the Web Share API (or doesn't support file sharing) still needs a way to save the flyer. The UI gracefully falls back to showing a "Download" button.

**Why this priority**: Ensures no user is left without a way to save their flyer, even on older or non-standard browsers.

**Independent Test**: Can be fully tested by simulating an unsupported browser (e.g., disabling Web Share API) and verifying the download fallback works.

**Acceptance Scenarios**:

1. **Given** a mobile browser does NOT support Web Share API with files, **When** the flyer actions render, **Then** "Download" is shown instead of "Save / Share"
2. **Given** the share operation fails for any reason, **When** the error occurs, **Then** the user is informed and can still download via the fallback button

---

### Edge Cases

- What happens when image generation fails mid-export? → Show user-friendly error message, allow retry
- How does the system handle browsers that support Web Share API but NOT file sharing (share with files)? → Fall back to download button
- What happens if the user cancels the share sheet? → No error shown, UI returns to normal state
- How should the UI behave while the image is being generated? → Show loading/exporting state on the button

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect whether the Web Share API with file sharing (`navigator.canShare({ files: [...] })`) is supported
- **FR-002**: On mobile devices with Web Share file support, "Save / Share" MUST be the primary action button
- **FR-003**: On desktop devices OR browsers without Web Share file support, "Download" MUST be the primary action
- **FR-004**: The share functionality MUST pass the flyer image as a File/Blob object (not a URL) to enable native "Save Image" options
- **FR-005**: System MUST provide a "Download" option as a secondary/fallback action on mobile when share is primary
- **FR-006**: The shared file MUST be a PNG image with appropriate MIME type (`image/png`)
- **FR-007**: The shared/downloaded filename MUST include identifying information (e.g., `recap-flyer-{units}.png`)
- **FR-008**: System MUST show a loading state while the image is being generated for share/download
- **FR-009**: System MUST handle share cancellation gracefully (user dismisses share sheet) without showing errors
- **FR-010**: System MUST handle share/download failures with a user-friendly error message

### Key Entities

- **Flyer Image**: PNG image file generated from the flyer component at full resolution
- **Share File**: A File object with name and MIME type suitable for the Web Share API
- **Device Context**: Detection of mobile vs. desktop and Web Share API capability to determine button display

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mobile users can share their flyer to any app in 2 taps (tap "Save / Share" → select destination)
- **SC-002**: iOS Safari users see "Save Image" option in the native share sheet when sharing the flyer
- **SC-003**: Android Chrome users can share the flyer directly to messaging apps, photo galleries, or other installed apps
- **SC-004**: Desktop users can download the flyer with a single click
- **SC-005**: 100% of users have access to either share or download functionality regardless of browser capabilities
- **SC-006**: Button label accurately reflects the available action based on device/browser capability detection

## Assumptions

- The existing image generation implementation reliably generates PNG data URLs that can be converted to Blobs
- Modern iOS Safari (15+) and Android Chrome support the Web Share API Level 2 with file sharing
- Users understand that "Save / Share" on mobile opens the native share sheet rather than directly saving
- The flyer dimensions are suitable for both sharing and download without modification

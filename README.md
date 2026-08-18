# VPDC AFM

VPC – Vinijyn Pro Classes AFM practice platform.

## Included in Version 2
- Student onboarding with name, mobile number and place.
- Persistent student record and active quiz attempt in Supabase.
- Resume from the last saved question.
- Automatic answer, progress and time saving.
- Permanent live analysis with attempted, correct, wrong, skipped, accuracy and time.
- Global question palette.
- Jump panel for questions belonging to the current case scenario when case identifiers exist in the question bank.
- Completion screen with the VPC feedback Google Form.
- Responsive VPC-branded UI.

## Current question-bank bridge
The application currently attempts to load the existing AFM question bank from the original live deployment. The preferred final step is to copy the original `questions.js` into this repository so the new application is self-contained and independent of the old site.

## Privacy/security note
The initial requested flow uses a mobile number as the returning-student identifier without OTP verification. The Supabase RPC layer therefore accepts the exact mobile number supplied by the student to retrieve and save that student's attempt. Before a large public launch, upgrade this to OTP or another verified authentication method to prevent phone-number impersonation.

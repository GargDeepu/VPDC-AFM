# VPDC AFM authentication setup

The application now uses this authentication flow:

1. Student clicks **Continue with Google**.
2. Supabase Google OAuth authenticates the student.
3. On first login, the app asks for **mobile number + city/place**.
4. `auth.updateUser({ phone })` sends an SMS OTP to that authenticated Google user.
5. OTP is verified with Supabase using `verifyOtp({ phone, token, type: 'phone_change' })`.
6. The verified account is linked to `public.students`.
7. Each visit creates an `attempt_sessions` record for the active quiz attempt.
8. Every answer selection, skip, mark, navigation and lifeline action is written to `answer_events`.

## Supabase dashboard configuration required

### Google OAuth

In Supabase: **Authentication → Providers → Google**

Enable Google and enter your Google OAuth Client ID and Client Secret.

Add this redirect URL to Supabase Auth and to the Google OAuth client:

`https://gargdeepu.github.io/VPDC-AFM/`

### Phone/SMS OTP

In Supabase: **Authentication → Providers → Phone**

Enable phone authentication and configure an SMS provider. For India, complete the provider's applicable TRAI/DLT requirements.

Also set reasonable Auth rate limits/CAPTCHA in production to control SMS abuse.

## New database tables

### `attempt_sessions`
One row per authenticated learning session. Stores the attempt, student, authenticated user, start/last-seen/end timestamps and user-agent.

### `answer_events`
Append-only activity log. Each row records the session, attempt, student, question, question index, event type, selected option, correctness, skip/mark state, lifeline state, seconds spent and exact `created_at` timestamp.

The existing `students`, `quiz_attempts`, and `attempt_answers` tables remain in place for the current progress model and backward compatibility.

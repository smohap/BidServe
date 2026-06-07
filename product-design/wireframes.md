# BidServe Wireframes & User Flows

## 1. Consumer: Home / Request Service
**Goal:** Easy entry point for users needing a service.

**Layout:**
- **Header:** Logo, Profile icon.
- **Hero:** "What do you need help with?"
- **Input Area:**
  - Large text area: "Describe the task (e.g., 'Fix my leaky kitchen faucet')."
  - **Voice Action:** Microphone button for voice-to-text.
- **Budget Section:**
  - "Name your price" field.
  - "Flexible" toggle.
- **Action:** "Post Request" primary button.

---

## 2. Consumer: Request Status & Offers
**Goal:** Track the progress of a posted request.

**Layout:**
- **Status Bar:** "Finding Providers..." or "3 Offers Received".
- **Request Summary Card:** Description and original price.
- **Offers List:**
  - Provider Profile (Name, Rating).
  - Price (Original or Counter).
  - "View Message" / "Accept Offer" buttons.

---

## 3. Provider: Request Feed
**Goal:** Allow providers to find work.

**Layout:**
- **Filter Bar:** Distance (5, 10, 20 miles), Categories (Plumbing, Tech, Cleaning), Price range.
- **Feed:**
  - Cards with: Task title, Consumer name (hidden/anon until accepted), Budget, Distance.
  - "Details" CTA.

---

## 4. Provider: Offer Screen
**Goal:** Respond to a consumer's request.

**Layout:**
- **Request Details:** Full text/voice transcript.
- **Action Buttons:**
  - "Accept for $[Price]" (Primary).
  - "Counter-offer" (Secondary) -> opens input field.
  - "Ask a Question" (Ghost button).

---

## 5. Chat & Negotiation
**Goal:** Finalize the deal.

**Layout:**
- **Thread:** Standard messaging interface.
- **In-line Offer Cards:**
  - "Provider offered $[Price]"
  - Buttons: "Accept Offer", "Decline".
- **Payment Link:** Generated once offer is accepted.

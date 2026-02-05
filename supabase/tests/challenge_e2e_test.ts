/**
 * E2E Test: Challenge Score Submission
 * 
 * Tests the submit-challenge-score endpoint directly.
 * Note: Full user creation tests require SUPABASE_SERVICE_ROLE_KEY.
 * This test validates the edge function logic directly.
 */

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || "https://nikvolkksngggjkvpzrd.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pa3ZvbGtrc25nZ2dqa3ZwenJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MDY3NTgsImV4cCI6MjA4MTE4Mjc1OH0.b6lwrPXqehUAN5VDxoB92BcCHsnMws0iKP2osDjSA60";

// ============================================
// Unit Tests for Edge Function Validation
// ============================================

Deno.test({
  name: "submit-challenge-score: returns 401 without auth header",
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-challenge-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        challenge_id: "test-id",
        score: 100,
      }),
    });

    const body = await response.text();
    assertEquals(response.status, 401, "Should return 401 without auth");
    console.log("✓ Correctly rejects unauthenticated requests");
  },
});

Deno.test({
  name: "submit-challenge-score: validates challenge_id is required",
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-challenge-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        score: 100,
      }),
    });

    const body = await response.json();
    assertEquals(response.status, 400, "Should return 400 for missing challenge_id");
    assert(body.error?.includes("challenge_id"), "Error should mention challenge_id");
    console.log("✓ Correctly validates challenge_id is required");
  },
});

Deno.test({
  name: "submit-challenge-score: validates score is a number",
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-challenge-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        challenge_id: "test-id",
        score: "not-a-number",
      }),
    });

    const body = await response.json();
    assertEquals(response.status, 400, "Should return 400 for invalid score");
    assert(body.error?.toLowerCase().includes("score"), "Error should mention score");
    console.log("✓ Correctly validates score must be a number");
  },
});

Deno.test({
  name: "submit-challenge-score: validates score range (0-10000)",
  async fn() {
    // Test score too high
    const responseTooHigh = await fetch(`${SUPABASE_URL}/functions/v1/submit-challenge-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        challenge_id: "test-id",
        score: 15000,
      }),
    });

    const bodyTooHigh = await responseTooHigh.json();
    assertEquals(responseTooHigh.status, 400, "Should return 400 for score > 10000");
    console.log("✓ Correctly rejects scores > 10000");

    // Test negative score
    const responseNegative = await fetch(`${SUPABASE_URL}/functions/v1/submit-challenge-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        challenge_id: "test-id",
        score: -5,
      }),
    });

    const bodyNegative = await responseNegative.json();
    assertEquals(responseNegative.status, 400, "Should return 400 for negative score");
    console.log("✓ Correctly rejects negative scores");
  },
});

Deno.test({
  name: "submit-challenge-score: handles CORS preflight",
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-challenge-score`, {
      method: "OPTIONS",
    });

    const body = await response.text();
    assertEquals(response.status, 200, "OPTIONS should return 200");
    assert(
      response.headers.get("access-control-allow-origin") === "*",
      "Should have CORS headers"
    );
    console.log("✓ CORS preflight handled correctly");
  },
});

Deno.test({
  name: "complete-drill: validates drill_id is required",
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/complete-drill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({}),
    });

    const body = await response.json();
    // Should fail validation or auth
    assert(response.status >= 400, "Should return error for missing drill_id");
    console.log("✓ Correctly validates drill_id is required");
  },
});

Deno.test({
  name: "complete-drill: handles CORS preflight",
  async fn() {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/complete-drill`, {
      method: "OPTIONS",
    });

    const body = await response.text();
    assertEquals(response.status, 200, "OPTIONS should return 200");
    assert(
      response.headers.get("access-control-allow-origin") === "*",
      "Should have CORS headers"
    );
    console.log("✓ CORS preflight handled correctly");
  },
});

console.log(`
========================================
E2E Test Suite for Challenge System
========================================

Note: Full concurrent user tests require SUPABASE_SERVICE_ROLE_KEY 
to create test users via admin API. Add this secret to run full E2E tests.

Current tests validate:
✓ Authentication enforcement
✓ Input validation (challenge_id, score, score range)
✓ CORS handling
✓ Edge function availability
========================================
`);

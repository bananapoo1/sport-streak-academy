# Release Runbook (Technical)

This runbook covers release readiness tasks that can be done without an Apple Developer account.

## 1) Environment and Secrets

- Copy `.env.example` to `.env` and set production values.
- Confirm `VITE_ENABLE_MOCK_API="false"` in production.
- Keep `.env` out of source control.

## 2) Production Build Validation

```sh
npm run lint
npm run test
npm run build
```

## 3) Consent + Analytics

- Analytics is blocked until user consent is granted (`ssa.analytics.consent.v1`).
- Default behavior is controlled by `VITE_ANALYTICS_DEFAULT_CONSENT`.

## 4) Error Monitoring

- Global listeners capture runtime errors and queue them in local storage.
- Set `VITE_ERROR_REPORT_ENDPOINT` to forward queued events to your backend.

## 5) Legal URLs Required for Store Submission

- Privacy policy: `/legal/privacy-policy.html`
- Terms of service: `/legal/terms-of-service.html`
- Account deletion: `/legal/account-deletion.html`

## 6) Rollback / Hotfix Plan

1. Revert deployment to last known-good web bundle.
2. Disable risky feature flags from backend config first.
3. If issue is mobile-shell-specific, ship patch build with same app version + incremented build number.
4. Announce incident status and ETA internally.
5. Record root cause and add regression test before next release.

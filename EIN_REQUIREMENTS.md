# EIN REQUIREMENTS

Audit date: 2026-06-10
Purpose: Prepare for IRS EIN application after LLC formation.

## IRS Timing Rule

Apply for the EIN after the LLC is formed through the state. The IRS notes that if a legal entity such as an LLC is not formed with the state first, the EIN application may be delayed.

Source: https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number

## EIN Application Requirements

| Requirement | Status | Notes |
| --- | --- | --- |
| LLC formed with state | Waiting | Required before application |
| Legal entity name | Needed | Must match state filing |
| Responsible party | Needed | Must be a person, not nominee |
| Responsible party TIN | Needed | SSN or ITIN |
| Principal business address | Needed | Must be consistent with state/bank/Stripe |
| Mailing address | Needed | Can differ if appropriate |
| Entity type | LLC | Confirm single-member or multi-member |
| Reason for applying | Started new business | Likely choice |
| Business activity | Software/SaaS/AI services | Use consistent description |
| Expected employees | Needed | Likely 0 initially unless hiring |
| Tax year close | Needed | Usually December for single-member/default |

## Responsible Party

The IRS defines the responsible party as the person who owns, controls, or exercises effective control over the entity and directly or indirectly manages funds and assets. A nominee should not apply.

Source: https://www.irs.gov/businesses/small-businesses-self-employed/responsible-parties-and-nominees

## EIN Data Worksheet

| Field | Value To Prepare |
| --- | --- |
| Legal name of entity | TBD |
| Trade name / DBA | TBD |
| Responsible party legal name | TBD |
| Responsible party SSN/ITIN | Do not store in repo |
| Entity address | TBD |
| County and state | TBD |
| Start date | TBD |
| Closing month of accounting year | TBD |
| Number of employees expected | TBD |
| Principal activity | Software/SaaS/AI intelligence services |
| Primary product/service | AI Assassins SaaS subscription and intelligence products |

## Security Rules

- Do not store SSN, ITIN, EIN letter, bank account numbers, or Stripe identity documents in the git repository.
- Store EIN confirmation in secure local/cloud storage outside the repo.
- Keep a redacted copy in the business records folder if needed.
- Use the exact legal name and EIN consistently across bank, Stripe, tax accounts, and contracts.

## Post-EIN Actions

1. Save EIN confirmation letter.
2. Update business records with EIN.
3. Open business bank account.
4. Create IRS business tax account if appropriate.
5. Update Stripe business profile.
6. Add EIN to accounting tool.
7. Prepare W-9 for future vendor/customer requests.

## Readiness Assessment

EIN readiness: 40 / 100

Blockers:

- LLC formation not verified complete.
- Responsible party data not documented outside repo.
- Entity legal name and state are not finalized.

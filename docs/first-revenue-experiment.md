# QALAI first-revenue experiment

Last updated: 2026-08-27

## Decision

The first monetization experiment is a direct, clearly labelled contextual partner offer. QALAI
will not place Google ad code on Kazakh-first pages while Kazakh is absent from Google's supported
publisher-language list.

## First two commercial surfaces

| Priority | Completed user task             | Eligible partner type              | Placement                         |
| -------: | ------------------------------- | ---------------------------------- | --------------------------------- |
|        1 | IP or self-employed route       | Bookkeeping or business banking    | After the answer and official CTA |
|        2 | Vehicle tax or auto-loan result | Motor insurance or vehicle service | After the completed result        |

No partner block is rendered until an agreement, destination, disclosure copy, payout rule and
owner approval are recorded. Official actions always stay above commercial offers.

## Required label and separation

Every paid offer must be labelled in Kazakh as `Серіктестік ұсыныс`. It must say that the placement
is paid and is not a government service or an editorial recommendation. Paid styling must not copy
the official-action styling.

## Data boundary

The partner receives only an ordinary outbound visit. QALAI never adds salary, income, tax,
benefit, vehicle, family, IIN, contact or free-form search values to the partner URL. Partner
measurement uses a fixed offer identifier and aggregate counts only.

## Launch gate

The experiment may start only when all are true:

1. the relevant task is published, trusted and indexable;
2. public contact details, privacy policy and analytics consent are live;
3. at least 100 organic task sessions establish a pre-placement completion baseline;
4. the commercial destination and disclosure have been manually approved;
5. the offer can be disabled without a deployment.

## Success and stop rules

Primary commercial metric: revenue per 1,000 resolved tasks, not page views.

Guardrails:

- Resolved Task Rate must not fall by more than 5 percentage points;
- helpful rate must not fall below 70%;
- complaints about misleading official/paid separation must remain zero;
- any personal-data leak, broken destination or unclear disclosure stops the offer immediately.

## External dependency

Finding and contracting the first partner requires the project owner. QALAI can prepare the offer
brief, placement contract and measurement once a candidate partner and commercial terms exist.

## Primary policy references

- [Google publisher supported languages](https://support.google.com/adsense/answer/9727?hl=en)
- [Google AdSense country availability](https://support.google.com/adsense/answer/13402307?hl=en)
- [Google advertising privacy disclosures](https://support.google.com/adsense/answer/1348695?hl=en)

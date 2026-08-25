# Analytics contract

The North Star is `Resolved Tasks`, measured through a stable, provider-neutral event contract.

| Event                 | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `page_view`           | Public page view                         |
| `scenario_view`       | Scenario opened                          |
| `calculator_start`    | Calculator submitted                     |
| `calculator_complete` | Valid or invalid outcome, without values |
| `official_link_click` | User moved to an official service        |
| `task_resolved`       | Strong completion proxy                  |
| `feedback_submitted`  | Helpful/not helpful                      |
| `search_submitted`    | Search intent, length bucket only        |

## Privacy boundary

Never send:

- calculator inputs or results;
- salary, family or vehicle values;
- full search text;
- names, IIN, phone numbers or email addresses;
- Payload draft content.

The current adapter forwards events only when provider IDs are configured and corresponding browser providers already exist. Script loading and consent management are intentionally deferred. With blank IDs it makes no external requests.

Search Console is a deployment/configuration task, not a runtime SDK.

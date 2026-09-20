# Dominoes Tournament

A free, offline tournament desk for dominoes with rotating partners, individual standings, team playoffs, and a Hawaii-themed TV display.

## Use the hosted app

Open [Hawaiian domino](https://finol-digital.github.io/dominoes-tournament/) in your browser. For the display screen, use [TV view](https://finol-digital.github.io/dominoes-tournament/?tv=1).

The hosted app saves registrations and results only in your browser. To move an existing local event online, export a backup from the local tracker and restore it on the hosted app. Use the same browser/profile on the same computer for the organizer and TV tabs; other devices do not share the event.

GitHub Pages publishes the root of the `main` branch. The `.nojekyll` file serves the app as static files, and `index.html` opens the standalone tracker while retaining the TV setting. Rebuild `Domino-Night.html` with `python build.py` after source changes, then commit and push to publish updates.

## Start the tracker

Download or clone this repository. Open **Domino-Night.html** in Chrome or Edge. The file contains the entire app, including its artwork; no account, subscription, installation, or internet connection is required.

On Windows, you can also double-click **Open Tracker.cmd**. If Python is available, the launcher serves the app at <http://127.0.0.1:8765/Domino-Night.html>. Otherwise it opens the standalone HTML file. If Windows blocks the launcher, open the HTML file directly or run `python serve.py`.

Use the same browser and opening method throughout an event. A directly opened file and the localhost address use separate browser storage; use **Export backup** and **Restore backup** to move an event between them.

## Register players

Registration is managed by the organizer on one computer. Players do not need accounts, and this version does not provide online self-registration.

1. Open the organizer view, without `?tv=1` at the end of its address.
2. Select **Players**. Set your event name and available table count.
3. Enter the final **Player count** (8–48), then click **Apply count**. Alternatively, paste the whole roster into the names field, one player per line.
4. Replace placeholders with names. Each name must be unique; add a last initial where needed.
5. Click **Save names**. You can repeat these steps while people arrive.
6. Once registration closes, click **Generate qualifying rounds** and confirm the headcount. This locks the roster size and creates the table assignments.

After generating rounds, names can be corrected on their original lines. **Do not reorder the lines:** results belong to those roster slots. To add or remove players after generation, export a backup and use **Players → Start new event**, then edit the roster and regenerate. Starting a new event clears the schedule and results.

See [the registration guide](docs/registration.md) for a short event-day checklist and late-arrival instructions.

## Tournament format

- Exactly four played qualifying matches per player, with changing partners and no repeated teammates. The scheduler minimizes repeated tablemates.
- Each table has two teams of two. With an uneven headcount, byes rotate as evenly as possible. With more players than seats, rounds are split into waves.
- A match ends when one team reaches 100 or more. Both teammates receive their team's entire final score, including points above 100.
- Standings use **win percentage**, then **average points per played match**, then a **saved random draw**. Byes count as neither matches nor points.
- Every player plays exactly four qualifying matches. Players who reach four are not scheduled again. The last round may use fewer tables, only for players still needing a game.
- The top eight individual players become four teams. Semifinals are **(1+8) vs (4+5)** and **(2+7) vs (3+6)**.
- Winners meet in the final with the same partners. Playoff scores start at zero.

The progress counter shows completed qualifying **rounds out of the scheduled total**, not the total number of table games. For 24 players the total is four rounds. Uneven headcounts usually need five rounds; 11 players need six.

Older events remain loadable. Select **Rebalance remaining matches** to replace unplayed pairings while preserving recorded matches and scores. Reprint the schedule afterward. Rebalancing downloads a backup and clears any old playoff bracket after confirmation. If results already include more than four games for a player, or the remaining games cannot form four-player tables, the app keeps the event unchanged and asks you to export a backup and start a new event. New playoffs require exactly four played qualifying games per player.

## Scores, TV display, and backups

Enter confirmed scores under **Qualifying rounds**. Finish all tables and waves in a round before starting the next round. After qualifying, review **Standings**, publicly click **Draw ties & create playoffs**, then enter scores under **Playoffs**.

Click **Open TV display**, move that window to an extended display or cast it to your TV, and use **Full screen**. The display automatically cycles through standings pages and updates as scores are saved.

**The organizer and TV tabs must use the same browser/profile on the same computer.** This is not a shared server for scoring from multiple phones. Hosting the static files elsewhere does not make event data sync across devices.

Progress is stored in the browser. Keep only one organizer tab open and export a JSON backup after every round. Restore that backup when changing computers, browsers, or opening methods. Avoid private browsing for an event. CSV exports are for reading standings, not restoring an event.

The repository contains only the app, generic placeholders, and documentation. It does not contain live player registrations or results.

## Printable rules

Use **Rules & help → Print rules** for a handout reflecting the current player and table counts, or print [Tournament Rules.pdf](Tournament%20Rules.pdf). The host still needs to announce the domino variant and house gameplay rules.

## Development

The app uses plain JavaScript, CSS, and inline SVG with no external web dependencies.

| File | Purpose |
| --- | --- |
| `core.js` | Scheduling, ranking, playoff logic, and backup validation |
| `app.js` | Organizer workflow, persistence, and TV synchronization |
| `template.html` | Page structure and base styles |
| `hawaii.css`, `island-header.svg` | Theme and original vector artwork |
| `build.py` | Builds the self-contained `Domino-Night.html` |
| `checks.cjs` | Checks all supported player counts and tournament calculations |
| `serve.py` | Optional local-only Python server |

After editing the sources, rebuild and run the checks:

```sh
python build.py
node checks.cjs
```

Use a current Node.js version with the global Web Crypto API (Node 22 or newer). Python 3 is required for the builder and optional server. For UI changes, inspect the organizer and TV views; keep live event data intact during testing.

The PDF can be rebuilt with `python tools/create_rules_pdf.py` after installing `reportlab` and `pypdf`. The PDF builder does not affect browser event data.

Keep generated `Domino-Night.html` committed so anyone can use the app without build tools. Do not commit real event backups or standings exports.

## License

Mozilla Public License 2.0, retained from the source project. See [LICENSE.md](LICENSE.md).

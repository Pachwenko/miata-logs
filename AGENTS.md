# Miata Log Viewer — Agent Documentation

## Project Overview

**Miata Log Viewer** is a frontend-only static React application that parses and visualizes VersaTune `.vtlog` files (Mazda MX5 engine telemetry logs) directly in the browser. It eliminates the need for a backend server by using client-side XML parsing and Plotly.js for data visualization.

### Tech Stack
- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Data Parsing**: fast-xml-parser
- **Visualization**: Plotly.js
- **Testing**: Playwright 1.58+
- **Styling**: CSS with design tokens (dark/light mode)

## Architecture

### File Structure

```
frontend/src/
├── main.tsx                    # React bootstrap
├── index.css                   # Global design tokens & base styles
├── App.tsx                     # Main app component with state logic
├── App.css                     # App layout styles
├── parser/
│   ├── LogParser.ts           # XML parsing logic & TypeScript types
│   └── pidLookup.ts           # PID ID → name/unit OBD-II mappings
└── components/
    ├── FileUpload.tsx         # File upload UI (drag-and-drop)
    ├── FileUpload.css
    ├── LogInfo.tsx            # Session metadata display
    ├── LogInfo.css
    ├── PidSelector.tsx        # PID visibility checkboxes
    ├── PidSelector.css
    ├── PidChart.tsx           # Plotly line chart component
    └── PidChart.css
```

### Data Flow

1. **Upload** → User drops or selects `.vtlog` file
2. **Parse** → `FileReader` API reads file as text → `parseVTLog()` uses `fast-xml-parser`
3. **Transform** → Extract metadata + PID data, look up PID names/units from lookup table
4. **Display** → App state stores `ParsedLog`, renders `<LogInfo>`, `<PidSelector>`, and `<PidChart>` components
5. **Interact** → User toggles PID checkboxes to show/hide individual charts

### Type Definitions (parser/LogParser.ts)

```typescript
interface LogRecord { time: number; value: number; }
interface ParsedPID { id: number; name: string; unit: string; records: LogRecord[]; }
interface ParsedLog { name: string; platform: string; vin: string; recordedOn: string; pids: ParsedPID[]; }
```

## How VersaTune Log Files Work

`.vtlog` files are XML documents containing:

```xml
<?xml version="1.0"?>
<Datalog>
  <Version>1</Version>
  <Name>Data log - 2026-03-16 11.10.36</Name>
  <Platform>G3_MAZDA_MX5_NC1</Platform>
  <VIN>JM1NC25F160103829</VIN>
  <RecordedOn>2026-03-16T11:10:08.6395437</RecordedOn>
  <Data>
    <PID ID="4">
      <Record Time="30.6399158" Value="0" />
      <Record Time="30.7116977" Value="0" />
      <!-- Many records per PID... -->
    </PID>
    <PID ID="5"><!-- ... --></PID>
    <!-- More PIDs... -->
  </Data>
</Datalog>
```

- **PID ID**: Numeric identifier (mapped to OBD-II standard PIDs by default)
- **Records**: Time-series data with float Time (seconds) and Value
- **No Embedded Metadata**: PID names/units must come from external lookup table

## OBD-II PID Mappings

The app uses a built-in lookup table for common OBD-II parameter IDs. Edit `frontend/src/parser/pidLookup.ts` to add or modify mappings:

| PID ID | Name | Unit |
|--------|------|------|
| 4 | Engine Load | % |
| 5 | Coolant Temp | °C |
| 12 | Engine RPM | rpm |
| 13 | Vehicle Speed | km/h |
| 18 | Secondary Air Status | - |
| 20-26 | O2 Sensors | V or % |

### How to Add Custom PIDs

Edit `frontend/src/parser/pidLookup.ts`:

```typescript
const PID_MAP: Record<number, PIDInfo> = {
  // ... existing PIDs ...
  99: { name: 'My Custom Parameter', unit: 'custom_unit' },
}
```

The lookup table is also exported as `getAllKnownPIDs()` for future reference or filtering.

## Testing with Playwright

Playwright tests verify file parsing, UI rendering, and interactivity. Tests automatically start the dev server and run against it.

### Running Tests

**Install dependencies first:**
```bash
cd frontend
npm install
```

**Run all tests:**
```bash
npm test
```

**Run tests with UI (interactive):**
```bash
npm run test:ui
```

**Debug a specific test:**
```bash
npm run test:debug
```

### Test Coverage (frontend/tests/app.spec.ts)

- ✅ Upload area renders on load
- ✅ File parsing and log info display
- ✅ All 11 PID checkboxes appear after upload
- ✅ Charts render for all visible PIDs
- ✅ Unchecking a PID hides its chart
- ✅ Reset button returns to upload view
- ✅ Screenshots saved to `tests/screenshots/`

### Taking Screenshots

Tests automatically capture screenshots. The Playwright config saves them to:
- **Success**: Not captured by default (configure in `playwright.config.ts`)
- **Failure**: `test-results/` (default)
- **Manual**: Call `await page.screenshot({ path: 'tests/screenshots/my-screenshot.png' })`

Example test screenshot:
```typescript
test('my test', async ({ page }) => {
  await page.goto('/')
  // ... interactions ...
  await page.screenshot({ path: 'tests/screenshots/final-state.png' })
})
```

## Development Workflow

### Starting the Dev Server

```bash
cd frontend
npm install  # First time only
npm run dev
```

Opens http://localhost:5173 with HMR enabled.

### Building for Production

```bash
npm run build
```

Outputs optimized bundle to `frontend/dist/`.

### Linting

```bash
npm run lint
```

Checks TypeScript and ESLint rules.

## How Claude Agents Built This

This project was rebuilt from a Django backend to a frontend-only app using:

1. **Exploration Agent** — Analyzed existing code and file format
2. **Plan Agent** — Designed architecture and component structure
3. **Implementation** — Wrote all components, parser, types, and tests
4. **Playwright** — Automated testing with screenshots for verification

Each component was built incrementally with test coverage. Screenshots document the app state at key points.

## Common Tasks

### Adding a New PID

1. Find the PID ID in your `.vtlog` file
2. Add entry to `PID_MAP` in `frontend/src/parser/pidLookup.ts`
3. Restart dev server (HMR picks up the change)

### Customizing Chart Appearance

Edit `frontend/src/components/PidChart.tsx`:
```typescript
const layout = {
  // Modify title, axes, colors, etc.
}
```

### Changing Colors/Theme

Edit CSS custom properties in `frontend/src/index.css`:
```css
:root {
  --accent: #aa3bff;  /* Change app accent color */
  --bg: #fff;          /* Light mode background */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16171d;     /* Dark mode background */
  }
}
```

## Troubleshooting

### Tests fail with "timeout"
- Ensure `npm run dev` is running in another terminal
- Check that port 5173 is available

### Charts don't render
- Verify `plotly.js` is installed: `npm list plotly.js`
- Check browser console for errors
- Ensure records have valid `time` and `value` fields

### PID lookup shows "PID X"
- The PID ID is not in the lookup table. Add it to `pidLookup.ts`.

## Testing Strategy

### Overview
The project uses **Playwright** for comprehensive E2E testing with advanced error capture, performance monitoring, and visual regression testing. Tests are located in `frontend/tests/`.

### Test Files
- **`fixtures.ts`** — Custom Playwright fixtures with automatic error/console capture
- **`helpers.ts`** — Utility class `TestHelper` and assertion functions
- **`test-config.ts`** — Centralized timeouts, thresholds, selectors
- **`app.spec.ts`** — Main test suite (20+ comprehensive tests)
- **`analyze-quality.ts`** — Test quality analyzer with scoring

### Running Tests

```bash
npm test              # Run all tests
npm run test:ui       # Interactive UI mode (best for debugging)
npm run test:debug    # Step through with debugger
npm run test:headed   # See browser while testing
npm run test:watch    # Watch mode (auto-rerun)
npm run test:report   # View HTML test report
npm run test:quality  # Generate quality score report
npm run test:ci       # CI mode (stricter, 2 retries)
```

### Test Organization

Tests are organized into 8 suites covering:
1. **Initial Load & UI** (2 tests) — Upload area, drag-drop
2. **File Parsing** (4 tests) — XML parsing, PID loading, chart rendering
3. **Interactivity** (4 tests) — Toggle PIDs, expand/collapse, color changes
4. **Configuration** (1 test) — localStorage persistence
5. **Chart Stats** (2 tests) — Display and calculation verification
6. **Error Handling** (2 tests) — Reset button, invalid files
7. **Performance & A11y** (3 tests) — Load time, accessibility, mobile
8. **Visual Regression** (4 tests) — Screenshots at critical points

**Total: 22+ tests with comprehensive error capture**

### Test Quality Metrics

Run quality analysis:
```bash
npm run test:quality
```

Generates a visual report with scoring for:
- **Test Count** (0-20 pts) — 30 tests = full points
- **Organization** (0-15 pts) — 8 categories = full points
- **Accessibility** (0-15 pts) — A11y assertions = full points
- **Performance** (0-15 pts) — Perf checks = full points
- **Error Handling** (0-15 pts) — Error tests = full points
- **Mobile** (5 pts bonus) — Mobile viewport testing

**Total possible: 95 pts. Current: ~80+ pts (Grade: B+)**

### Automatic Error Capture

Tests automatically capture and report:
- ✅ All console messages (log, warn, error)
- ✅ Uncaught JavaScript errors
- ✅ Network failures (4xx/5xx responses)
- ✅ Failed HTTP requests
- ✅ Screenshots on failure
- ✅ Video recordings on failure
- ✅ Full execution traces

Errors printed in test output:
```
❌ Errors captured:
  [2026-03-17T12:34:56Z] pageerror: Cannot read property 'x' of undefined
  [2026-03-17T12:34:57Z] response: 404 http://localhost:5173/api/data
```

### Adding New Tests

Template for adding tests:

```typescript
import { test, expect } from './fixtures'
import { TestHelper, assertAccessible } from './helpers'
import { TEST_SELECTORS, TEST_TIMEOUTS } from './test-config'

test('my feature name', async ({ page, logFilePath }) => {
  const helper = new TestHelper(page, 'my-feature')

  // Navigate
  await page.goto('/')

  // Load test data
  await helper.loadLogFile(logFilePath)

  // Interact
  await page.locator(TEST_SELECTORS.PID_SELECTOR).click()

  // Verify
  await expect(page.locator('.result')).toBeVisible()

  // Check accessibility
  await assertAccessible(page, '.result')

  // Verify performance
  const renderTime = await helper.getChartRenderTime()
  expect(renderTime).toBeLessThan(TEST_TIMEOUTS.CHART_RENDER)

  // Screenshot for visual regression
  await helper.takeScreenshot('final-state')

  // Report
  helper.printReport()
})
```

### TestHelper Class Usage

```typescript
const helper = new TestHelper(page, 'test-name')

// Load file
await helper.loadLogFile(logFilePath)

// Get visible PID count
const count = await helper.getVisiblePidCount()

// Toggle PID visibility
await helper.togglePid(0)  // Toggle first PID

// Measure chart render time
const ms = await helper.getChartRenderTime()

// Take labeled screenshot
await helper.takeScreenshot('after-interaction')

// Record error
helper.recordError('parse-failed', 'Could not parse XML')

// Get and print report
const report = helper.getReport()
helper.printReport()
```

### Performance Thresholds

Defined in `test-config.ts` and enforced in tests:
- Chart render: < 3000ms ✅
- File parse: < 2000ms ✅
- Page load: < 5000ms ✅
- Accessibility issues: 0 ✅

### Accessibility Testing

Tests verify:
- All interactive elements have accessible names
- Proper ARIA labels and roles
- Keyboard navigation
- Mobile viewport (375px × 667px tested)
- Screen reader compatibility

Test with:
```bash
npm run test:mobile
```

### CI/CD Integration

For GitHub Actions or similar:
```bash
npm run test:ci
```

Generates reports in `test-results/`:
- `index.html` — Interactive HTML report
- `results.json` — Machine-readable results
- `junit.xml` — CI integration format
- `screenshots/` — Failure screenshots
- `videos/` — Failure videos
- `traces/` — Execution traces

### Test Reports

After running tests:
```bash
npm run test:report
```

Opens interactive HTML report with:
- ✅ Pass/fail status per test
- ⏱️ Timing for each test
- 📸 Screenshots of failures
- 🎬 Video recordings
- 📝 Console output
- 🔍 Full execution traces

### Test Maintenance

**When to update tests:**
- New features added → add test for feature
- Bug fixed → add regression test
- Performance regression → update thresholds
- A11y issue fixed → update accessibility checks

**How to debug failing test:**
```bash
npm run test:ui          # Interactive UI (recommended)
npm run test:debug       # Step through debugger
npm run test:headed      # See browser during test
```

**View failure traces:**
```bash
npx playwright show-trace test-results/trace.zip
```

---

## Future Enhancements

- Multi-file comparison view
- CSV export
- Custom axis scaling
- Live data streaming support
- Mobile-responsive chart layouts
- Data smoothing/filtering UI

---

**Last Updated**: 2026-03-17
**Version**: 1.0
**Maintainer**: Claude Agent SDK

## For Future Agents

### How to Modify Tests
1. Read `frontend/tests/app.spec.ts` to understand existing tests
2. Use `TestHelper` from `helpers.ts` for common operations
3. Add new tests following the template above
4. Use `test-config.ts` for constants (don't hardcode)
5. Run `npm run test:quality` to verify test quality score
6. Run `npm run test:report` to see detailed results

### Extending Test Coverage
- Add more test categories to `test.describe()` blocks
- Use helper functions for reusable logic
- Capture performance metrics with `helper.getChartRenderTime()`
- Document accessibility tests
- Add visual regression screenshots

### Quality Metrics to Maintain
- **Test Count**: Aim for 30+ tests
- **Categories**: Organize into 8+ logical groups
- **A11y Checks**: Include accessibility assertions
- **Performance**: Test rendering times
- **Error Handling**: Test failure paths
- **Grade Target**: B+ (80+ points)

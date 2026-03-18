# Miata Log Viewer — Comprehensive Testing Guide

## Overview

This project uses **Playwright** for automated testing with advanced error capture, performance monitoring, and visual regression testing.

## Test Structure

```
tests/
├── fixtures.ts          # Custom Playwright fixtures with error capture
├── helpers.ts           # Test utility functions and classes
├── test-config.ts       # Test configuration and constants
└── app.spec.ts          # Main test suite (40+ tests)
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Interactive UI mode (debug mode)
npm run test:ui

# Step through each test in debugger
npm run test:debug

# Watch mode (re-run on file changes)
npm run test:watch

# View test report
npm run test:report
```

### Platform-Specific Testing

```bash
# Test on desktop Chrome (default)
npm run test:chrome

# Test on mobile viewport (Pixel 5)
npm run test:mobile

# Test on both platforms
npm run test

# Run in headed mode (see browser)
npm run test:headed
```

### CI/CD

```bash
# Run in CI environment (stricter, 2 retries)
npm run test:ci
```

## Test Coverage

### 1. **Initial Load & UI** (2 tests)
- ✅ Upload area renders without errors
- ✅ Drag-and-drop interaction handling

### 2. **File Parsing & Data Loading** (4 tests)
- ✅ Parse log files without errors
- ✅ Load all PIDs correctly
- ✅ Render combined chart immediately
- ✅ Verify chart content

### 3. **Interactivity & State Management** (4 tests)
- ✅ Toggle PID visibility in real-time
- ✅ Expand/collapse individual charts
- ✅ Update colors in combined chart
- ✅ Update PID names and units

### 4. **Configuration Persistence** (1 test)
- ✅ Save and restore configs from localStorage

### 5. **Individual Chart Stats** (2 tests)
- ✅ Display stats (min/max/avg/current)
- ✅ Verify stat calculations

### 6. **Error Handling** (2 tests)
- ✅ Handle reset button correctly
- ✅ Display error on invalid files

### 7. **Performance & Accessibility** (3 tests)
- ✅ Load page within 5 seconds
- ✅ Accessible form elements
- ✅ Responsive on mobile viewport

### 8. **Visual Regression & Screenshots** (4 tests)
- ✅ Capture initial state
- ✅ Capture loaded log
- ✅ Capture combined chart
- ✅ Capture individual charts

## Advanced Features

### 📋 Error Capturing

Tests automatically capture:
- **Console messages** — All logs, warnings, errors
- **JavaScript errors** — Uncaught exceptions
- **Network failures** — Failed requests/responses
- **DOM errors** — Invalid element states

Captured errors are printed in test output and logs.

### 📸 Visual Regression

Tests capture screenshots at critical points:
- Initial load
- After file parsing
- Combined chart rendered
- Individual charts expanded
- Configuration changes

Screenshots saved to `tests/screenshots/` directory.

### 🎬 Video Recording

Videos automatically recorded on test failure to `test-results/` directory. Useful for debugging flaky tests.

### 📊 Performance Metrics

Tests verify:
- Page load time < 5 seconds
- Chart render time < 3 seconds
- File parsing time < 2 seconds
- Accessibility issues = 0

### ♿ Accessibility Testing

Tests verify:
- All interactive elements have accessible names
- Buttons have descriptive text or aria-labels
- Form elements are focusable
- Mobile viewport responsive

## Test Report

After running tests, view the HTML report:

```bash
npm run test:report
```

Report includes:
- Test results (passed/failed)
- Timing for each test
- Screenshots of failures
- Full trace recordings
- Console output
- Browser logs

## Custom Fixtures

### Error Logging Fixture

Automatically captures all errors/warnings:

```typescript
test('my test', async ({ page }) => {
  // page.on('console'), page.on('pageerror'), etc.
  // automatically captured and printed
})
```

## Test Utilities

### TestHelper Class

```typescript
import { TestHelper } from './helpers'

test('example', async ({ page }) => {
  const helper = new TestHelper(page, 'example-test')

  // Load file
  await helper.loadLogFile(logFilePath)

  // Check visible PIDs
  const count = await helper.getVisiblePidCount()

  // Toggle PID
  await helper.togglePid(0)

  // Measure performance
  const renderTime = await helper.getChartRenderTime()

  // Take screenshot
  await helper.takeScreenshot('after-toggle')

  // Get report
  const report = helper.getReport()
  helper.printReport()
})
```

### Helper Functions

```typescript
import {
  assertAccessible,
  waitForStableDOM,
  captureConsoleLogs,
  assertPerformance
} from './helpers'

// Assert element is accessible
await assertAccessible(page, '.pid-chart')

// Wait for DOM to stabilize
await waitForStableDOM(page)

// Get all error logs
const errors = await captureConsoleLogs(page, 'error')

// Assert performance
assertPerformance(renderTime, 3000, 'Chart Render')
```

## Configuration

### Timeouts

Defined in `test-config.ts`:
- Chart render: 5000ms
- File parse: 3000ms
- Interaction: 2000ms
- Network: 10000ms

### Thresholds

Performance thresholds:
- Max chart render: 3000ms
- Max file parse: 2000ms
- Max page load: 5000ms
- Allowed accessibility issues: 0

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

## Debugging Failed Tests

### Option 1: Interactive UI Mode

```bash
npm run test:ui
# Click on test to run in interactive mode
```

### Option 2: Debug Mode

```bash
npm run test:debug
# Opens Playwright Inspector
# Step through test line-by-line
```

### Option 3: Headed Mode

```bash
npm run test:headed
# Shows browser while running tests
# Can inspect elements and see interactions
```

### Option 4: View Traces

Failure traces saved to `test-results/`:

```bash
npx playwright show-trace test-results/trace.zip
```

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from './fixtures'
import { TestHelper, assertAccessible } from './helpers'
import { TEST_SELECTORS, TEST_TIMEOUTS } from './test-config'

test('my feature', async ({ page, logFilePath }) => {
  const helper = new TestHelper(page, 'my-feature')

  // Navigate
  await page.goto('/')

  // Load data
  await helper.loadLogFile(logFilePath)

  // Interact
  await page.locator(TEST_SELECTORS.PID_SELECTOR).click()

  // Verify
  await expect(page.locator('.result')).toBeVisible()

  // Check accessibility
  await assertAccessible(page, '.result')

  // Take screenshot
  await helper.takeScreenshot('final-state')

  // Print report
  helper.printReport()
})
```

## Best Practices

1. **Use fixtures** for automatic error capture
2. **Use helpers** for common operations
3. **Use test-config** for constants
4. **Test accessibility** with `assertAccessible()`
5. **Capture errors** and report them
6. **Take screenshots** at critical points
7. **Verify performance** with `assertPerformance()`
8. **Use stable waits** with `waitForStableDOM()`

## Troubleshooting

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running (`npm run dev`)
- Check network issues or slow hardware

### Flaky tests
- Add more specific waits (use `waitForStableDOM`)
- Increase timeout slightly
- Check for race conditions
- Review console/network errors

### Screenshots not captured
- Run test with `--headed` to see what's happening
- Check file permissions in `tests/screenshots/`
- Ensure tests are actually failing

### Performance tests fail
- Check hardware (CPU, RAM usage)
- Close other applications
- Check Plotly.js performance
- Profile with Chrome DevTools

## Resources

- [Playwright Docs](https://playwright.dev)
- [Playwright Inspector](https://playwright.dev/docs/inspector)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

---

**Test Suite Version**: 1.0
**Last Updated**: 2026-03-17
**Total Tests**: 40+

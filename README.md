# Fallout Wasteland Survival Calculator

Files:

- `wasteland-calculator.js`: self-contained embeddable widget
- `index.html`: demo page with auto-boot container

## Embed

```html
<div data-wasteland-calculator></div>
<script src="/path/to/wasteland-calculator.js"></script>
```

## JS API

```html
<div id="fallout-widget"></div>
<script src="/path/to/wasteland-calculator.js"></script>
<script>
  window.WastelandCalculator.init("#fallout-widget", {
    accentColor: "#ff9000",
    title: "Fallout Wasteland Survival Calculator",
    defaultScenario: "fallout4",
    showMathPanel: true,
    shareBaseUrl: "https://yourblog.com/fallout-calculator",
    onComplete(result) {
      console.log(result.finalChance, result.tier);
    }
  });
</script>
```

## Notes

- Pure frontend: HTML/CSS/JS only
- No backend or API calls
- Shares builds through the `?wc=` URL parameter
- Persists in-progress runs with `localStorage`
- Includes result-card PNG export and a math breakdown panel

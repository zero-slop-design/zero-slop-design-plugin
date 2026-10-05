# Observation data

Use this JSON format for measured interface values.
Keep all values apart from the design file.

```json
{
  "version": 1,
  "source": {"url": "http://localhost:3000", "captured": "2026-10-05"},
  "observations": [
    {
      "path": "colors.primary",
      "value": "#1D4ED8",
      "location": "button.primary",
      "viewport": {"width": 1280, "height": 800},
      "mode": "default",
      "state": "default"
    }
  ]
}
```

1. Record a source path or URL and source date.
2. Put the design path in `path`.
3. Put the measured value in `value`.
4. Record the interface location, viewport, mode, and state.
5. Use the same units as the design token.
6. Change equivalent color notation to uppercase hexadecimal notation before comparison.
7. Keep estimates out of the observations array.
8. Record missing measured data in the inspection report.

The CLI compares the same values after token resolution.
It compares only the supplied observations.
A result with no differences does not show full interface conformance.

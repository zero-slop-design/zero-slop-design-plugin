---
# Starter choices are examples. Replace them with the project's design decisions.
# This file records draft intent; a lint pass does not review the visual choices.
version: alpha
name: Project Interface
description: Task interface with grouped information, visible labels, and one primary action.
x-zsd:
  profile: "0.1"
  kind: starter
  source:
    method: authored
  review:
    status: draft
  intent:
    audience: People who review information and complete short forms.
    primary-task: Review information and submit an action.
    character: Visible labels, grouped content, and a clear action hierarchy.
    density: comfortable
    theme: light
    references: []
  preferences:
    must-use:
      - Visible text labels for form controls.
      - One primary action within each task group.
    must-avoid:
      - Decorative effects that compete with task content.
      - Status feedback that depends only on color.
    preserve: []
  implementation:
    token-source: DESIGN.md
    component-sources: []
    style-sources: []
    font-assets: []
    image-assets: []
    icon-assets: []
  unresolved:
    - Project audience, primary task, and preferred visual character.
    - Brand colors, typography, density, and theme coverage.
    - Existing component paths and approved asset sources.
    - Domain components, real content, and responsive exceptions.
  layout:
    content-max: 960px
    viewport-min: 320px
  breakpoints:
    md: 640px
  border:
    width-default: 1px
    color-default: "{colors.outline}"
  motion:
    duration-fast: 120ms
    easing-standard: ease-out
  accessibility:
    target-min: "{spacing.control-height}"
    focus-width: 2px
    focus-offset: 2px
    focus-color: "{colors.primary}"
colors:
  primary: "#1D4ED8"
  primary-hover: "#1E40AF"
  on-primary: "#FFFFFF"
  surface: "#FFFFFF"
  on-surface: "#111827"
  surface-muted: "#F3F4F6"
  on-surface-muted: "#374151"
  outline: "#6B7280"
  error: "#B91C1C"
  on-error: "#FFFFFF"
typography:
  headline-md:
    fontFamily: "system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px
  body-md:
    fontFamily: "system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  label-md:
    fontFamily: "system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  section: 32px
  control-height: 44px
rounded:
  none: 0px
  sm: 4px
  md: 8px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
    height: "{spacing.control-height}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
    height: "{spacing.control-height}"
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
    height: "{spacing.control-height}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
    height: "{spacing.control-height}"
  card:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  alert-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
---

# Project Interface

## Overview

This starter describes a task interface with grouped information and one primary action.
Use `x-zsd.intent` to record the project's audience and purpose.
Replace the example choices with the project's design decisions.

### Implementation

Read the paths in `x-zsd.implementation` before UI changes.
Reuse the listed components and assets within the requested scope.
Use the front matter for values and the body for application rules.
Record unresolved choices in `x-zsd.unresolved`.

## Colors

- `primary`: Use for the primary action and keyboard focus.
- `primary-hover`: Use for the primary action's hover state.
- `on-primary`: Use for text on primary action surfaces.
- `surface`: Use for the page and input surfaces.
- `on-surface`: Use for text on the page and input surfaces.
- `surface-muted`: Use for grouped content and secondary actions.
- `on-surface-muted`: Use for text on grouped content and secondary actions.
- `outline`: Use for control boundaries and content dividers.
- `error`: Use for error text, invalid control boundaries, and error alert surfaces.
- `on-error`: Use for text on error alert surfaces.

## Typography

- `headline-md`: Use for the page title. Keep one page title within the main content.
- `body-md`: Use for descriptions, input text, and feedback.
- `label-md`: Use for control labels and action text. Use sentence case.

Keep text selectable. Respect the user's text-size settings.
Record project font assets and fallback behavior in `x-zsd.implementation`.

## Layout

Center the content within `x-zsd.layout.content-max`.
Use `lg` for page padding, `section` between task groups, and `xl` between major content blocks.
Use `md` inside controls, `sm` between related items, and `xs` between a label and its helper text.
Keep pointer targets at least `control-height` in both dimensions.

### Responsive behavior

Below `x-zsd.breakpoints.md`, stack fields and actions in one column.
At larger widths, place related fields in columns when their labels and values fit.
Support `x-zsd.layout.viewport-min` without page-level horizontal scrolling.
Wrap long labels and messages. Keep wide data in its own labeled scroll region.
Preserve content order and the primary action's position across layouts.

## Elevation & Depth

Use surface contrast, spacing, and boundaries to show hierarchy.
Apply `x-zsd.border.width-default` and `x-zsd.border.color-default` to control boundaries.
Keep task content visually distinct from adjacent navigation.

## Shapes

- `none`: Use for full-width regions and dividers.
- `sm`: Use for controls and alerts.
- `md`: Use for grouped content cards.

## Components

### Button

Use `button-primary` for the main action within a task group.
Use `button-secondary` for an alternative action.
Use labels that name the action.

- On hover, use `button-primary-hover` for the primary action.
- On focus, use the focus rules in Accessibility.
- On press, keep the control and label position fixed.
- During loading, keep the width. Show a progress label and prevent duplicate submission.
- Disable an action only when it cannot run. Keep its label readable and explain the reason when useful.
- After success, show the result beside the action.

### Input

Use `input` with a visible label and associated helper text.
Place the label above the control. Keep helper and error text beside the related field.

- On hover, keep the label, value, and boundary visible.
- On focus, use the focus rules in Accessibility.
- For an invalid value, use `error` on its boundary and message. State how to correct the value.
- For a disabled field, explain why the user cannot edit it.
- Preserve entered values during loading and after errors.

### Card

Use `card` for one related group of information.
Use a heading that describes the group.
Keep interactive elements as separately labeled controls within the card.
For an empty group, explain what appears there and provide the relevant next action.

### Alert

Use `alert-error` for a task error that needs the user's attention.
State what failed, preserve the user's work, and provide a recovery action.
Announce task feedback to assistive technology. Preserve focus unless the task requires a change.

## Do's and Don'ts

- Do use named tokens for repeated values.
- Do preserve confirmed choices in `x-zsd.preferences.preserve`.
- Do report conflicts between these rules and the requested UI change.
- Do record unresolved design choices in `x-zsd.unresolved`.
- Do use real content to check narrow layouts and text wrapping.
- Do not introduce a font, color, or decorative effect without a recorded design reason.
- Do not use placeholder text as the only input label.
- Do not hide keyboard focus indicators.
- Do not use color as the only status signal.

## Motion

Use `x-zsd.motion.duration-fast` and `x-zsd.motion.easing-standard` for state transitions.
With reduced motion, change states immediately. Keep progress and completion messages visible.

## Iconography

Select one icon family and record its source in `x-zsd.implementation.icon-assets`.
Use visible labels for unfamiliar actions. Give an icon-only control an accessible name.
Use decorative icons only when they clarify grouping or status.

## Imagery

Record image sources in `x-zsd.implementation.image-assets`.
Use images that explain the content. Preserve the intended crop and provide relevant alternative text.
For decorative images, use empty alternative text.

## Accessibility

Support keyboard operation and a tab order that follows the reading order.
Use `x-zsd.accessibility.focus-width`, `x-zsd.accessibility.focus-offset`, and `x-zsd.accessibility.focus-color` for a visible focus outline.
Keep focus visible when sticky elements or dialogs cover part of a page.
Expose input errors through text and programmatic associations.
Check text and control contrast against the surfaces that users actually see.
At text zoom, keep content, labels, and actions visible.

### Review checks

Compare the interface with the recorded preferences and references.
Review narrow layouts, long content, keyboard focus, component states, and reduced motion.
Record the review's scope and outstanding choices. Keep lint results separate from preference review.

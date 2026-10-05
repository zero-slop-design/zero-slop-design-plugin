---
name: define-interaction-states
description: "Set component states in DESIGN.md. Use for focus, hover, loading, error, selection, and motion behavior."
---

# Interaction state data

Read [Procedure data](../../references/procedure.md) before the task.
Read [Design format](../../references/design-format.md) for document changes.
Read [Technical terms](../../references/technical-terms.md) for skill language.

## Task

Set the applicable states for each component family.

## Input

- Design file and component families.
- Task flows and developer selections.
- Available component behavior.

## Procedure

1. Read the task flows and component data.
2. Write a list of applicable default, hover, focus, pressed, selected, and disabled states.
3. Write a list of applicable loading, empty, error, and success states.
4. Record each trigger, result that the user can see, and recovery step.
5. Set keyboard operation and focus movement.
6. Set a condition that prevents the same submission again when applicable.
7. Set motion tokens and reduced motion behavior.
8. Use project components for applicable states.
9. Mark states that are not applicable with their conditions.
10. Change only interface state data and related instructions.
11. Do the document checks from the procedure.

## Output

- Component state instructions and applicable motion tokens.

## Completed task

- Each applicable state has a trigger and a result that the user can see.
- Recovery steps and keyboard behavior are clear.

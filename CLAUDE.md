# Git Workflow — Standing Rules

## Branch: Always main

- All commits and pushes go directly to `main` only.
- Never create a pull request.
- Never push to a feature branch.

## Required sequence before every change

```
git checkout main
git pull origin main
```

## Required check before every commit

```
git branch
```

Confirm the output shows `* main` before proceeding with any commit.

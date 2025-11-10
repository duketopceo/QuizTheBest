# Branch Strategy

This project uses a branch-based development strategy optimized for enterprise-level development.

## Branch Structure

### `main` Branch
- **Purpose**: Production-ready code for core application
- **Contains**: Backend API, Frontend web app, shared code
- **Status**: Stable, tested, ready for deployment
- **Protection**: Should require pull request reviews before merging

### `android-app` Branch
- **Purpose**: Android mobile app development
- **Contains**: React Native mobile app, Android-specific configurations
- **Status**: Active development branch for mobile features
- **Merge Strategy**: Regularly merged back to `main` when features are stable

## Workflow

### For Core Application Development (Backend/Frontend)
```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit
git add .
git commit -m "Add feature X"

# Push and create PR to main
git push origin feature/your-feature-name
```

### For Android App Development
```bash
# Start from android-app branch
git checkout android-app
git pull origin android-app

# Create feature branch for Android
git checkout -b feature/android-your-feature

# Make changes, commit
git add .
git commit -m "Add Android feature X"

# Push and create PR to android-app
git push origin feature/android-your-feature
```

### Merging Android Features to Main
```bash
# When Android feature is stable
git checkout main
git merge android-app
# Or create PR: android-app → main
```

## Branch Naming Conventions

- `main` - Production branch
- `android-app` - Android development branch
- `feature/*` - Feature development branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical production fixes

## Best Practices

1. **Keep branches focused**: One feature per branch
2. **Regular merges**: Merge `android-app` to `main` regularly (weekly/bi-weekly)
3. **Pull before push**: Always pull latest changes before pushing
4. **Clean commits**: Write clear, descriptive commit messages
5. **PR reviews**: All changes to `main` should go through PR review

## Android-Specific Considerations

The `android-app` branch may contain:
- Android-specific dependencies
- React Native configurations
- Android Studio project files
- Mobile-specific environment variables
- Platform-specific code

When merging to `main`, ensure:
- Mobile code doesn't break web/backend
- Shared code is compatible with both platforms
- Environment variables are properly configured
- Dependencies don't conflict

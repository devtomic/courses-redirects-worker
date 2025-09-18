# Courses Redirects Worker

This Cloudflare Worker handles redirects from Teachable course URLs (courses.m.academy) to the new Codex platform (m.academy).

## Overview

The worker ONLY intercepts and redirects URLs for migrated courses. All other traffic passes through to the origin Teachable platform.

### Redirected URLs (only for migrated courses):
- `/courses/{courseId}/lectures/{lessonId}` → `/lessons/{lessonSlug}/`
- `/courses/{courseSlug}/lectures/{lessonId}` → `/lessons/{lessonSlug}/`
- `/courses/{courseId}` → `/courses/{courseSlug}/start/`
- `/courses/{courseSlug}` → `/courses/{courseSlug}/start/`

### Pass-through URLs (not intercepted):
- Enrollment pages
- Payment/checkout pages
- Admin pages
- Any course not yet migrated
- All other Teachable functionality

All redirects are permanent (301) with trailing slashes for SEO optimization.

## Directory Structure

```
courses-redirects-worker/
├── src/
│   ├── index.js                    # Main worker logic
│   └── redirects/
│       ├── index.js                # Aggregates all course modules
│       └── [course-slug].js        # Course-specific redirect mappings
├── mappings/                        # CSV mapping files for reference
├── test-redirects.js               # Test script to validate redirects
├── package.json
├── wrangler.jsonc                  # Worker configuration
└── README.md
```

## Adding New Courses

To add redirects for a new course:

1. **Generate the redirect mappings:**
   ```bash
   cd /Users/markshust/Sites/codex
   ./scripts/generate-course-redirects.sh [COURSE_ID]
   ```
   This will:
   - Fetch course data from Teachable API
   - Query Codex database for course/lesson mappings
   - Generate CSV mapping file
   - Create JavaScript redirect module in the worker

2. **Update the main index.js:**
   Import the new course module and add it to the `courseModules` object:
   ```javascript
   import * as newCourse from './redirects/[course-slug].js';

   const courseModules = {
     // ... existing courses
     '[course-id]': newCourse,
     '[course-slug]': newCourse
   };
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```
   Then test with curl:
   ```bash
   curl -I http://localhost:8787/courses/[course-id]/lectures/[lesson-id]
   ```

4. **Deploy to production:**
   ```bash
   npm run deploy
   ```

## Testing

Run the test script to see test URLs:
```bash
node test-redirects.js
```

Test locally with wrangler:
```bash
npm run dev
```

## Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

The worker is configured to handle all requests to `courses.m.academy/*`.

## CSV Mapping Files

CSV mapping files are stored in both locations:
- Source: `/Users/markshust/Sites/codex/scripts/mappings/[course-slug].csv`
- Copy: `/Users/markshust/Sites/cloudflare-workers/courses-redirects-worker/mappings/[course-slug].csv`

Format:
```csv
teachable_lesson_id,codex_lesson_slug
49282120,dependency-injection-object-manager-magento
```

## How It Works

1. The worker intercepts requests to `courses.m.academy`
2. Parses the URL to extract course and lesson identifiers
3. Looks up the appropriate redirect in the course module
4. Returns a 301 redirect to the new Codex URL
5. Falls back to course start page for unmapped lessons
6. Returns 404 for completely unmapped courses

## Environment Requirements

- Codex database with courses and lessons
- Teachable API key in Codex `.env` file
- Node.js and npm
- Cloudflare account with Workers enabled
- Wrangler CLI (installed via npm)

## Troubleshooting

- **Lesson not redirecting:** Check if lesson ID exists in the generated `.js` file
- **Course not found:** Ensure course has been migrated and script has been run
- **Script fails:** Verify Teachable API key and database connection
- **Worker not deploying:** Check wrangler authentication and configuration
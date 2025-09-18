// Cloudflare Worker to handle Teachable to Codex course/lesson redirects
// Handles redirects from courses.m.academy to m.academy

// Import all course redirect modules
import * as jumpstart from './redirects/magento-2-coding-jumpstart.js';

// Map course slugs/IDs to their redirect modules
const courseModules = {
  // By course ID
  '2184079': jumpstart,
  // By course slug
  'magento-2-coding-jumpstart': jumpstart
  // Additional courses will be added here as they're migrated
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Log the incoming request for debugging
    console.log(`Incoming request: ${pathname}`);

    // ONLY handle specific redirect patterns, let everything else pass through
    // Pattern 1: /courses/{courseId}/lectures/{lessonId}
    // Pattern 2: /courses/{courseSlug}/lectures/{lessonId}
    // Pattern 3: /courses/{courseId} (ONLY if it's a known migrated course)
    // Pattern 4: /courses/{courseSlug} (ONLY if it's a known migrated course)

    const courseLectureMatch = pathname.match(/^\/courses\/([^\/]+)\/lectures\/(\d+)\/?$/);
    const courseOnlyMatch = pathname.match(/^\/courses\/([^\/]+)\/?$/);

    let redirectUrl = null;

    if (courseLectureMatch) {
      // This is a lesson URL - check if we have a redirect for it
      const courseIdentifier = courseLectureMatch[1];
      const lessonId = courseLectureMatch[2];

      console.log(`Course identifier: ${courseIdentifier}, Lesson ID: ${lessonId}`);

      // Get the appropriate course module
      const courseModule = courseModules[courseIdentifier];

      if (courseModule && courseModule.lessonRedirects) {
        // Look up the lesson redirect
        redirectUrl = courseModule.lessonRedirects[lessonId];

        if (!redirectUrl) {
          // Lesson not found in mapping, redirect to course start page
          console.log(`Lesson ${lessonId} not found, redirecting to course page`);
          if (courseModule.courseRedirects) {
            // Try to get course redirect from the module
            redirectUrl = courseModule.courseRedirects[courseIdentifier];
          }
        }
      } else {
        console.log(`Course module not found for: ${courseIdentifier} - passing through`);
        // Course not in our redirect list, pass through to origin
        return fetch(request);
      }
    } else if (courseOnlyMatch) {
      // This is a course-only URL - ONLY redirect if it's a known migrated course
      const courseIdentifier = courseOnlyMatch[1];

      console.log(`Course-only URL for: ${courseIdentifier}`);

      // Get the appropriate course module
      const courseModule = courseModules[courseIdentifier];

      if (courseModule && courseModule.courseRedirects) {
        // This is a migrated course, redirect it
        redirectUrl = courseModule.courseRedirects[courseIdentifier];
      } else {
        console.log(`Course ${courseIdentifier} not migrated - passing through to origin`);
        // Course not migrated, pass through to origin
        return fetch(request);
      }
    } else {
      // Not a pattern we handle, pass through to origin
      console.log(`Not a redirect pattern, passing through: ${pathname}`);
      return fetch(request);
    }

    // If we found a redirect URL, perform the redirect
    if (redirectUrl) {
      // Ensure the redirect URL has the proper domain
      const fullRedirectUrl = `https://m.academy${redirectUrl}`;

      console.log(`Redirecting to: ${fullRedirectUrl}`);

      return new Response(null, {
        status: 301,
        headers: {
          'Location': fullRedirectUrl,
          'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
        }
      });
    }

    // If we get here and don't have a redirect, pass through to origin
    console.log(`No redirect found, passing through to origin: ${pathname}`);
    return fetch(request);
  }
};
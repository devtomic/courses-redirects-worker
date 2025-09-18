#!/usr/bin/env node

// Test script to validate redirect mappings

const testUrls = [
  // Test with course ID
  {
    input: 'https://courses.m.academy/courses/2184079/lectures/49282120',
    expected: 'https://m.academy/lessons/dependency-injection-object-manager-magento/',
    behavior: 'redirect'
  },
  // Test with course slug
  {
    input: 'https://courses.m.academy/courses/magento-2-coding-jumpstart/lectures/49393624',
    expected: 'https://m.academy/lessons/understand-software-architecture-magento/',
    behavior: 'redirect'
  },
  // Test course-only URL with ID
  {
    input: 'https://courses.m.academy/courses/2184079',
    expected: 'https://m.academy/courses/magento-2-coding-jumpstart/start/',
    behavior: 'redirect'
  },
  // Test course-only URL with slug
  {
    input: 'https://courses.m.academy/courses/magento-2-coding-jumpstart',
    expected: 'https://m.academy/courses/magento-2-coding-jumpstart/start/',
    behavior: 'redirect'
  },
  // Test last lesson
  {
    input: 'https://courses.m.academy/courses/2184079/lectures/49662460',
    expected: 'https://m.academy/lessons/next-steps-beyond-jumpstart/',
    behavior: 'redirect'
  },
  // Test non-existent lesson (should redirect to course)
  {
    input: 'https://courses.m.academy/courses/2184079/lectures/99999999',
    expected: 'https://m.academy/courses/magento-2-coding-jumpstart/start/',
    behavior: 'redirect'
  },
  // TEST PASS-THROUGH: Non-migrated course (should pass through to origin)
  {
    input: 'https://courses.m.academy/courses/some-other-course',
    expected: 'Pass through to Teachable (no redirect)',
    behavior: 'pass-through'
  },
  // TEST PASS-THROUGH: Enrollment page (should pass through)
  {
    input: 'https://courses.m.academy/enroll/123456',
    expected: 'Pass through to Teachable (no redirect)',
    behavior: 'pass-through'
  },
  // TEST PASS-THROUGH: Purchase page (should pass through)
  {
    input: 'https://courses.m.academy/purchase?product_id=123',
    expected: 'Pass through to Teachable (no redirect)',
    behavior: 'pass-through'
  }
];

console.log('Testing Teachable to Codex redirects');
console.log('=====================================\n');

testUrls.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.input}`);
  console.log(`Behavior: ${test.behavior}`);
  console.log(`Expected: ${test.expected}`);
  console.log('---');
});

console.log('\nTo test these URLs:');
console.log('1. Run: npm run dev');
console.log('2. Visit http://localhost:8787 and append the path from each test URL');
console.log('3. Check that the Location header matches the expected redirect');
console.log('\nExample: http://localhost:8787/courses/2184079/lectures/49282120');
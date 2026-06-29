import "@testing-library/jest-dom";

// jsdom doesn't implement IntersectionObserver (used by useInfiniteScroll).
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
global.IntersectionObserver = MockIntersectionObserver;

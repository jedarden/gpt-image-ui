// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock canvas methods that aren't implemented in JSDOM
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  drawImage: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  fill: jest.fn(),
  strokeStyle: null,
  lineWidth: null,
  lineCap: null
}));

// Mock canvas toDataURL method
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock-data-url');

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  
  // Helper to simulate intersection
  simulateIntersection(isIntersecting) {
    this.callback([{ isIntersecting }]);
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress React error boundary warnings
  if (args[0].includes('Error boundaries should implement getDerivedStateFromError')) {
    return;
  }
  // Suppress act warnings
  if (args[0].includes('Warning: An update to') && args[0].includes('inside a test was not wrapped in act')) {
    return;
  }
  originalConsoleError(...args);
};

// Suppress console warnings during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific warnings if needed
  if (args[0].includes('Some specific warning to ignore')) {
    return;
  }
  originalConsoleWarn(...args);
};

// Clean up after each test
afterEach(() => {
  // Reset mocks
  jest.clearAllMocks();
});
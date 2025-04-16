import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ClockFace from '../ClockFace';

// Mock GSAP
vi.mock('gsap', () => ({
  to: vi.fn(),
}));

describe('ClockFace', () => {
  it('renders clock face with hands', () => {
    const mockTime = new Date('2024-01-01T12:00:00');
    render(<ClockFace time={mockTime} />);

    // Check if clock face container exists
    const clockFace = screen.getByTestId('clock-face');
    expect(clockFace).toBeInTheDocument();

    // Check if clock hands exist
    const hourHand = screen.getByTestId('hour-hand');
    const minuteHand = screen.getByTestId('minute-hand');
    const secondHand = screen.getByTestId('second-hand');

    expect(hourHand).toBeInTheDocument();
    expect(minuteHand).toBeInTheDocument();
    expect(secondHand).toBeInTheDocument();
  });

  it('renders clock markers', () => {
    const mockTime = new Date('2024-01-01T12:00:00');
    render(<ClockFace time={mockTime} />);

    // Check if all 12 clock markers are rendered
    const markers = screen.getAllByTestId('clock-marker');
    expect(markers).toHaveLength(12);
  });

  it('renders center dot', () => {
    const mockTime = new Date('2024-01-01T12:00:00');
    render(<ClockFace time={mockTime} />);

    const centerDot = screen.getByTestId('center-dot');
    expect(centerDot).toBeInTheDocument();
  });
}); 
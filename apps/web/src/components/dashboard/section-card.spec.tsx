import { render, screen } from '@testing-library/react';
import { SectionCard } from './section-card';

describe('SectionCard', () => {
  it('renders the title, eyebrow, and content', () => {
    render(
      <SectionCard title="Focus" eyebrow="Dashboard">
        <p>Today matters.</p>
      </SectionCard>
    );

    expect(screen.getByText('Focus')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Today matters.')).toBeInTheDocument();
  });
});

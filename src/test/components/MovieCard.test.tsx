import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MovieCard from '@/components/MovieCard';

const mockMovie = {
  id: 1,
  title: 'Test Movie',
  name: '',
  overview: 'A great test movie',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  vote_average: 8.5,
  release_date: '2024-01-01',
  media_type: 'movie' as const,
};

describe('MovieCard Component', () => {
  it('renders movie title', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('displays rating', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/8\.5/)).toBeInTheDocument();
  });

  it('shows release year', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('has accessible name', () => {
    render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );
    
    const link = screen.getByRole('link');
    expect(link).toHaveAccessibleName(/Test Movie/i);
  });
});

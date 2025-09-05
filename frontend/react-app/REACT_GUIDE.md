# React + TypeScript Guide for Beginners

This guide explains all the React and TypeScript concepts used in this movie recommendation app.

## Table of Contents
1. [React Basics](#react-basics)
2. [TypeScript Basics](#typescript-basics)  
3. [React Hooks](#react-hooks)
4. [Component Structure](#component-structure)
5. [Event Handling](#event-handling)
6. [API Integration](#api-integration)
7. [Code Examples from Our App](#code-examples-from-our-app)

---

## React Basics

### What is React?
React is a JavaScript library for building user interfaces. Think of it as LEGO blocks for websites - you create small pieces (components) and combine them to build your app.

### Components
A component is a reusable piece of UI. In our app:
- `App` component is the main page
- `MovieSearch` component is the search box
- `RecommendationGrid` component shows movie cards

```tsx
// This is a simple component
function WelcomeMessage() {
  return <h1>Welcome to our app!</h1>;
}
```

### JSX
JSX lets you write HTML-like code inside JavaScript. It's what makes React components look familiar:

```tsx
function MyComponent() {
  return (
    <div className="container">
      <h1>Hello World</h1>
      <p>This looks like HTML but it's JSX!</p>
    </div>
  );
}
```

**JSX Rules:**
- Use `className` instead of `class`
- Close all tags: `<input />` not `<input>`
- Wrap multiple elements in one parent div

---

## TypeScript Basics

### What is TypeScript?
TypeScript is JavaScript with types. It helps catch errors before your code runs.

### Basic Types
```tsx
// Variables with types
const name: string = "The Matrix";
const year: number = 1999;
const isGood: boolean = true;

// Arrays
const movies: string[] = ["Matrix", "Avatar", "Inception"];
const ratings: number[] = [8.7, 7.8, 8.8];
```

### Interfaces
Interfaces describe the shape of objects. They're like contracts that say "this object must have these properties":

```tsx
// Our Movie interface from the app
interface Movie {
  id: number;
  primarytitle: string;
  startyear?: number;        // ? means optional
  averagerating?: number;
}

// Using the interface
const matrix: Movie = {
  id: 1,
  primarytitle: "The Matrix",
  startyear: 1999,
  averagerating: 8.7
};
```

### Function Types
```tsx
// Function that takes a string and returns nothing
const logMessage = (message: string): void => {
  console.log(message);
};

// Function that takes a movie and returns nothing
const selectMovie = (movie: Movie): void => {
  console.log("Selected:", movie.primarytitle);
};
```

---

## React Hooks

Hooks are special functions that let you use React features. They all start with "use".

### useState - Managing State
State is data that can change over time. When state changes, React re-renders the component.

```tsx
import { useState } from 'react';

function Counter() {
  // useState returns [currentValue, functionToChangeValue]
  const [count, setCount] = useState(0);  // Start at 0
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}
```

**In our app:**
```tsx
// These are all the states in App.tsx
const [query, setQuery] = useState('');                    // Search text
const [loading, setLoading] = useState(false);            // Loading spinner
const [searchResults, setSearchResults] = useState<Movie[]>([]);  // Search results
```

### useEffect - Side Effects
useEffect runs code when something changes. Like "when the user types, wait 1 second then search".

```tsx
import { useEffect } from 'react';

function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // This runs every time searchTerm changes
    console.log("User searched for:", searchTerm);
  }, [searchTerm]);  // This array says "run when searchTerm changes"
  
  return (
    <input 
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  );
}
```

**useEffect with Cleanup:**
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    // Do something after delay
  }, 1000);
  
  // Cleanup function - runs when component unmounts or effect re-runs
  return () => {
    clearTimeout(timer);
  };
}, [dependency]);
```

### useCallback - Optimizing Functions
useCallback prevents functions from being recreated on every render. Use it for functions passed to child components.

```tsx
const handleClick = useCallback((movie: Movie) => {
  // This function won't be recreated unless 'someValue' changes
  console.log("Clicked movie:", movie.primarytitle);
}, [someValue]);
```

---

## Component Structure

### Props
Props are how parent components pass data to child components. Like function parameters.

```tsx
// Parent component
function App() {
  const movies = ["Matrix", "Avatar"];
  
  return <MovieList movies={movies} />;
}

// Child component - receives props
interface MovieListProps {
  movies: string[];
}

function MovieList({ movies }: MovieListProps) {
  return (
    <ul>
      {movies.map(movie => <li key={movie}>{movie}</li>)}
    </ul>
  );
}
```

### Props Interface
Always define what props a component expects:

```tsx
interface Props {
  title: string;           // Required
  year?: number;           // Optional (?)
  onSelect: (id: number) => void;  // Function prop
}

function MovieCard({ title, year, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(123)}>
      <h3>{title}</h3>
      {year && <p>Released: {year}</p>}
    </div>
  );
}
```

---

## Event Handling

### Common Events
```tsx
function EventExamples() {
  const handleClick = () => {
    console.log("Button clicked!");
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("User typed:", e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();  // Prevent page refresh
    console.log("Form submitted");
  };
  
  return (
    <div>
      <button onClick={handleClick}>Click me</button>
      <input onChange={handleInputChange} />
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
```

### Event Types
- `React.ChangeEvent<HTMLInputElement>` - Input changes
- `React.MouseEvent<HTMLButtonElement>` - Button clicks
- `React.FormEvent` - Form submissions

---

## API Integration

### Fetch API
```tsx
// Basic fetch request
const fetchMovies = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/search/?q=matrix');
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Movies:", data.results);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
};
```

### AbortController (Advanced)
Used to cancel requests that are no longer needed:

```tsx
const [abortController, setAbortController] = useState<AbortController | null>(null);

const searchMovies = async (query: string) => {
  // Cancel previous request if still running
  if (abortController) {
    abortController.abort();
  }
  
  const newController = new AbortController();
  setAbortController(newController);
  
  try {
    const response = await fetch(`/search/?q=${query}`, {
      signal: newController.signal  // This allows cancellation
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log("Request was cancelled");
      return;
    }
    throw error;
  }
};
```

---

## Code Examples from Our App

### 1. State Management in App.tsx
```tsx
function App() {
  // Multiple pieces of state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  
  // When user selects a movie
  const handleMovieSelect = useCallback(async (movie: Movie) => {
    setLoading(true);  // Show loading
    
    try {
      const recommendations = await getRecommendations(movie.primarytitle);
      setRecommendations(recommendations);
    } catch (error) {
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);  // Hide loading
    }
  }, [getRecommendations]);
}
```

### 2. Debounced Search in MovieSearch.tsx
```tsx
function MovieSearch({ onQueryChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  
  // Debounce: wait 1 second after user stops typing
  useEffect(() => {
    if (inputValue.length >= 2) {
      const timer = setTimeout(() => {
        onQueryChange(inputValue);  // Call parent function
      }, 1000);
      
      return () => clearTimeout(timer);  // Cleanup
    }
  }, [inputValue, onQueryChange]);
  
  return (
    <input
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      placeholder="Search for a movie..."
    />
  );
}
```

### 3. Conditional Rendering in RecommendationGrid.tsx
```tsx
function RecommendationGrid({ recommendations, loading, error }: Props) {
  // Show different things based on state
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (recommendations.length === 0) {
    return <div>No recommendations yet</div>;
  }
  
  // Show the actual results
  return (
    <div className="grid">
      {recommendations.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
```

### 4. Array Mapping
```tsx
// Transform array of movies into array of JSX elements
{searchResults.map(movie => (
  <div key={movie.id} onClick={() => handleClick(movie)}>
    <h3>{movie.primarytitle}</h3>
    <p>Year: {movie.startyear}</p>
  </div>
))}
```

---

## Common Patterns

### 1. Loading States
```tsx
function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetch('/api/data');
      setData(result);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;
  return <div>{data}</div>;
}
```

### 2. Conditional Rendering
```tsx
// Show element only if condition is true
{isLoggedIn && <button>Logout</button>}

// Show different things based on condition
{user ? <WelcomeMessage /> : <LoginForm />}

// Show element only if value exists
{movie.year && <span>Released: {movie.year}</span>}
```

### 3. Event Handler Props
```tsx
// Parent passes function to child
function Parent() {
  const handleChildClick = (value: string) => {
    console.log("Child clicked with:", value);
  };
  
  return <Child onClick={handleChildClick} />;
}

// Child calls the function
function Child({ onClick }: { onClick: (value: string) => void }) {
  return (
    <button onClick={() => onClick("hello")}>
      Click me
    </button>
  );
}
```

---

## Key Takeaways

1. **Components** are reusable UI pieces
2. **Props** pass data down from parent to child
3. **State** is data that can change and triggers re-renders
4. **useEffect** runs code when dependencies change
5. **TypeScript** helps catch errors with type checking
6. **Interfaces** describe the shape of objects
7. **Event handlers** respond to user interactions
8. **Conditional rendering** shows different UI based on state

## Next Steps

To get better at React + TypeScript:

1. **Practice useState** - Build a counter, todo list, or form
2. **Practice useEffect** - Fetch data when component loads
3. **Practice props** - Pass data between components
4. **Read error messages** - TypeScript errors help you learn
5. **Start small** - Build simple components before complex ones

Remember: Every React developer started as a beginner. The concepts become natural with practice!
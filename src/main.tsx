import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const el = document.getElementById('root');
if (el) {
  // Note: intentionally not wrapped in StrictMode — the game loop schedules
  // engine moves and clocks on effects, and double-invocation would fire them twice.
  createRoot(el).render(<App />);
}

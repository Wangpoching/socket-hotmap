import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LoadTest from './LoadTest';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from 'react-router-dom';
const router = createBrowserRouter([
  {
    path: '/app',
    element: <App />,
  },
  {
    path: '/test',
    element: <LoadTest />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);

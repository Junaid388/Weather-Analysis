import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './components/ui/theme-provider';
import AppLayout from './layout/app-layout';
import Landing from './pages/landing';

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                path: '/',
                element: <Landing />
            }
        ]
    }
])

function App() {

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}


export default App

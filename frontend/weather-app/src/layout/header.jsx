// import './Header.css'; // Import the CSS file for styling

const Header = () => {
    return (
        <header className="p-10 items-center justify-center bg-gray-800">
            <div>
                <h1 className="flex flex-col items-center justify-center gradient-title text-3xl 
            font-extrabold sm:text-4xl lg:text-6xl tracking-tighter py-4">
                <span className="flex items-center gap-2 sm:gap-6">
                <img src="/weather-logo.png" alt="weather-logo" className="h-14 sm:h-24 lg:h-32"/>
                Weather Analysis System
                </span>
            </h1>
            </div>
        </header>
    );
};

export default Header;
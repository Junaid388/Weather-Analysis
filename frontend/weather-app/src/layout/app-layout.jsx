import { Outlet } from "react-router-dom";
import Header from "./header";

const AppLayout = () => {
  return (
    <div>
        <div className="grid-background"></div>
        <Header  />
        <main className="min-h-screen">
            <Outlet />
            </main>
            <div className="p-1 textcenter bg-gray-800 mt-1">Made with ⚡ by Juneth Khan </div>
    </div>
  );
};

export default AppLayout;
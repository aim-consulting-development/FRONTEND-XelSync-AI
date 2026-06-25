import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
        <Navbar />

        <main
          className="
            flex-1
            p-6
            bg-gray-50
            dark:bg-slate-950
            text-gray-900
            dark:text-gray-100
            transition-colors
            duration-300
            overflow-y-auto
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
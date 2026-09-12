import { Bell, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Header() {
  const { staff, logout } = useAdminAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initial = staff?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6">

      <div className="flex items-center gap-3 bg-zinc-100 px-4 py-2 rounded-lg w-80">
        <Search size={18} className="text-zinc-400" />

        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-5">

        <button className="relative">
          <Bell size={20} className="text-zinc-600" />

          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {initial}
          </div>

          <div>
            <p className="text-sm font-medium">
              {staff?.name ?? "Staff"}
            </p>

            <p className="text-xs text-zinc-500">
              {staff?.role ?? ""}
            </p>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </header>
  );
}

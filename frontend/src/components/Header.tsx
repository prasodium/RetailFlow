import { Bell, Search } from "lucide-react";

export default function Header() {
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
            H
          </div>

          <div>
            <p className="text-sm font-medium">
              Admin
            </p>

            <p className="text-xs text-zinc-500">
              Administrator
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
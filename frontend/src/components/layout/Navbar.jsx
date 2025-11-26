import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <div className="bg-brand p-1.5 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-action" />
            </div>
            <span className="font-bold text-xl tracking-tight text-brand">
              HelaTax
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-brand transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-light transition-all shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

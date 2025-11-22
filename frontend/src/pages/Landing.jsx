import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  Bot,
  FileSpreadsheet,
  BellRing,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-green-100">
      {/* =========================================
          1. NAVBAR (Clean & sticky)
      ========================================== */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              H
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              HelaTax
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 items-center">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-green-700 transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-green-700 transition"
            >
              How it Works
            </a>
            <div className="h-4 w-px bg-slate-200"></div>
            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 hover:text-green-700 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-green-700 hover:shadow-lg transition-all duration-300"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="text-slate-600" />
            ) : (
              <Menu className="text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full p-6 flex flex-col gap-4 shadow-xl">
            <a
              href="#features"
              className="text-slate-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </a>
            <Link to="/login" className="text-slate-900 font-bold">
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-center font-bold"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* =========================================
          2. HERO SECTION (Split Layout)
      ========================================== */}
      <header className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase tracking-wide mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Updated for Finance Act 2025
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Tax Compliance, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                Without the Headache.
              </span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              The first AI-powered tax assistant designed specifically for
              Kenyan freelancers and SMEs. Auto-fill your P9 forms and never
              miss a deadline.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white text-base font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200"
              >
                Start Filing Free <ArrowRight size={20} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 text-base font-bold rounded-xl border border-slate-200 hover:border-green-500 hover:text-green-600 transition-all"
              >
                View Demo
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck size={16} className="text-green-600" /> KRA
                Compliant
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={16} className="text-green-600" /> Bank-Level
                Security
              </span>
            </div>
          </div>

          {/* Right: Abstract UI Mockup */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Decorative Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-100 rounded-full blur-3xl opacity-50"></div>

            {/* The "Card" Mockup */}
            <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-2xl w-full max-w-md transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              {/* Fake UI Header */}
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-xs font-bold text-slate-400">
                  HELATAX DASHBOARD
                </div>
              </div>

              {/* Fake UI Content */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Estimated Tax Due
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      KES 24,500
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md">
                    Due in 4 Days
                  </span>
                </div>

                <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <FileSpreadsheet size={32} className="mb-2 text-slate-300" />
                  <span className="text-xs">
                    P9 Form Processed Successfully
                  </span>
                </div>

                <div className="bg-green-600 text-white p-4 rounded-xl flex gap-3 items-center shadow-lg shadow-green-200">
                  <Bot size={24} />
                  <div>
                    <p className="text-xs font-medium opacity-90">
                      AI Assistant
                    </p>
                    <p className="text-sm font-bold">
                      "You can claim relief on your insurance."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================
          3. FEATURES (Grid with Hover Effects)
      ========================================== */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to file with confidence
            </h2>
            <p className="text-slate-600 text-lg">
              We stripped away the accounting jargon and left only the tools
              that actually help you save money.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Bot size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                AI Tax Chatbot
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Ask complex questions like "Is my lunch allowance taxable?" and
                get instant answers based on the Kenyan Constitution.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <FileSpreadsheet size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Excel Auto-Import
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Drag and drop your P9 form. We extract the numbers, calculate
                the totals, and prepare a file ready for iTax.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <BellRing size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Smart Reminders
              </h3>
              <p className="text-slate-600 leading-relaxed">
                We track the 20th of every month. Get SMS and Email alerts 3
                days before the deadline to avoid penalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          4. CTA / FOOTER
      ========================================== */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to simplify your taxes?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join other Kenyan freelancers who are saving hours every month with
            HelaTax.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-500 transition-all"
          >
            Create Free Account <ChevronRight size={20} />
          </Link>

          <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; 2025 HelaTax. Final Year Project.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">
                Privacy
              </a>
              <a href="#" className="hover:text-white">
                Terms
              </a>
              <a href="#" className="hover:text-white">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

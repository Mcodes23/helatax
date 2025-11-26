import { ArrowRight, Calculator, FileText, Bot } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-6 uppercase tracking-wide">
          <span>Updated for Finance Act 2025</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-brand tracking-tight mb-6">
          Tax Compliance, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-action">
            Without the Headache.
          </span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          The first AI-powered tax engine for Kenyan Freelancers & SMEs. We
          validate your eTIMS receipts, calculate specific levies, and generate
          your KRA returns in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-action hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Filing for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
            View Demo
          </button>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Large Card */}
          <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-brand mb-2">
              Excel-In, KRA-Out
            </h3>
            <p className="text-slate-500">
              Upload your messy sales spreadsheet. Our AI cleans it, applies
              2025 tax rules, and generates the exact CSV file you need for the
              iTax portal.
            </p>
          </div>

          {/* Feature 2: Tall Card */}
          <div className="bg-brand text-white p-8 rounded-2xl border border-brand shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                <Bot className="text-action w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Tax Advisor</h3>
              <p className="text-slate-300 text-sm">
                "Can I expense my lunch?" <br />
                "What is the Housing Levy rate?" <br />
                Get instant answers based on Kenyan Law, sanitized for privacy.
              </p>
            </div>
          </div>

          {/* Feature 3: Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-brand mb-2">
              Time Travel Logic
            </h3>
            <p className="text-slate-500 text-sm">
              Filing late? We automatically apply the tax rates from 2023 or
              2024 based on your invoice date.
            </p>
          </div>

          {/* Feature 4: Card */}
          <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-brand mb-2">
              Built for the Gig Economy
            </h3>
            <div className="flex gap-3 mt-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                Freelancers
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                SMEs
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                Consultants
              </span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Landing;

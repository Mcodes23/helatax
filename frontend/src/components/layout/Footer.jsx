import { ShieldCheck, Twitter, Facebook, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-brand text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-action" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                HelaTax
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              The AI-powered compliance engine for Kenyan Freelancers & SMEs.
              Simplifying taxes, one return at a time.
            </p>
            <div className="flex gap-4">
              <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Facebook className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/features"
                  className="hover:text-action transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-action transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="hover:text-action transition-colors"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  to="/roadmap"
                  className="hover:text-action transition-colors"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-action transition-colors">
                  KRA Tax Guides
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-action transition-colors">
                  Finance Act 2025
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-action transition-colors">
                  Tax Calculator
                </a>
              </li>
              <li>
                <Link
                  to="/support"
                  className="hover:text-action transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> support@helatax.co.ke
              </li>
              <li>Nairobi, Kenya</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>
            &copy; {new Date().getFullYear()} HelaTax Systems. All rights
            reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

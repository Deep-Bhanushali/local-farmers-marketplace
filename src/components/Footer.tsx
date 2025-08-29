"use client";

import Link from "next/link";
// Assuming you have a simple Logo component or you can just use text
// import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Branding & Tagline */}
          <div className="md:col-span-1">
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">FarmMarket</h3>
            </div>
            <p className="mt-2 text-gray-500 text-sm">
              Connecting you with the freshest produce from local farmers.
            </p>
            <div className="mt-4 flex space-x-4">
              {/* Add your social media links here */}
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.73h-1.598c-1.284 0-1.695.766-1.695 1.632V12h3.089l-.41 2.895h-2.68V21.878C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808a6.78 6.78 0 01-.465 2.427 4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153 6.78 6.78 0 01-2.427.465c-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06a6.78 6.78 0 01-2.427-.465 4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772A6.78 6.78 0 012.06 15.808c-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808a6.78 6.78 0 01.465-2.427A4.902 4.902 0 013.69 3.691 4.902 4.902 0 015.46.535A6.78 6.78 0 017.889.06C8.913.013 9.267 0 11.695 0zm.75 2.16c-2.403 0-2.73.01-3.685.053a4.704 4.704 0 00-1.898.37 2.705 2.705 0 00-1.056.764c-.452.451-.692.93-.764 1.056a4.704 4.704 0 00-.37 1.898c-.043.955-.053 1.282-.053 3.685s.01 2.73.053 3.685a4.704 4.704 0 00.37 1.898 2.705 2.705 0 00.764 1.056c.451.452.93.692 1.056.764a4.704 4.704 0 001.898.37c.955.043 1.282.053 3.685.053s2.73-.01 3.685-.053a4.704 4.704 0 001.898-.37 2.705 2.705 0 001.056-.764c.452-.451.692-.93-.764-1.056a4.704 4.704 0 00.37-1.898c.043-.955.053-1.282.053-3.685s-.01-2.73-.053-3.685a4.704 4.704 0 00-.37-1.898 2.705 2.705 0 00-.764-1.056 4.704 4.704 0 00-1.898-.37c-.955-.043-1.282-.053-3.685-.053z"
                    clipRule="evenodd"
                  />
                  <path d="M12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zM12 15a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/farmers"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Our Farmers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-base text-gray-600 hover:text-gray-900"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Stay Updated
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Subscribe to our newsletter to get the latest news and offers.
            </p>
            <form className="mt-4 flex flex-col sm:flex-row gap-2">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="email-address"
                autoComplete="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-base text-gray-500">
            &copy; {new Date().getFullYear()} FarmMarket. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#2584C6] p-4 text-white">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="font-bold text-lg">OpenBiz</h1>

        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/register" className="hover:underline">
            Register
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-2 space-y-2">
          <Link
            to="/"
            className="block hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/register"
            className="block hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

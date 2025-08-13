import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Welcome to Udyam Registration</h2>
      <p className="mb-6">
        This is a mock registration form mimicking the first two steps of the official Udyam process.
      </p>
      <Link
        to="/register"
        className="px-4 py-2 bg-[#2584C6] text-white rounded hover:bg-[#1f6fa7]"
      >
        Start Registration
      </Link>
    </div>
  );
};

export default Home;

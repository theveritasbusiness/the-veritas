import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logoAsset from "../assets/Logo_Edit_4.png";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
    const navigate = useNavigate();
const [searchParams] = useSearchParams();
const selectedCategory = searchParams.get("category");
  return (
    <div className="bg-black text-white min-h-screen">

      {/* ===== TOP BAR ===== */}
      <div className="bg-neutral-900 border-b border-neutral-800 py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <div className="hidden md:block text-neutral-400 text-sm">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <div className="flex-1 flex justify-center">
            <img src={logoAsset} className="h-12 object-contain" />
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-red-600 text-black px-4 py-1 rounded-full text-sm">
              Join
            </button>
          </div>

        </div>
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="border-b border-neutral-800">
        <ul className="flex justify-center gap-6 py-3 text-sm">
          {[
            "Home",
            "Geopolitics",
            "India",
            "Trending",
            "Politics",
            "Legal",
            "Entertainment",
            "Sports",
          ].map((item) => (
            <li
  key={item}
  className={`cursor-pointer transition-colors ${
    (item === "Home" && !selectedCategory) || selectedCategory === item
      ? "text-red-500"
      : "hover:text-red-500"
  }`}
  onClick={() => {
    if (item === "Home") {
      navigate("/");
    } else {
      navigate(`/?category=${item}`);
    }
  }}
>
  {item}
</li>
          ))}
        </ul>
      </nav>

      {/* ===== PAGE CONTENT ===== */}
      {children}
        {/* ===== FOOTER ===== */}
        <footer className="border-t border-neutral-800 mt-10 py-6 text-center text-sm text-neutral-400">
  <div className="flex justify-center gap-6">
    <Link to="/privacy">Privacy Policy</Link>
<Link to="/terms">Terms & Conditions</Link>
  </div>
</footer>

    </div>
  );
}
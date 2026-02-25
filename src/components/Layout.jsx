import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logoAsset from "../assets/Logo_Edit_4.png";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

export default function Layout() {
    const navigate = useNavigate();
const [searchParams] = useSearchParams();
const selectedCategory = searchParams.get("category");
const [searchQuery, setSearchQuery] = useState("");
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

  <form
  className="veritas-search"
  onSubmit={(e) => e.preventDefault()}
>
  <input
    type="search"
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value);
      navigate(`/?search=${e.target.value}`);
    }}
  />
  <i className="fa fa-search"></i>
</form>

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
      <Outlet />
        {/* ===== FOOTER ===== */}
        <footer className="border-t border-neutral-800 mt-10 py-6 text-center text-sm text-neutral-400">
  <div className="flex justify-center gap-6">
    <Link to="/privacy">Privacy Policy</Link>
<Link to="/terms">Terms & Conditions</Link>
  </div>
</footer>
<style>{`
.veritas-search {
  position: relative;
  width: 50px;
  height: 42px;
  background: #0b0b0b;
  border: 2px solid #1f1f1f;
  border-radius: 30px;
  padding: 5px;
  transition: all 0.6s ease;
}

.veritas-search input {
  position: absolute;
  width: 0;
  height: 100%;
  border: none;
  background: transparent;
  color: white;
  padding: 0 20px;
  transition: width 0.6s ease;
}

.veritas-search .fa {
  padding: 10px;
  width: 38px;
  height: 38px;
  position: absolute;
  right: 0;
  border-radius: 50%;
  color: #aaa;
  text-align: center;
  cursor: pointer;
}

.veritas-search:hover,
.veritas-search:focus-within {
  width: 220px;
  border-color: #ff2b2b;
}

.veritas-search:hover input,
.veritas-search:focus-within input {
  width: 100%;
}

.veritas-search:hover .fa,
.veritas-search:focus-within .fa {
  background: #ff2b2b;
  color: black;
}
`}</style>

    </div>
  );
}
// app/Navbar.tsx
import Link from 'next/link';
import "../app/globals.css";
const Menu = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="text-white">Home</Link>
        </li>
        <li>
          <Link href="/product" className="text-white">Products</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;

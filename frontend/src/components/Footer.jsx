// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-center py-4 mt-auto">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} PixelForge Nexus. All rights reserved.
      </p>
    </footer>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>readme.gen helps professionals create polished profile READMEs with clarity.</p>
        <p>© {new Date().getFullYear()} readme.gen. All rights reserved.</p>
      </div>
    </footer>
  );
}

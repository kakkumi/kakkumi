import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Link href="/create">
        <button className="rounded-xl bg-black px-8 py-4 text-lg font-semibold text-white hover:bg-zinc-800 transition-colors">
          테마 제작
        </button>
      </Link>
    </div>
  );
}

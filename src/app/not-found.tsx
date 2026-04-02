import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-gray-500">Could not find the requested page</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}

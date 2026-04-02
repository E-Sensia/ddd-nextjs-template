"use client"

import { useEffect } from "react"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="text-gray-500 text-sm">
        {error.digest && `Error ID: ${error.digest}`}
      </p>
      <button
        className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
        onClick={() => unstable_retry()}
      >
        Try again
      </button>
    </div>
  )
}

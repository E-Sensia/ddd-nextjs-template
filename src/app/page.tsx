"use client"

import { useState } from "react"
import { Button } from "../components/button/button"
import { greetAction } from "../actions/greeting.actions"

export default function HomePage() {
  const [greeting, setGreeting] = useState<string | null>(null)
  const [clickCount, setClickCount] = useState(0)

  const handleClick = async () => {
    const result = await greetAction()
    setGreeting(result.message)
    setClickCount(result.clickCount)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <Button label="Click me" onClick={handleClick} />
      {greeting && (
        <div className="text-center">
          <p className="text-lg text-gray-700">{greeting}</p>
          <p className="text-sm text-gray-500 mt-1">
            Total clicks: {clickCount}
          </p>
        </div>
      )}
    </div>
  )
}

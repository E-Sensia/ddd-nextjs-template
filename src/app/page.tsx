"use client"

import { useState } from "react"
import { Button } from "../components/button/button"
import { greetAction, triggerErrorAction } from "../actions/greeting.actions"

export default function HomePage() {
  const [greeting, setGreeting] = useState<string | null>(null)
  const [clickCount, setClickCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [errorFired, setErrorFired] = useState(false)

  const handleClick = async () => {
    setError(null)
    const result = await greetAction()
    if (result.ok) {
      setGreeting(result.data.message)
      setClickCount(result.data.clickCount)
    } else {
      setError(result.error)
    }
  }

  const handleError = async () => {
    await triggerErrorAction({ source: "debug-button" })
    setErrorFired(true)
    setTimeout(() => setErrorFired(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <Button label="Click me" onClick={handleClick} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {greeting && (
        <div className="text-center">
          <p className="text-lg text-gray-700">{greeting}</p>
          <p className="text-sm text-gray-500 mt-1">
            Total clicks: {clickCount}
          </p>
        </div>
      )}
      <Button
        label={errorFired ? "Error sent!" : "Trigger error log"}
        onClick={handleError}
        variant="secondary"
      />
    </div>
  )
}

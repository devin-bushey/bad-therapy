import React from "react"
import { useAuth0 } from "@auth0/auth0-react"

const Welcome: React.FC = () => {
  const { loginWithRedirect } = useAuth0()
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-0 sm:pt-8 pt-4">
        <div className="w-full max-w-xl rounded-2xl p-10 flex flex-col items-center sm:bg-warm-100 sm:border sm:border-warm-200 sm:shadow-lg">
          <h1 className="text-5xl font-extrabold text-earth-500 mb-8 text-center tracking-tight">
            Welcome to Bad Therapy
          </h1>
          <p className="text-lg text-warm-600 max-w-xl text-center mb-8 font-light">
            If your idea of therapy involves a highly questionable trust in AI and you're looking for a chat, then Bad Therapy might be for you.
          </p>
          <button
            onClick={() => loginWithRedirect({ authorizationParams: { redirect_uri: window.location.origin + "/dashboard" } })}
            className="text-lg font-semibold bg-earth-500 text-warm-50 rounded-md px-8 py-3 cursor-pointer hover:bg-earth-600 hover:shadow-md active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-earth-400 mb-10"
          >
            Login / Signup
          </button>
          <div className="border border-warm-300 rounded-xl sm:px-2 px-2 py-4 mb-8 w-full bg-warm-50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <ul className="space-y-2 text-base text-warm-800 text-center">
              <li><span className="font-semibold text-ai-500">24/7 Access:</span> Get support anywhere</li>
              <li><span className="font-semibold text-ai-500">Inexpensive:</span> Affordable for everyone</li>
              <li><span className="font-semibold text-ai-500">Judgement free:</span> Anonymous & encrypted messaging</li>
            </ul>
          </div>
          <p className="text-base text-warm-500 max-w-lg text-center font-light">
            But if you're battling real trauma, you need a real clinical therapist. Don't mess around with your mental health.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Welcome

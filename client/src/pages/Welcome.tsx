import React from "react"
import { useAuth0 } from "@auth0/auth0-react"

const Welcome: React.FC = () => {
  const { loginWithRedirect } = useAuth0()
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-0 sm:pt-8 pt-4">
        <div
          className="w-full max-w-xl bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border border-gray-700 rounded-2xl shadow-lg p-10 flex flex-col items-center"
        >
          <h1 className="text-5xl font-extrabold text-blue-400 mb-8 text-center tracking-tight">
            Welcome to Bad Therapy
          </h1>
          <p className="text-lg text-gray-400 max-w-xl text-center mb-8 font-light">
            If your idea of therapy involves a highly questionable trust in AI and you're looking for a chat, then Bad Therapy might be for you.
          </p>
          <button
            onClick={() => loginWithRedirect({ authorizationParams: { redirect_uri: window.location.origin + "/dashboard" } })}
            className="text-lg font-semibold bg-blue-500 text-white rounded-md px-8 py-3 cursor-pointer hover:bg-blue-600 hover:shadow-blue-400/40 hover:shadow-md active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-10"
          >
            Login / Signup
          </button>
          <div
            className="border border-gray-700 rounded-xl sm:px-2 px-2 py-4 mb-8 w-full bg-transparent transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            <ul className="space-y-2 text-base text-gray-200 text-center">
              <li><span className="font-semibold text-purple-400">24/7 Access:</span> Get support anywhere</li>
              <li><span className="font-semibold text-purple-400">Inexpensive:</span> Affordable for everyone</li>
              <li><span className="font-semibold text-purple-400">Anonymous:</span> Judgement free & encrypted messaging</li>
            </ul>
          </div>
          <p className="text-base text-gray-500 max-w-lg text-center font-light">
            But if you're battling real trauma, you need a real clinical therapist. Don't mess around with your mental health.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Welcome

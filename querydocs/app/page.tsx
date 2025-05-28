import FileUpload from "./components/fileUpload";
import ChatComponent from "./components/chat";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import NewChatButton from "./components/NewChatButton";

export default function Home() {
  return (
    <>
      <SignedIn>
        {/* Only show the application UI to signed in users */}
        <div className="min-h-screen w-screen flex bg-slate-900 text-white overflow-hidden">
          {/* Left sidebar with file upload */}
          <div className="w-[25vw] h-screen p-4 flex flex-col bg-slate-950 border-r border-slate-700">
            <div className="mb-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-indigo-400">QueryDocs</h1>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload PDF documents and chat with them using the power of AI. Get instant answers from your documents.
              </p>
            </div>
            
            {/* App features section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Features
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                  Document analysis with AI
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                  Intelligent answers from your PDFs
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                  Fast and accurate results
                </li>
              </ul>
            </div>
            
            <div className="mt-auto">
              <FileUpload />
            </div>
          </div>
          
          {/* Right content area with chat - increased width */}
          <div className="w-[75vw] h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900">
            {/* Header with stylish design */}
            <div className="py-3 px-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-750 backdrop-blur-sm flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-md border border-indigo-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">Chat with your documents</h2>
              </div>
              
              <div className="flex items-center gap-3">
                {/* New Chat button */}
                <NewChatButton />
                
                {/* Document status indicator */}
                <div className="flex items-center gap-2 text-xs px-3 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-indigo-300">AI Assistant Ready</span>
                </div>
              </div>
            </div>
            
            {/* Chat component in a stylish container */}
            <div className="flex-1 overflow-hidden p-1.5">
              <div className="h-full rounded-lg overflow-hidden shadow-inner border border-slate-700/30 bg-slate-800/30">
                <ChatComponent />
              </div>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        {/* Auth screen for signed out users */}
        <div className="min-h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">QueryDocs</h1>
            <p className="text-slate-300 mb-8 text-center">Sign in to access your AI-powered document chat assistant.</p>
            
            <div className="space-y-4">
              <div className="w-full">
                <SignInButton mode="modal">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-all">
                    Sign In
                  </button>
                </SignInButton>
              </div>
              
              <div className="flex items-center justify-center text-sm">
                <span className="text-slate-400">Don't have an account?</span>
              </div>
              
              <div className="w-full">
                <SignUpButton mode="modal">
                  <button className="w-full border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white py-2 px-4 rounded-lg transition-all">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

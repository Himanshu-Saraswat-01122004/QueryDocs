'use client';

export default function NewChatButton() {
  return (
    <button 
      onClick={() => window.location.reload()}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      New Chat
    </button>
  );
}

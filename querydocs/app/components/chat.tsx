'use client'

import * as React from 'react'
import { Send, Bot, FileText, Copy, Check, ArrowDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Document {
  pageContent: string;
  metadata: any;
}

const ChatComponent: React.FC = () => {
  const [query, setQuery] = React.useState<string>('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [showSources, setShowSources] = React.useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = React.useState<number | null>(null);
  const [isAtBottom, setIsAtBottom] = React.useState<boolean>(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:4001/chat?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      // Add assistant message
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.answer };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Store source documents
      if (data.documents) {
        setDocuments(data.documents);
      }
      
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  // Check if user is at bottom of chat
  const checkIfAtBottom = React.useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const isAtBottomNow = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setIsAtBottom(isAtBottomNow);
  }, []);

  // Add scroll event listener to chat container
  React.useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', checkIfAtBottom);
    return () => container.removeEventListener('scroll', checkIfAtBottom);
  }, [checkIfAtBottom]);
  
  // Scroll to bottom when messages change and update bottom status
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsAtBottom(true);
    }
  }, [messages]);

  // Prepare markdown content with custom components
  const MarkdownComponents = {
    // Custom rendering for paragraphs to add proper spacing
    p: ({node, ...props}: any) => <p className="mb-3 last:mb-0" {...props} />,
    
    // Custom rendering for bold text
    strong: ({node, ...props}: any) => <span className="font-bold text-indigo-300" {...props} />,
    
    // Custom rendering for lists
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    
    // Custom rendering for headings
    h1: ({node, ...props}: any) => <h1 className="text-xl font-bold mb-3 text-indigo-200" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-lg font-bold mb-2 text-indigo-200" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-md font-bold mb-2 text-indigo-300" {...props} />,
    
    // Custom rendering for code blocks
    code: ({node, inline, ...props}: any) => 
      inline ? 
        <code className="bg-slate-800 px-1 py-0.5 rounded text-yellow-300" {...props} /> :
        <pre className="bg-slate-800 p-3 rounded-md overflow-auto my-3"><code {...props} /></pre>
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };
  
  // Function to copy message text to clipboard
  const copyMessageToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessageIndex(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages display */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gradient-to-b from-slate-900 to-slate-800 rounded-t-lg" 
        onScroll={checkIfAtBottom}
        style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(21, 30, 48) 0%, rgb(12, 17, 29) 90.1%)' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot size={48} className="text-indigo-400 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-indigo-200">Welcome to QueryDocs</h3>
            <p className="text-center max-w-md mb-6">Ask questions about your uploaded documents and get AI-powered answers.</p>
            
            <div className="backdrop-blur-sm bg-slate-800/40 p-5 rounded-xl max-w-md w-full mx-auto border border-slate-700/50 shadow-lg">
              <h4 className="font-medium mb-3 text-indigo-300 flex items-center">
                <FileText size={16} className="mr-2" /> Example questions:
              </h4>
              <ul className="space-y-3 text-sm">
                <li 
                  onClick={() => setQuery("What are the main skills mentioned in this resume?")} 
                  className="p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-lg hover:from-indigo-900/40 hover:to-slate-800/60 cursor-pointer transition-all duration-300 border border-slate-700/30 hover:border-indigo-500/30 hover:shadow-md group"
                >
                  <span className="group-hover:text-indigo-300 transition-colors duration-300">"What are the main skills mentioned in this resume?"</span>
                </li>
                <li 
                  onClick={() => setQuery("Summarize the key points from this document")} 
                  className="p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-lg hover:from-indigo-900/40 hover:to-slate-800/60 cursor-pointer transition-all duration-300 border border-slate-700/30 hover:border-indigo-500/30 hover:shadow-md group"
                >
                  <span className="group-hover:text-indigo-300 transition-colors duration-300">"Summarize the key points from this document"</span>
                </li>
                <li 
                  onClick={() => setQuery("What education background is mentioned?")} 
                  className="p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-lg hover:from-indigo-900/40 hover:to-slate-800/60 cursor-pointer transition-all duration-300 border border-slate-700/30 hover:border-indigo-500/30 hover:shadow-md group"
                >
                  <span className="group-hover:text-indigo-300 transition-colors duration-300">"What education background is mentioned?"</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl p-5 shadow-lg ${message.role === 'user' 
                ? 'bg-gradient-to-br from-slate-700 to-slate-800 ml-auto max-w-[85%] border border-slate-600/40'
                : 'bg-gradient-to-br from-indigo-900/70 to-slate-900 mr-auto max-w-[85%] border border-indigo-500/30'}`}
            >
              <div className="absolute top-3 left-0 -ml-8 shadow-md z-10">
                {message.role === 'user' ? (
                  <div className="bg-indigo-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-medium">
                    You
                  </div>
                ) : (
                  <div className="bg-slate-600 text-white rounded-full w-7 h-7 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col">
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-2 pb-2 border-b border-indigo-600/20">
                    <Bot size={18} className="text-indigo-400 mr-2" />
                    <span className="text-xs font-medium text-indigo-300">QueryDocs AI</span>
                  </div>
                )}
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <div className="flex justify-end mt-3 pt-1 border-t border-slate-700/50">
                <button 
                  onClick={() => copyMessageToClipboard(message.content, index)}
                  className="text-xs flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/50 text-slate-400 hover:text-indigo-300 hover:bg-slate-700/70 transition-all duration-200"
                >
                  {copiedMessageIndex === index ? (
                    <>
                      <Check size={12} className="text-green-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="p-4 rounded-lg bg-slate-700 mr-12 border border-slate-600 animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
              <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce delay-500"></div>
              <span className="text-slate-300 ml-2">AI is thinking...</span>
            </div>
          </div>
        )}
        {messages.length > 2 && !isAtBottom && (
          <button 
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              setIsAtBottom(true);
            }}
            className="fixed bottom-24 right-8 bg-indigo-600/90 text-white p-3 rounded-full shadow-lg hover:bg-indigo-500 transition-all duration-300 backdrop-blur-sm border border-indigo-400/30 animate-pulse hover:animate-none hover:scale-110"
          >
            <ArrowDown size={20} />
          </button>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-5 bg-slate-900/95 backdrop-blur-sm rounded-b-lg border-t border-slate-700/50 shadow-lg">
        <div className="flex items-center gap-3">
          <textarea 
            className="w-full p-4 bg-slate-800/90 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/70 border border-slate-700/50 placeholder-slate-500 transition-all duration-200 shadow-inner"
            placeholder="Ask a question about your documents..."
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (query.trim()) handleSubmit(e);
              }
            }}
          />
          <button 
            type="submit" 
            className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 border border-indigo-500/30"
            disabled={loading || !query.trim()}
            title="Send message"
          >
            <Send size={20} className="drop-shadow-md" />
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex justify-between items-center px-1">
          <span className="opacity-70 hover:opacity-100 transition-opacity">Press Enter to send</span>
          {query.length > 0 && (
            <span className="text-right bg-slate-800/50 px-2 py-1 rounded-md text-indigo-300/80">{query.length} characters</span>
          )}
        </div>
      </form>

      {/* Source documents section with toggle button */}
      {documents.length > 0 && (
        <div className="mt-4">
          {!showSources ? (
            <button 
              onClick={() => setShowSources(true)}
              className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm text-indigo-300"
            >
              <FileText size={16} />
              Show Source Documents ({documents.length})
            </button>
          ) : (
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center">
                  <FileText size={16} className="mr-2 text-indigo-400" />
                  Source Documents ({documents.length})
                </h3>
                <button 
                  onClick={() => setShowSources(false)} 
                  className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                >
                  Hide
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {documents.map((doc, index) => (
                  <div key={index} className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-indigo-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                        Document {index + 1}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(doc.pageContent, index)}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check size={12} className="text-green-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-white text-sm bg-slate-800/50 p-3 rounded my-2 max-h-32 overflow-y-auto whitespace-pre-line">
                      {doc.pageContent}
                    </div>
                    <div className="flex items-center text-xs text-gray-400 mt-2 pt-2 border-t border-slate-600">
                      <span className="truncate max-w-[80%]">
                        Source: {doc.metadata?.source?.split('/').pop() || 'Unknown'}
                      </span>
                      {doc.metadata?.loc?.pageNumber && (
                        <span className="ml-auto bg-slate-800 px-2 py-1 rounded">
                          Page {doc.metadata.loc.pageNumber}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
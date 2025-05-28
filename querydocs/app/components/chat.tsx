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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages display */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 bg-slate-800 rounded-t-lg">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot size={48} className="text-indigo-400 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-indigo-200">Welcome to QueryDocs</h3>
            <p className="text-center max-w-md mb-6">Ask questions about your uploaded documents and get AI-powered answers.</p>
            
            <div className="bg-slate-700/50 p-4 rounded-lg max-w-md w-full mx-auto">
              <h4 className="font-medium mb-2 text-indigo-300 flex items-center">
                <FileText size={16} className="mr-2" /> Example questions:
              </h4>
              <ul className="space-y-2 text-sm">
                <li 
                  onClick={() => setQuery("What are the main skills mentioned in this resume?")} 
                  className="p-2 bg-slate-700/80 rounded hover:bg-indigo-500/20 cursor-pointer transition-colors"
                >
                  "What are the main skills mentioned in this resume?"
                </li>
                <li 
                  onClick={() => setQuery("Summarize the key points from this document")} 
                  className="p-2 bg-slate-700/80 rounded hover:bg-indigo-500/20 cursor-pointer transition-colors"
                >
                  "Summarize the key points from this document"
                </li>
                <li 
                  onClick={() => setQuery("What education background is mentioned?")} 
                  className="p-2 bg-slate-700/80 rounded hover:bg-indigo-500/20 cursor-pointer transition-colors"
                >
                  "What education background is mentioned?"
                </li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`relative rounded-lg shadow-md ${message.role === 'user' 
                ? 'bg-indigo-700 ml-8 border border-indigo-600' 
                : 'bg-slate-700 mr-8 border border-slate-600'}`}
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
              
              <div className="p-4">
                {message.role === 'assistant' ? (
                  <div>
                    <div className="prose prose-invert max-w-none pt-3">
                      <ReactMarkdown 
                        components={MarkdownComponents}
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.content.replace(/\n{3,}/g, '\n\n')}
                      </ReactMarkdown>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button 
                        onClick={() => copyToClipboard(message.content)}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-white">{message.content}</p>
                )}
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
        {messages.length > 2 && (
          <button 
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="fixed bottom-24 right-8 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowDown size={20} />
          </button>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900 rounded-b-lg border-t border-slate-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
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
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            disabled={loading || !query.trim()}
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
          <span>Press Enter to send</span>
          {query.length > 0 && (
            <span className="text-right">{query.length} characters</span>
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
                        onClick={() => copyToClipboard(doc.pageContent)}
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        <Copy size={12} /> Copy
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
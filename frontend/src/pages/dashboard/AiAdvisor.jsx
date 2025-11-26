import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader } from "lucide-react";
import { aiApi } from "../../api/aiApi";
import { useAuth } from "../../context/AuthContext";

const AiAdvisor = () => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial Welcome Message
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hello ${
        user?.name || "there"
      }! I am HelaTax AI. I can help you understand tax laws, deductibles, and your filing status. What's on your mind?`,
    },
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call Backend
      const response = await aiApi.askQuestion(userMessage.text);

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: response.data.answer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "I'm having trouble connecting to the server. Please try again later.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">AI Tax Advisor</h1>
        <p className="text-slate-500 text-sm">
          Ask questions about KRA, eTIMS, or your returns.
        </p>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${
                msg.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                ${
                  msg.sender === "user"
                    ? "bg-brand text-white"
                    : "bg-action text-white shadow-md"
                }`}
              >
                {msg.sender === "user" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-6 h-6" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm
                ${
                  msg.sender === "user"
                    ? "bg-brand text-white rounded-tr-none"
                    : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                }
                ${msg.isError ? "border-red-200 bg-red-50 text-red-600" : ""}
              `}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-action flex items-center justify-center">
                <Loader className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 text-slate-400 text-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your taxes..."
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-brand hover:bg-brand-light text-white p-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisor;


'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// Expanded Keyword Database
const knowledgeBase = [
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'greet'],
    answer: "Hello! Welcome to Tempesttrek. I'm your AI assistant. You can ask me about packages, best time to visit, prices, or specific places like Gulmarg and Pahalgam."
  },
  {
    keywords: ['price', 'cost', 'rate', 'budget', 'expensive', 'cheap', 'package price'],
    answer: "Our packages are designed for every budget! \n• **Budget Tours:** Start from ₹9,999/person.\n• **Premium Tours:** Start from ₹18,999/person.\n• **Luxury Honeymoons:** Start from ₹24,999/couple.\n\nTell me your budget or duration, and I can suggest the best option!"
  },
  {
    keywords: ['time', 'season', 'weather', 'month', 'when to visit', 'best time'],
    answer: "Kashmir is beautiful year-round! \n• **April-Oct:** Pleasant weather, green meadows (Perfect for families).\n• **Nov-March:** Snowfall, skiing in Gulmarg (Perfect for snow lovers).\n• **Tulip Festival:** Early April."
  },
  {
    keywords: ['gulmarg', 'gondola', 'skiing', 'snow'],
    answer: "Gulmarg is a winter wonderland! \n• Famous for the **Gondola Ride** (world's second highest).\n• Best for **Skiing & Snowboarding** in winter.\n• In summer, it's a lush green meadow perfect for golfing and trekking."
  },
  {
    keywords: ['pahalgam', 'betaab', 'aru', 'lidder'],
    answer: "Pahalgam (Valley of Shepherds) is breathtaking.\n• Visit **Betaab Valley**, **Aru Valley**, and **Chandanwari**.\n• Enjoy **River Rafting** in the Lidder River.\n• Ideal for relaxing and nature walks."
  },
  {
    keywords: ['sonmarg', 'glacier', 'snow point'],
    answer: "Sonmarg (Meadow of Gold) is famous for the **Thajiwas Glacier** where you can find snow even in summer! It's a gateway to Ladakh and offers stunning river views."
  },
  {
    keywords: ['hotel', 'stay', 'houseboat', 'accommodation'],
    answer: "We offer a wide range of stays:\n• **Houseboats:** Romantic stays on Dal Lake.\n• **Hotels:** 3-Star to 5-Star Luxury properties.\n• **Resorts:** Scenic resorts in Gulmarg & Pahalgam.\nAll our properties are verified for hygiene and comfort."
  },
  {
    keywords: ['contact', 'phone', 'email', 'call', 'reach', 'number'],
    answer: "You can reach us directly:\n📞 **Call (Priority):** +91 7006796123\n💬 **Our WhatsApp:** +91 7006796123\n📧 **Email:** info@tempesttreks.in\n📍 **Office:** Srinagar, Kashmir."
  },
  {
    keywords: ['safety', 'safe', 'security'],
    answer: "Absolutely! Kashmir is one of the safest tourist destinations. We provide 24/7 support, trusted local drivers, and secure hotels to ensure a hassle-free experience for families and couples."
  },
  {
    keywords: ['food', 'eating', 'wazwan', 'restaurant'],
    answer: "Don't miss the traditional **Kashmiri Wazwan**! We can guide you to the best local restaurants to try Rogan Josh, Yakhni, and Kahwa tea."
  },
  {
    keywords: ['include', 'exclusion', 'package include'],
    answer: "Our packages typically include:\n✅ Hotel/Houseboat Stay\n✅ Breakfast & Dinner\n✅ Private Cab Transfers\n✅ Shikara Ride\n\nExclusions: Flights, Lunch, and Activity fees (Gondola/Pony)."
  }
];

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "As-salamu alaykum! Welcome to Tempesttrek. 🏔️ How can I assist you in planning your dream Kashmir trip today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [faqs, setFaqs] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch FAQs from Supabase
  useEffect(() => {
    async function fetchFAQs() {
      try {
        const { data, error } = await supabase
          .from('chatbot_faqs')
          .select('*')
          .order('category', { ascending: true });
        
        if (data && !error) {
          setFaqs(data);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    }
    fetchFAQs();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const findBestMatch = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    // First, check Supabase FAQs
    if (faqs.length > 0) {
      const faqMatch = faqs.find(faq => {
        const questionLower = faq.question.toLowerCase();
        const answerLower = faq.answer.toLowerCase();
        return lowerInput.includes(questionLower) || 
               questionLower.includes(lowerInput) ||
               answerLower.includes(lowerInput);
      });
      
      if (faqMatch) {
        return faqMatch.answer;
      }
    }
    
    // Fallback to static knowledge base
    const match = knowledgeBase.find(item => 
      item.keywords.some(keyword => lowerInput.includes(keyword))
    );

    return match ? match.answer : null;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const response = findBestMatch(userMsg.text);
      
      let botText = "I'm not sure about that specific detail. But our travel experts know everything! \n\nWould you like to chat with a human agent on WhatsApp?";
      
      if (response) {
        botText = response;
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botText, sender: 'bot' }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full shadow-2xl shadow-teal-500/40 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
      >
        <MessageCircle size={28} />
        <span className="font-semibold pr-2 hidden md:block">Chat with us</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[600px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 p-5 flex justify-between items-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <Sparkles size={20} className="text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Tempesttrek Assist</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-xs text-teal-100 font-medium">Online & Ready</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scroll-smooth">
              <div className="text-center text-xs text-gray-400 my-4">Today</div>
              
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 self-end border border-teal-200">
                      <Sparkles size={14} className="text-teal-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 self-end">
                      <User size={14} className="text-gray-500" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                   <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 self-end border border-teal-200">
                      <Sparkles size={14} className="text-teal-600" />
                    </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center h-12">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about packages, weather..."
                  className="flex-1 px-4 py-2 bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`p-2 rounded-full transition-all ${
                    input.trim() 
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md transform hover:scale-105' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-3 text-center">
                <a
                  href="https://wa.me/917006796123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors bg-teal-50 px-3 py-1 rounded-full"
                >
                  <Phone size={12} /> Our WhatsApp: +91 7006796123
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

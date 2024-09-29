import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  Loader,
} from "lucide-react";
import axios from "axios";
import debounce from "lodash.debounce"; // Import debounce from lodash

const API_URL = "http://localhost:5000/api";
import { useNavigate } from "react-router-dom";

export function PdfaiUploadChat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pdfs, setPdfs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fileInputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchPdfs();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchPdfs = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(`${API_URL}/pdf/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPdfs(response.data);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Simulate an API call for logging out
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear user token and any other stored data
      localStorage.removeItem("userToken");

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("userToken");
        await axios.post(`${API_URL}/pdf/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        fetchPdfs();
      } catch (error) {
        console.error("Error uploading PDF:", error);
        alert("Failed to upload PDF.");
      }
    }
  };

  const handleDeletePdf = async (id, event) => {
    event.stopPropagation();
    try {
      const token = localStorage.getItem("userToken");
      await axios.delete(`${API_URL}/pdf/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPdfs();
      if (selectedPdf && selectedPdf._id === id) {
        setSelectedPdf(null);
        setChatMessages([]);
      }
    } catch (error) {
      console.error("Error deleting PDF:", error);
      alert("Failed to delete PDF.");
    }
  };

  const handleSelectPdf = async (pdf) => {
    setSelectedPdf(pdf);
    setChatMessages([]);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        `${API_URL}/pdf/chat`,
        {
          sourceId: pdf.sourceId,
          message: "Give me a brief summary of this PDF.",
          messages: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages([
        { text: `PDF selected: ${pdf.name}`, sender: "system" },
        { text: response.data.message, sender: "ai" },
      ]);
    } catch (error) {
      console.error("Error getting initial summary:", error);
      setChatMessages([
        { text: `PDF selected: ${pdf.name}`, sender: "system" },
        {
          text: "Failed to get initial summary. Please try asking a question.",
          sender: "system",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the handleSelectPdf function
  const debouncedHandleSelectPdf = useCallback(
    debounce(handleSelectPdf, 1000),
    []
  );

  const handleSendMessage = async () => {
    if (inputMessage.trim() && selectedPdf) {
      const newMessage = { text: inputMessage, sender: "user" };
      setChatMessages((prev) => [...prev, newMessage]);
      setInputMessage("");
      setIsLoading(true);

      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.post(
          `${API_URL}/pdf/chat`,
          {
            sourceId: selectedPdf.sourceId,
            message: inputMessage,
            messages: chatMessages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const aiMessage = { text: response.data.message, sender: "ai" };
        setChatMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message to AI.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Debounce the handleSendMessage function
  const debouncedHandleSendMessage = useCallback(
    debounce(handleSendMessage, 500),
    [inputMessage, selectedPdf, chatMessages]
  );

  return (
    <div className="min-h-screen flex bg-black text-cyan-400 overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-black bg-opacity-70 border-r border-cyan-700 p-4 relative z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cyan-400">PDFAI</h2>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
                size="icon"
                className="text-cyan-400 hover:text-cyan-300"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              {pdfs.map((pdf) => (
                <div
                  key={pdf._id}
                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-cyan-900 hover:bg-opacity-30 group ${
                    selectedPdf && selectedPdf._id === pdf._id
                      ? "bg-cyan-900 bg-opacity-50"
                      : ""
                  }`}
                >
                  <div
                    className="w-44 truncate"
                    onClick={() => debouncedHandleSelectPdf(pdf)}
                  >
                    {pdf.name}
                  </div>
                  <Button
                    onClick={(e) => handleDeletePdf(pdf._id, e)}
                    variant="ghost"
                    size="icon"
                    className="ml-auto text-cyan-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <Button
                onClick={() => fileInputRef.current.click()}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-black"
              >
                <Upload className="mr-2 h-4 w-4" /> Upload PDF
              </Button>
              <Input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                className="w-full border-cyan-600 text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-30"
              >
                {isLoggingOut ? (
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative z-10">
        {!sidebarOpen && (
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        <div className="h-full bg-black bg-opacity-70 p-4 flex flex-col">
          <ScrollArea className="flex-1 mb-4" ref={chatScrollRef}>
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-cyan-900 bg-opacity-50 ml-auto"
                    : message.sender === "system"
                    ? "bg-gray-700 bg-opacity-50"
                    : "bg-gray-800 bg-opacity-50"
                } min-w-[200px] max-w-[70%] break-words`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-center p-2">
                <Loader className="animate-spin h-6 w-6 text-cyan-400" />
                <span className="ml-2 text-cyan-400">AI is thinking...</span>
              </div>
            )}
          </ScrollArea>
          <div className="flex items-center">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && debouncedHandleSendMessage()
              } // Use the debounced send message function
              placeholder={
                selectedPdf
                  ? `Ask about ${selectedPdf.name}...`
                  : "Select a PDF to start chatting"
              }
              className="flex-1 mr-2 bg-gray-800 border-cyan-600 text-cyan-400 placeholder-cyan-600"
              disabled={!selectedPdf}
            />
            <Button
              onClick={debouncedHandleSendMessage} // Use the debounced send message function
              className="bg-cyan-600 hover:bg-cyan-700 text-black"
              disabled={isLoading || !selectedPdf}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
function NeonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)" />
        {[...Array(20)].map((_, i) => (
          <NeonLine key={i} />
        ))}
      </svg>
    </div>
  );
}

function NeonLine() {
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const endX = Math.random() * 100;
  const endY = Math.random() * 100;

  return (
    <motion.line
      x1={`${startX}%`}
      y1={`${startY}%`}
      x2={`${endX}%`}
      y2={`${endY}%`}
      stroke="#00ffff"
      strokeWidth="0.5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: [0, 1, 1, 0],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 5 + Math.random() * 5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      }}
    />
  );
}

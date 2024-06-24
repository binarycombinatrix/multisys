'use client'

import { useEffect, useState } from 'react'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

import classes from './index.module.scss'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [chat, setChat] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [error, setError] = useState(null)

  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  const MODEL_NAME = 'gemini-1.5-flash'
  const genAI = new GoogleGenerativeAI(API_KEY)

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 2048,
    responseMimeType: 'text/plain',
  }

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ]

  useEffect(() => {
    const initChat = async () => {
      console.log('the api key is', API_KEY)

      try {
        const newChat = await genAI
          .getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction:
              'You are a computer hardware engineer at Multisys computronics, and are also expert in knowledge of latest devices. You help people to choose what tech devices to buy such as smartphones, laptops, pc, smartwatch etc.\n\nIntroduce yourself with the "Hi, I\'m your Tech Guide"',
          })
          .startChat({
            generationConfig,
            safetySettings,
            history: messages.map(msg => ({
              text: msg.text,
              role: msg.role,
            })),
          })
        setChat(newChat)
      } catch (e) {
        setError('Failed to initialize chat: ' + e)
      }
    }

    initChat()
  }, [])

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: 'user',
        timestamp: new Date(),
      }

      setMessages(prevMessages => [...prevMessages, userMessage])
      setUserInput('')

      if (chat) {
        const result = await chat.sendMessage(userInput)
        const botMessage = {
          text: result.response.text(),
          role: 'bot',
          timestamp: new Date(),
        }
        setMessages(prevMessages => [...prevMessages, botMessage])
      }
    } catch (e) {
      setError('Failed to send message: ' + e)
    }
  }

  const handleThemeChange = event => {
    setTheme(event.target.value)
  }

  const getThemeColors = () => {
    switch (theme) {
      case 'dark':
        return {
          primary: 'bg-gray-900',
          secondary: 'bg-gray-800',
          accent: 'bg-yellow-500',
          text: 'text-gray-100',
        }
      case 'light':
        return {
          primary: 'bg-white',
          secondary: 'bg-gray-100',
          accent: 'bg-blue-500',
          text: 'text-gray-800',
        }
      default:
        return {
          primary: 'bg-white',
          secondary: 'bg-gray-100',
          accent: 'bg-blue-500',
          text: 'text-gray-800',
        }
    }
  }

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const { primary, secondary, accent, text } = getThemeColors()

  return (
    <div className={classes.container}>
      <div className={classes.msgHeader}>
        <h2 className={classes.title}>Gemini Chat</h2>
      </div>

      <div className={classes.chatPage}>
        <div className={classes.msgInbox}>
          <div className={classes.chats}>
            <div className={classes.msgPage}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={msg.role === 'bot' ? classes.receivedChats : classes.outgoingChats}
                >
                  <div
                    className={
                      msg.role === 'bot' ? classes.receivedChatsImg : classes.outgoingChatsImg
                    }
                  >
                    <p>{msg.role === 'bot' ? 'Bot' : 'You'}</p>
                  </div>

                  <div className={msg.role === 'bot' ? classes.receivedMsg : classes.outgoingMsg}>
                    <div
                      className={
                        msg.role === 'bot' ? classes.receivedMsgInbox : classes.outgoingChatsMsg
                      }
                    >
                      <p className={classes.overflowWrap}>{msg.text}</p>
                      <span className={classes.time}>{msg.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            </div>
          </div>

          <div className={classes.msgBottom}>
            <div className={classes.inputGroup}>
              <input
                type="text"
                placeholder="Type your message..."
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className={classes.input + ' ' + classes.formControl}
              />
              <div className={classes.inputGroupAppend}>
                <button
                  onClick={handleSendMessage}
                  className={classes.inputGroupText + ' ' + classes.sendIcon}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

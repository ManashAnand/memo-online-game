'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { socket } from '@/socket'

export default function CoinFlip() {
    const [isFlipping, setIsFlipping] = useState(false)
    const [face, setFace] = useState('head')
    const [isMyTurn, setIsMyTurn] = useState(false)
    const [message, setMessage] = useState('')
    const [socketId, setSocketId] = useState(null)

    useEffect(() => {
        // Get the socket ID when the component mounts
        socket.on('connect', () => {
            console.log(socket.id)
            setSocketId(socket.id)
        })

        socket.on('gameState', ({ currentPlayer, lastFace }) => {
            setIsMyTurn(currentPlayer === socket.id)
            if (lastFace) setFace(lastFace)
            setMessage(currentPlayer === socket.id ? "It's your turn!" : "Waiting for opponent...")
        })
        socket.on('flipResult', ({ newFace, nextPlayer }) => {
            setFace(newFace)
            setIsFlipping(false)
            setIsMyTurn(nextPlayer === socket.id)
            setMessage(nextPlayer === socket.id ? "It's your turn!" : "Waiting for opponent...")
        })

        return () => {
            socket.off('connect')
            socket.off('gameState')
            socket.off('flipResult')
        }
    }, [])

    const flipCoin = () => {
        if (isFlipping || !isMyTurn) return
        setIsFlipping(true)
        socket.emit("flipCoin")
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
            {socketId && (
                <p className="mt-4 text-sm text-gray-600">
                    Your Socket ID: {socketId}
                </p>
            )}
            <motion.div
                className="w-40 h-40 cursor-pointer"
                animate={{ rotateX: isFlipping ? 1080 : 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                onClick={flipCoin}
            >
                <div className={`w-full h-full rounded-full shadow-lg ${isFlipping ? 'animate-pulse' : ''}`}>
                    {face === 'heads' ? (
                        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="50" fill="#FFD700" />
                            <circle cx="50" cy="50" r="45" fill="#FFA500" />
                            <path d="M50 20C40 20 30 30 30 50C30 70 40 80 50 80C60 80 70 70 70 50C70 30 60 20 50 20ZM50 70C45 70 40 65 40 50C40 35 45 30 50 30C55 30 60 35 60 50C60 65 55 70 50 70Z" fill="#FFD700" />
                        </svg>
                    ) : (
                        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="50" fill="#C0C0C0" />
                            <circle cx="50" cy="50" r="45" fill="#A9A9A9" />
                            <text x="50" y="65" fontFamily="Arial" fontSize="40" fill="#C0C0C0" textAnchor="middle">T</text>
                        </svg>
                    )}
                </div>
            </motion.div>
            <p className="mt-8 text-2xl font-bold text-blue-800">
                {isFlipping ? 'Flipping...' : `It's ${face}!`}
            </p>
            <p className="mt-4 text-xl text-blue-600">
                {message}
            </p>
            <button
                onClick={flipCoin}
                disabled={isFlipping || !isMyTurn}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
                Flip Coin
            </button>
        </div>
    )
}
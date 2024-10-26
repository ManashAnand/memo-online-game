"use client";

import { useEffect, useState } from "react";
import { socket } from '@/socket'

const MemoryGame = () => {
    const [gridSize, setGridSize] = useState(4);
    const [cards, setCards] = useState([]);

    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);

    const [won, setWon] = useState(false);
    const [isMyTurn,setIsMyTurn] = useState(false)
    const [msg,setMsg] = useState(``)


    const initializeGame = () => {
        const totalCards = gridSize * gridSize; // 16
        const pairCount = Math.floor(totalCards / 2); // 8
        const numbers = [...Array(pairCount).keys()].map((n) => n + 1);
        const shuffledCards = [...numbers, ...numbers]
            .sort(() => Math.random() - 0.5)
            .slice(0, totalCards)
            .map((number, index) => ({ id: index, number }));

        setCards(shuffledCards);
        setFlipped([]);
        setSolved([]);
        setWon(false);
        setWon(false);
    };

    useEffect(() => {
        socket.emit('gamePrep', () => {
            console.log(socket.id)
        })
        socket.on('getTotalPlayer', (TotalPlayers) => setGridSize(TotalPlayers))
        


        initializeGame();

        return () => {
            socket.off('gamePrep')
            socket.off('getTotalPlayer')

        }
    }, [gridSize]);

    const checkMatch = (secondId) => {
        const [firstId] = flipped;
        if (cards[firstId].number === cards[secondId].number) {
            // console.log("find color")
            console.log(socket.id)
            socket.emit("updatePoint",socket.id)
            setSolved([...solved, firstId, secondId]);
            setFlipped([]);
            setDisabled(false);
        } else {
            setTimeout(() => {
                setFlipped([]);
                setDisabled(false);
            }, 1000);
        }
    };

    const handleClick = (id) => {
        if (disabled || won) return;

        if (flipped.length === 0) {
            setFlipped([id]);
            return;
        }

        if (flipped.length === 1) {
            setDisabled(true);
            if (id !== flipped[0]) {
                setFlipped([...flipped, id]);
                // check match logic
                checkMatch(id);
            } else {
                setFlipped([]);
                setDisabled(false);
            }
        }
    };

    const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
    const isSolved = (id) => solved.includes(id);

    useEffect(() => {
        if (solved.length === cards.length && cards.length > 0) {
            setWon(true);
        }
    }, [solved, cards]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-grey-100 p-4">
            <h1 className="text-3xl font-bold mb-6">Memory Game</h1>
            {/* Input */}
            <div className="mb-4">
                <label htmlFor="gridSize" className="mr-2">
                    Grid Size: (only even no of players allowed)
                </label>

            </div>

            <div
                className={`grid gap-2 mb-4`}
                style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0,1fr))`,
                    width: `min(100%, ${gridSize * 5.5}rem)`,
                }}
            >
                {cards.map((card) => {
                    return (
                        <div
                            key={card.id}
                            onClick={() => handleClick(card.id)}
                            className={`aspect-square flex items-center justify-center text-xl font-bold rounded-lg cursor-pointer transition-all duration-300  ${isFlipped(card.id)
                                ? isSolved(card.id)
                                    ? "bg-green-500 text-white"
                                    : "bg-blue-500 text-white"
                                : "bg-gray-300 text-gray-400"
                                }`}
                        >
                            {isFlipped(card.id) ? card.number : "?"}
                        </div>
                    );
                })}
            </div>

            {won && (
                <div className="mt-4 text-4xl font-bold text-green-600 animate-bounce">
                    You Won!
                </div>
            )}

            <button
                onClick={initializeGame}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
                {won ? "Play Again" : "Reset"}
            </button>
        </div>
    );
};

export default MemoryGame;
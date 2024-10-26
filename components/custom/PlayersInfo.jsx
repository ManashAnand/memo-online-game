"use client";

import React, { useEffect, useState } from 'react'
import { socket } from '@/socket'

const PlayersInfo = () => {

    const [allPlayer, setAllPlayer] = useState([])

    useEffect(() => {
        socket.emit('getAllPlayerInfo', (players) => {
            console.log(players)
        })

        socket.on("allPlayersInfo", (players) => {
            console.log("Getting all players data")
            console.log(players)
            setAllPlayer(players)
        })

        return () => {
            socket.off("getAllPlayerInfo")
            socket.off("allPlayersInfo")
        }

    }, [])
    const totalPlayer = allPlayer.length
    const totalEvenPlayer = totalPlayer%2==0?totalPlayer:totalPlayer-1
    return (
        <>
        Total player in lobby : {totalPlayer}
            <div className='flex justify-center items-center gap-2'>
                {
                    allPlayer?.slice(0, totalEvenPlayer).map((player) => {
                        return (
                            <div key={player.id}>
                                <h1 >
                                    {player.id}
                                </h1>
                                <div>{player.points}</div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default PlayersInfo

import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    const players = new Set();
    let currentPlayer = null;

    let gameInProgress = false;
    let currentPlayerIndex = 0;
    let lastFace = null;

    io.on("connection", (socket) => {

        const newPlayer = { id: socket.id, points: 0 };
        players.add(newPlayer);


        if (players.size === 1) {
            currentPlayer = newPlayer.id;
        }


        socket.on("getAllPlayerInfo", () => {
            const AllPlayer = Array.from(players)
            io.emit("allPlayersInfo", AllPlayer)
        })

        socket.on('gamePrep', () => {
            let TotalPlayer = Array.from(players).length
            if (TotalPlayer % 2 == 0) io.emit('getTotalPlayer', Array.from(players).length)
            else io.emit('getTotalPlayer', Array.from(players).length - 1)
        
        })

        socket.on("updatePoint",(id) => {
            for (let player of players) {
                if (player.id === id) {
                    player.points = player.points+1;
                    break; // Exit loop once the item is found and deleted
                }
            }
            const AllPlayer = Array.from(players)
            io.emit("allPlayersInfo", AllPlayer)
        })

        socket.on("disconnect", () => {
            console.log("player disconnected " + socket.id)
            players.forEach(player => {
                if (player.id === socket.id) {
                    players.delete(player);
                }
            });

            if (players.size === 0) {
                currentPlayer = null;
                lastFace = null;
            } else if (currentPlayer === socket.id) {
                currentPlayer = Array.from(players)[0].id;
                io.emit('gameState', {
                    currentPlayer,
                    lastFace,
                    players: Array.from(players).map(p => ({ id: p.id, points: p.points }))
                });
            }

            for (let player of players) {
                if (player.id === socket.id) {
                    players.delete(player);
                    break; // Exit loop once the item is found and deleted
                }
            }
            let TotalPlayer = Array.from(players).length
            if (TotalPlayer % 2 == 0) io.emit('getTotalPlayer', Array.from(players).length)
            else io.emit('getTotalPlayer', Array.from(players).length - 1)
            const AllPlayer = Array.from(players)
            io.emit("allPlayersInfo", AllPlayer)

        });


    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
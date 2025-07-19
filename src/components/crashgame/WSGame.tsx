import React, { useEffect, useState } from 'react';
//import JoinGameButton from './JoinGameButton';

const WSGame = () => {
    const [status, setStatus] = useState('Wait rounds starts...');
    const [multiplier, setMultiplier] = useState(1.0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [socket, setSocket] = useState(null);
    const [gameId, setGameId] = useState(null);
    
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3001');

        ws.onopen = () => {
            console.log('Подключение установлено');
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'countdown':
                    setTimeLeft(message.timeLeft);
                    setMultiplier(1.0);
                    setGameId(null);
                    setStatus('Ожидайте начало раунда...');
                    break;
                case 'multiplier-start':
                    setTimeLeft(null);
                    //setGameId(123); // эмитируем ID игры
                    setStatus('Раунд начался!');
                    break;
                case 'active-players':
                  if (message.address === 'player_123') {
                    console.log('>>> Joined')
                    setGameId(123);
                  }
                  break;
                case 'multiplier-update':
                    setMultiplier(message.current);
                    break;
                case 'multiplier-crash':
                    setGameId(null);
                    setStatus(`Игра завершена! Множитель: ${message.final.toFixed(2)}x`);
                    break;
                case 'player-cashed-out':
                    if (message.address === 'player_123') {
                        alert(`Вы вышли из игры! Ваш выигрыш: ${message.winAmount.toFixed(2)} монет`);
                    }
                    break;
                default:
                    break;
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const handleJoinGame = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            alert("Сервер недоступен");
            return;
        }

        const betAmount = prompt("Введите вашу ставку:", "0.1");

        if (betAmount && parseFloat(betAmount) > 0) {
            socket.send(JSON.stringify({
                type: 'join-game',
                address: 'player_123',
                betAmount: parseFloat(betAmount)
            }));
        }
    };

    const handleCashOut = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            alert("Сервер недоступен");
            return;
        }

        socket.send(JSON.stringify({
            type: 'cash-out',
            address: 'player_123'
        }));
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-6">Crash Game</h1>

            {timeLeft !== null && (
                <div className="mb-4">
                    <p>Round starts in:</p>
                    <p className="text-6xl font-mono">{timeLeft}</p>
                </div>
            )}

            <div className="text-8xl font-mono mb-4">{parseFloat(multiplier).toFixed(2)}x</div>
            <p className="text-xl mb-6">{status}</p>

            {!gameId ? (
                <button
                    onClick={handleJoinGame}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-medium transition"
                >
                    Join Game
                </button>
            ) : (
                <button
                    onClick={handleCashOut}
                    className="mt-4 bg-yellow-600 hover:bg-yellow-500 px-6 py-2 rounded-lg text-white font-medium transition"
                >
                    💸 Cash Out
                </button>
            )}
        </div>
    );
};

export default WSGame;
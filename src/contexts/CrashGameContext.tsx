import { createContext, useContext, useState, useEffect, useRef } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import fetchGameToken from '@/helpers_crashgame/fetchGameToken'
import fetchPlayerInfo from '@/helpers_crashgame/fetchPlayerInfo'
import BigNumber from "bignumber.js"


const CrashGameContext = createContext({
  gameChainId: false,
  gameContractAddress: false,
  gameBackendWS: false,
  gameBackendSocket: false,
  contractInfo: false,
  isFetching: true,
  isError: false,
  fetchInfo: () => {},
  bankAmount: 0,
  playerDeposit: 0,
  tokenInfo: {},
  updateTokenInfo: () => {},
  playerInfo: {},
  activePlayerBet: false,
  activePlayerCashOut: false,
  updatePlayerInfo: () => {},
  
  lastRoundId: 0,
  
  addMessageListener: () => {},
  removeMessageListener: () => {},
  
  gameStatus: {},
  
  joinGame: () => {},
  checkConnectedToQuery: () => {},
  leaveGame: () => {},
  cashOutBet: () => {}
})

export const useCrashGame = () => {
  return useContext(CrashGameContext)
}

export default function CrashGameProvider(props) {
  const {
    children,
    chainId,
    contractAddress,
    backendWS
  } = props
  
  const {
    isConnected,
    injectedAccount
  } = useInjectedWeb3()

  const [wsState, setWsState] = useState({
      socket: null,
      isConnected: false,
      isConnecting: false,
      error: null
  });
  
  const [ contractInfo, setContractInfo ] = useState({})
  const [ isFetching, setIsFetching ] = useState(true)
  const [ isError, setIsError ] = useState(false)

  const [ tokenInfo, setTokenInfo ] = useState(false)
  const [ bankAmount, setBankAmount ] = useState(0)
  
  const [ needUpdateTokenInfo, setNeedUpdateTokenInfo ] = useState(true)
  
  const [ playerInfo, setPlayerInfo ] = useState(false)
  const [ needUpdatePlayerInfo, setNeedUpdatePlayerInfo ] = useState(true)
  const [ activePlayerBet, setActivePlayerBet ] = useState(false)
  const [ activePlayerCashOut, setActivePlayerCashOut ] = useState(false)
  const [ activePlayerCashOutMultiplier, setActivePlayerCashOutMultiplier ] = useState(false)
  const [ userRoundId, setUserRoundId ] = useState(false)
  const [ lastRoundId, setLastRoundId ] = useState(false)
  
  
  const [ gameStatus, setGameStatus ] = useState({
    roundId: 0,
    isCountDown: false,
    countdown: 0,
    roundInterval: 0,
    isPending: false,
    isRunning: false,
    isCrashed: false,
    isCashOut: false,
    cashOutMultiplier: 1,
    multiplier: 1
  })
  const listeners = useRef({});

  // Функция для добавления слушателя
  function addMessageListener(type, callback) {
    if (!listeners.current[type]) {
      listeners.current[type] = [];
    }
    listeners.current[type].push(callback);
  }

  function removeMessageListener(type, callback) {
    if (!listeners.current[type]) return;
    listeners.current[type] = listeners.current[type].filter(cb => cb !== callback);
  }
  
  useEffect(() => {
    if (activePlayerBet && activePlayerCashOutMultiplier) {
      setActivePlayerCashOut(
        new BigNumber(activePlayerBet).multipliedBy(
          activePlayerCashOutMultiplier
        ).toFixed()
      )
    }
  }, [ activePlayerCashOutMultiplier ])
  
  useEffect(() => {
    if (lastRoundId == userRoundId) {
      setActivePlayerBet(false)
      setActivePlayerCashOut(false)
      setActivePlayerCashOutMultiplier(false)
    }
  }, [ lastRoundId ])
  /* Connect to WS BackEnd */
  const connectWebSocket = () => {
    const ws = new WebSocket(backendWS);
    setWsState(prev => ({ ...prev, isConnecting: true, error: null }));

    let reconnectTimeout = null;

    const resetReconnect = () => {
      clearTimeout(reconnectTimeout);
      setWsState(prev => ({ ...prev, isConnecting: false, error: null }));
    };
  
    ws.onopen = () => {
      console.log('WebSocket: Подключение установлено');
      setWsState({ socket: ws, isConnected: true, isConnecting: false, error: null });
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'leave-game':
          setActivePlayerBet(false)
          setUserRoundId(false)
          break
        case 'round-finished':
          setNeedUpdatePlayerInfo(true)
          setLastRoundId(message.roundId)
          break;
        case 'player-join-game':
          const {
            betAmount,
            cashOutMultiplier,
          } = message
          setActivePlayerBet(betAmount)
          setActivePlayerCashOutMultiplier(cashOutMultiplier > 1 ? cashOutMultiplier : false)
          setUserRoundId(message.roundId)
          break;
        case 'countdown-cancel':
          setGameStatus((prev) => {
            return {
              ...prev,
              isCountDown: false,
            }
          })
          break;
        case 'countdown-start':
          console.log('>>>> CountDown start', message)
          setGameStatus(() => {
            return {
              isCountDown: true,
              countdown: message.timeout,
              roundInterval: message.roundInterval,
              isPending: false,
              isRunning: false,
              isCrashed: false,
              isCashOut: false,
              cashOutMultiplier: 1,
              multiplier: 1
            }
          })
          break;
        case 'countdown':
          setGameStatus((prev) => {
            return {
              ...prev,
              countdown: message.timeLeft,
              roundInterval: message.roundInterval
              
            }
          })
          break;
        case 'pending':
          setGameStatus({
            isCountDown: false,
            countdown: 0,
            isPending: true,
            isRunning: false,
            isCrashed: false,
            isCashOut: false,
            cashOutMultiplier: 1,
            multiplier: 1
          })
          break;
        case 'multiplier-start':
        case 'multiplier-update':
          setGameStatus((prev) => {
            return {
              isCountDown: false,
              countdown: 0,
              isPending: false,
              isRunning: true,
              isCrashed: false,
              roundId: message.roundId,
              multiplier: message.current,
              isCashOut: prev.isCashOut,
              cashOutMultiplier: prev.cashOutMultiplier,
            }
          })
          break;
        case 'multiplier-crash':
          setGameStatus((prev) => {
            return {
              isCountDown: false,
              countdown: 0,
              isPending: false,
              isRunning: false,
              isCrashed: true,
              multiplier: message.final,
              roundId: message.roundId,
              isCashOut: prev.isCashOut,
              cashOutMultiplier: prev.cashOutMultiplier,
            }
          })
          break;
        case 'cashed-out':
          setGameStatus((prev) => {
            return {
              ...prev,
              isCashOut: true,
              cashOutMultiplier: message.multiplier,
            }
          })
          setActivePlayerCashOutMultiplier(new BigNumber(message.multiplier).toFixed(2))
          console.log('[CODE] cashed-out', message.multiplier)
          break;
      }
      try {
        const message = JSON.parse(event.data);
        const type = message.type;
        // console.log('[WS MESSAGE] ', type, message)
        if (listeners.current[type]) {
            listeners.current[type].forEach(callback => callback(message));
        }
      } catch (err) {
        console.error("Ошибка при обработке сообщения:", err);
      }
    };
    ws.onclose = (e) => {
      console.log('WebSocket: Соединение закрыто', e.reason);
      setWsState({ socket: null, isConnected: false, isConnecting: false, error: 'Соединение потеряно' });

      // Запускаем переподключение
      reconnectTimeout = setTimeout(() => {
        console.log('WebSocket: Переподключение...');
        connectWebSocket();
      }, 5000); // попытка reconnect через 5 сек
    };

    ws.onerror = (err) => {
      console.error('WebSocket: Ошибка', err.message);
      ws.close(); // принудительно закрываем
    };
  };
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsState.socket) {
        wsState.socket.close();
      }
    };
  }, []);
  
  /*
  useEffect(() => {
    console.log('[GameStatus]', gameStatus)
  }, [ gameStatus ])
  */
  const checkConnectedToQuery = (options) => {
    
    const {
      playerId
    } = options
    console.log('>>> checkConnectedToQuery', playerId)
    wsState.socket.send(JSON.stringify({
      type: 'player-reconnect',
      playerId,
    }))
  }
  
  const leaveGame = (options) => {
    const {
      playerId,
      roundId,
      userAddress,
      betAmount,
      messageHash,
      signature
    } = options
    wsState.socket.send(JSON.stringify({
      type: 'player-leave-game',
      playerId,
      roundId,
      userAddress,
      betAmount,
      messageHash,
      signature
    }));
  }
  const cashOutBet = (options) => {
    const {
      playerId,
      roundId,
      userAddress,
      betAmount,
      messageHash,
      signature
    } = options
    wsState.socket.send(JSON.stringify({
      type: 'player-cash-out',
      playerId,
      roundId,
      userAddress,
      betAmount,
      messageHash,
      signature
    }));
  }
  const joinGame = (options) => {
    const {
      playerId,
      roundId,
      userAddress,
      betAmount,
      messageHash,
      signature
    } = options
    
    wsState.socket.send(JSON.stringify({
      type: 'join-game',
      playerId,
      roundId,
      userAddress,
      betAmount,
      messageHash,
      signature
    }));
  }
  
  
  useEffect(() => {
    if (isConnected || needUpdateTokenInfo) {
      console.log('>>> UPDATE TOKEN INFO')
      setNeedUpdateTokenInfo(false)
      fetchGameToken({
        chainId,
        address: contractAddress,
        playerAddress: isConnected ? injectedAccount : false
      }).then(({ tokenInfo, bankAmount }) => {
        setTokenInfo(tokenInfo)
        setBankAmount(bankAmount)
      }).catch((err) => {
        console.log('Fail fetch token info', err)
      })
    }
  }, [ isConnected, injectedAccount, needUpdateTokenInfo ])

  useEffect(() => {
    if ((isConnected || needUpdatePlayerInfo) && !!injectedAccount) {
      console.log('>>> UPDATE PLAYER INFO')
      setNeedUpdatePlayerInfo(false)
      fetchPlayerInfo({
        chainId,
        address: contractAddress,
        playerAddress: injectedAccount
      }).then(({ playerInfo, bankAmount }) => {
        setPlayerInfo(() => { return playerInfo })
        setBankAmount(bankAmount)
      }).catch((err) => {
        console.log('Fail fetch player info', err)
      })
    } else {
      console.log('>>> Clear player info')
      setPlayerInfo(false)
    }
  }, [ isConnected, injectedAccount, needUpdatePlayerInfo ])
  
  const fetchInfo = () => {
  }
  
  return (
    <CrashGameContext.Provider value={{
      gameChainId: chainId,
      gameContractAddress: contractAddress,
      gameBackendWS: backendWS,
      gameBackendSocket: wsState,
      contractInfo,
      isError,
      isFetching,
      fetchInfo,
      tokenInfo,
      bankAmount,
      lastRoundId,
      activePlayerBet,
      activePlayerCashOut,
      updateTokenInfo: () => { setNeedUpdateTokenInfo(true) },
      playerInfo,
      updatePlayerInfo: () => { setNeedUpdatePlayerInfo(true) },
      /* ------------------ */
      addMessageListener,
      removeMessageListener,
      /* ------------------ */
      joinGame,
      checkConnectedToQuery,
      leaveGame,
      cashOutBet,
      /* ------------------ */
      gameStatus,
    }}>
      {children}
    </CrashGameContext.Provider>
  )
}

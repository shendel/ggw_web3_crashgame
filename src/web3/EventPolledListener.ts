/**
 * Хелпер для прослушивания событий контракта без WebSocket (через polling)
 */
const EventPolledListener = (options) => {
  const {
    contract,
    web3,
    eventName,
    pollIntervalMs = 1000,
    callback = (events) => {},
    fromBlock: _fromBlock = 'latest',
    filter = {}
  } = options
  let fromBlock = _fromBlock
  let isRunning = true

  const poll = async () => {
    if (!isRunning) return;
    //console.log('>>> POLLING')
    try {
      const latestBlock = await web3.eth.getBlock('latest');
      const currentToBlock = parseInt(latestBlock.number, 16);
      const eventOptions = {
        filter, // можно фильтровать по аргументам
        fromBlock: currentToBlock - 50,
        toBlock: 'latest',
      };
//console.log('>>> eventOptions', eventOptions )
//return
      const events = await contract.getPastEvents(eventName, eventOptions);
console.log('>>>>> EVENTS', events)
      if (events.length > 0) {
        
        callback(events);
        // Обновляем fromBlock после обработки, чтобы не дублировать
        fromBlock = events[events.length - 1].blockNumber + 1;
      }
    } catch (error) {
      console.error(`Ошибка при опросе события ${eventName}:`, error);
    }

    // Запускаем следующий опрос
    setTimeout(poll, pollIntervalMs);
  };

  // Запускаем первый опрос
  poll();

  // Возвращаем функцию для остановки
  return function stopPolling() {
    console.log('>>>> STOP POLLING')
    isRunning = false;
  };
}

export default EventPolledListener
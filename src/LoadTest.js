import './LoadTest.css';
import React, { useState, useRef } from 'react';
import webSocket from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const URL = 'https://utexpo.cacdidemo.com/loadTest';

function LoadTest() {
  const navigate = useNavigate()
  const [isTesting, setIsTesting] = useState(false)
  const [parameters, setParameters] = useState({
    maxClients: 1000,
    longPollingPercentage: 0.05,
    clientCreationInterval: 10,
    emitInterval: 1000,
  })
  const {
    maxClients,
    longPollingPercentage,
    clientCreationInterval,
    emitInterval
  } = parameters
  const onChangeParameter = (evt) => {
    const newParameters = {
      ...parameters,
      [evt.target.name]: evt.target.value
    }
    setParameters(newParameters)
  }


  let clientCount = 0;
  let lastReport = new Date().getTime();
  let packetsSinceLastReport = 0;
  let printJob = useRef()
  let emitJobs = useRef([])
  const results = useRef([])

  const startTest = () => {
    setIsTesting(true)
    printJob.current = undefined
    emitJobs.current = []
    results.current = []
    const createClient = () => {
      // for demonstration purposes, some clients stay stuck in HTTP long-polling
      const transports =
        Math.random() < longPollingPercentage ? ['polling'] : ['polling', 'websocket'];
  
      const socket = webSocket(URL, {
        transports,
      });
  
      const emitJob = setInterval(() => {
        socket.emit('client to server event');
      }, emitInterval);
      emitJobs.current.push(emitJob)
  
      socket.on('server to client event', () => {
        packetsSinceLastReport++;
      });
  
      socket.on('disconnect', (reason) => {
        console.log(`disconnect due to ${reason}`);
      });
  
      if (++clientCount < maxClients) {
        setTimeout(createClient, clientCreationInterval);
      }
    };
  
    createClient();
  
    const printReport = () => {
      const now = new Date().getTime();
      const durationSinceLastReport = (now - lastReport) / 1000;
      const packetsPerSeconds = (
        packetsSinceLastReport / durationSinceLastReport
      ).toFixed(2);
      results.current.push({
        id: new Date().getTime,
        clientCount,
        packetsPerSeconds,
      })
      packetsSinceLastReport = 0;
      lastReport = now;
    };
    printJob.current = setInterval(printReport, 2000);
  }

  const stopTest = () => {
    for (const job of emitJobs.current) {
      clearInterval(job);
    }
    clearInterval(printJob.current)
    setIsTesting(false)
  }

  return (
    <div>
        {!isTesting && (
          <div className="Parameters">
            <label>
              總訪客數
              <input value={maxClients} onChange={onChangeParameter} name="maxClients"/>
            </label>
            <label>
              Long Polling 比例(0 ~ 1)
              <input value={longPollingPercentage} onChange={onChangeParameter} name="longPollingPercentage"/>
            </label>
            <label>
              訪客生成間隔(毫秒)
              <input value={clientCreationInterval} onChange={onChangeParameter} name="clientCreationInterval"/>
            </label>
            <label>
              訪客發送封包間隔(毫秒)
              <input value={emitInterval} onChange={onChangeParameter} name="emitInterval"/>
            </label>
          </div>
        )}
        {!isTesting && <button onClick={startTest} className="Start-btn">開始測試</button>}
        {!!isTesting && <div className="Waiting">測試中</div>}
        {!!isTesting && <button onClick={stopTest} className="Stop-btn">Stop Testing</button>}
        {!isTesting && !!results.current.length && <div className="Results">
          {results.current.map(result => (
            <div key={result.id}>訪客人數: {result.clientCount} 封包數(每秒): {result.packetsPerSeconds}</div>
          ))}
        </div>}
        <button className="Navigate-btn" onClick={() => { navigate('/app') }}>回到首頁</button>
    </div>
  );
}

export default LoadTest;

import './App.css';
import React, { useState, useEffect } from 'react';
import webSocket from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  // socket 實體
  const [ws, setWs] = useState(null)

  // 目前位於哪一個展覽
  const [exhibition, setExhibition] = useState('')

  // 所有展間
  const exhibitions = ['exhibition001', 'exhibition002']

  // 所有攤位
  const booths = {
    exhibition001: {
      lobby: 0,
      booth002: 0,
      booth003: 0
    },
    exhibition002: {
      lobby: 0,
      booth005: 0,
      booth006: 0
    }
  }

  // 熱地圖
  const [hotmap, setHotmap] = useState({})

  // 點擊展覽時觸發，將展覽 id 送給 Server
  const selectExhibition = (event) => {
      let { exhibition } = event.target.dataset
      if (ws) {
        ws.once('disConnection', () => {
          ws.close()
          setWs(webSocket(`wss://utexpo.cacdidemo.com/${exhibition}`))
          setExhibition(exhibition)
        })
        ws.emit('disConnection')
      } else {
          setWs(webSocket(`wss://utexpo.cacdidemo.com/${exhibition}`))
          setExhibition(exhibition)
      }
  }

  //點擊攤位時觸發，將攤位 id 送給 Server
  const selectBooth = (event) => {
      let { booth } = event.target.dataset
      ws.emit('addRoom', booth)
  }

  const initWebSocket = () => {
    ws.on('updateHotmap', data => {
      const newHotmap = {
        ...booths[exhibition],
        ...data
      }
      console.log(JSON.stringify(newHotmap))
      setHotmap(newHotmap)
    })
  }

  const navigateToTest = () => {
    navigate('/test');
  }

  useEffect(() => {
    if (ws) {
      // 設定監聽
      initWebSocket()
    }
  }, [ws])

  return (
    <div className="App">
        <div className="ChannelHeader">
          <div>{`${exhibition}大廳公告`}</div>
        </div>
        <main>
          <div className="Sidebar">
            {exhibitions.map(exhibition => (
              <div
                className="Exhibition"
                onClick={selectExhibition}
                data-exhibition={exhibition}
                key={exhibition}
              >{exhibition}</div>
            ))}
          </div>
          <div className="Hotmap">
            {!!Object.keys(hotmap).length && Object.keys(hotmap).map(booth => (
              <div
                key={booth}
                data-booth={booth}
                onClick={selectBooth}
              >{`${booth} ${hotmap[booth]}`}</div>
            ))}
          </div>
        </main>
        <button onClick={navigateToTest}>前往測試 socket 負載</button>
    </div>
  );
}

export default App;

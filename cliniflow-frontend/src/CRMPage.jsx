import React, { useState, useRef, useEffect } from "react";

// SVG ícones para redes sociais
const channelIcons = {
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="25" fill="#25D366"/>
      <path d="M37.5,26.6c-0.7-0.3-4-2-4.6-2.2c-0.6-0.2-1-0.3-1.4,0.3c-0.4,0.6-1.6,2.2-2,2.7c-0.4,0.4-0.7,0.5-1.3,0.2
      c-0.7-0.3-3-1.1-5.7-3.5c-2.1-1.9-3.5-4.3-3.9-5c-0.4-0.6,0-1,0.3-1.3c0.3-0.3,0.6-0.7,0.9-1.1c0.3-0.4,0.1-0.8,0-1.1
      c-0.2-0.4-1.4-3.3-1.9-4.5c-0.5-1.2-1-1-1.4-1c-0.4,0-0.8,0-1.3,0c-0.5,0-1.3,0.2-2,1c-0.7,0.8-2.7,2.6-2.7,6.3
      c0,3.6,2.8,7.1,3.2,7.6c0.4,0.5,5.6,8.6,13.7,10.6c1.9,0.5,3.3,0.8,4.4,0.5c1.3-0.3,4.1-1.7,4.7-3.4c0.6-1.7,0.6-3.3,0.4-3.6
      C38.5,26.9,38.2,26.8,37.5,26.6z" fill="#fff"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="25" fill="#E1306C"/>
      <g>
        <rect x="14" y="14" width="22" height="22" rx="7" fill="none" stroke="#fff" strokeWidth="2"/>
        <circle cx="25" cy="25" r="6" fill="none" stroke="#fff" strokeWidth="2"/>
        <circle cx="33.2" cy="16.8" r="1.3" fill="#fff"/>
      </g>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="25" fill="#1877F3"/>
      <path d="M33 27h-5v10h-5V27h-3v-4h3v-2.6C23 17.3 24.2 16 26.7 16H33v4h-3.3c-0.5 0-0.7 0.2-0.7 0.7V23h4l-1 4z" fill="#fff"/>
    </svg>
  )
};

const sidebarItems = [
  { label: "Chats", icon: "💬", sub: ["Novos clientes", "Todos os atendimentos"] },
  { label: "Agenda", icon: "📅" },
  { label: "Contatos", icon: "👥" },
  { label: "Painel", icon: "📊" },
  { label: "Configurações", icon: "⚙️", sub: ["Conectar WhatsApp"] }
];

const quickRepliesMock = [
  "Olá! Como posso ajudar?",
  "Estamos analisando sua solicitação.",
  "Seu atendimento foi encaminhado ao setor responsável.",
  "Agradecemos o contato!"
];

// Mock inicial (apenas exemplo, real será construído do WhatsApp)
const mockChatsInit = [
  {
    id: 1,
    name: "João Cliente",
    lastMessage: "Olá, gostaria de agendar uma consulta.",
    channel: "whatsapp",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    remoteJid: "11999990001@s.whatsapp.net",
    ficha: {
      nome: "João Cliente",
      numero: "(11) 99999-0001",
      email: "joao@exemplo.com",
      observacoes: "Prefere contato por WhatsApp"
    }
  }
];

const hoverAudio = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYwAAACAgICAgA==";
const clickAudio = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYwAAACAgICAgA==";

// Simple helper to format dates (YYYY-MM-DD)
function formatDate(dt) {
  return dt.toISOString().slice(0, 10);
}

// Simple helper to get time as HH:MM
function formatTime(dt) {
  return dt.toTimeString().slice(0, 5);
}

// Agenda event colors
const agendaTypeColors = {
  Consulta: "#1976d2",
  Retorno: "#43a047",
  Lembrete: "#ffb300",
  Outro: "#b71c1c"
};

export default function CRMPage() {
  // ======= CRM States =======
  const [showWhatsAppQR, setShowWhatsAppQR] = useState(false);
  const [whatsAppQR, setWhatsAppQR] = useState("");
  const [ws, setWs] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [chats, setChats] = useState([...mockChatsInit]);
  const [selectedChat, setSelectedChat] = useState(mockChatsInit[0]);
  const [search, setSearch] = useState("");
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);
  const [allMessages, setAllMessages] = useState({
    1: [{ from: "them", text: mockChatsInit[0].lastMessage, status: "seen" }]
  });
  const [message, setMessage] = useState("");
  const messages = allMessages[selectedChat.id] || [];
  const [recording, setRecording] = useState(false);
  const [showFicha, setShowFicha] = useState(false);
  const [ficha, setFicha] = useState({ ...mockChatsInit[0].ficha });

  // ======= Agenda States =======
  const [showAgenda, setShowAgenda] = useState(false);
  const [agendaViewMode, setAgendaViewMode] = useState("month"); // "month", "day"
  const [agendaDate, setAgendaDate] = useState(formatDate(new Date()));
  const [agendaEvents, setAgendaEvents] = useState([]); // [{id, date, hour, type, clientName, clientNumber, notes}]
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventModalData, setEventModalData] = useState(null); // {date, hour, type, clientName, clientNumber, notes}
  const [miniDate, setMiniDate] = useState(formatDate(new Date()));
  const [miniHour, setMiniHour] = useState("09:00");
  const [miniType, setMiniType] = useState("Consulta");
  const [miniNotes, setMiniNotes] = useState("");
  const [showMiniModal, setShowMiniModal] = useState(false);

  // Audio refs
  const hoverRef = useRef();
  const clickRef = useRef();

  // ======= CRM/WebSocket e Chat =======
  function handleOpenWhatsAppQR() {
    setShowWhatsAppQR(true);
    if (!ws) {
      const socket = new window.WebSocket("ws://localhost:3001");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.qr) setWhatsAppQR(data.qr);

        if (data.status === "connected") {
          setWhatsAppQR("");
          setShowWhatsAppQR(false);
          window.alert(data.message || "Whatsapp conectado com sucesso");
        }
        if (data.status === "error") {
          setWhatsAppQR("");
          setShowWhatsAppQR(false);
          window.alert(data.message || "Erro ao conectar QR Code");
        }

        // Mensagem recebida do WhatsApp
        if (data.type === "message" && data.message) {
          const { from, text, name, avatar, id, status, timestamp } = data.message;
          let chat = chats.find(c => c.remoteJid === from);
          let chatId;
          if (!chat) {
            const newId = Math.max(0, ...chats.map(c => c.id)) + 1;
            chat = {
              id: newId,
              name: name || from,
              lastMessage: text,
              channel: "whatsapp",
              avatar: avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${Math.random()}`,
              remoteJid: from,
              ficha: { nome: name || from, numero: from, email: "", observacoes: "" }
            };
            setChats(prev => [...prev, chat]);
            chatId = newId;
          } else {
            chatId = chat.id;
            setChats(prev => prev.map(c =>
              c.remoteJid === from ? {
                ...c,
                lastMessage: text,
                avatar: avatar || c.avatar,
                name: name || c.name
              } : c
            ));
          }
          setAllMessages(msgs => ({
            ...msgs,
            [chatId]: [
              ...(msgs[chatId] || []),
              { from: "them", text, id, status, timestamp }
            ]
          }));
        }

        // Confirmação de mensagem enviada
        if (data.type === "sent-message" && data.message) {
          const { from, text, id, status, timestamp, name, avatar } = data.message;
          const chat = chats.find(c => c.remoteJid === from);
          if (!chat) return;
          setAllMessages(msgs => {
            const prevMsgs = msgs[chat.id] || [];
            let newMsgs = prevMsgs.filter(m => !(m.from === "me" && !m.id && m.text === text));
            newMsgs = [
              ...newMsgs,
              { from: "me", text, id, status, timestamp }
            ];
            return {
              ...msgs,
              [chat.id]: newMsgs
            };
          });
          setChats(prev => prev.map(c =>
            c.remoteJid === from
              ? { ...c, lastMessage: text, avatar: avatar || c.avatar, name: name || c.name }
              : c
          ));
        }

        // Status de visualização
        if (data.type === "seen" && data.id) {
          setAllMessages(msgs => {
            const copy = { ...msgs };
            Object.keys(copy).forEach(chatId => {
              copy[chatId] = copy[chatId].map(m =>
                m.id === data.id ? { ...m, status: "seen" } : m
              );
            });
            return copy;
          });
        }
      };
      socket.onclose = () => setWs(null);
      setWs(socket);
    }
  }

  function handleSelectChat(chat) {
    setSelectedChat(chat);
    setFicha({ ...chat.ficha });
    setShowFicha(false);
    setShowAgenda(false);
  }

  function handleSendMessage() {
    if (message.trim() === "" || !ws) return;
    if (!selectedChat.remoteJid) {
      window.alert("Selecione um chat válido do WhatsApp.");
      return;
    }
    const tmpMsg = {
      from: "me",
      text: message,
      id: undefined,
      status: "sending"
    };
    setAllMessages(msgs => ({
      ...msgs,
      [selectedChat.id]: [
        ...(msgs[selectedChat.id] || []),
        tmpMsg
      ]
    }));
    setChats(prev =>
      prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, lastMessage: message }
          : c
      )
    );
    ws.send(JSON.stringify({
      type: "send-message",
      to: selectedChat.remoteJid,
      text: message
    }));
    setMessage("");
  }

  function handleQuickReply(text) {
    setMessage(text);
    setQuickRepliesOpen(false);
  }

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(search.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  function playHover() {
    if (hoverRef.current) {
      try {
        hoverRef.current.currentTime = 0;
        hoverRef.current.volume = 0.25;
        hoverRef.current.play();
      } catch (e) {}
    }
  }
  function playClick() {
    if (clickRef.current) {
      try {
        clickRef.current.currentTime = 0;
        clickRef.current.volume = 0.25;
        clickRef.current.play();
      } catch (e) {}
    }
  }
  function handleFichaChange(e) {
    const { name, value } = e.target;
    setFicha((f) => ({ ...f, [name]: value }));
    setChats(cs => cs.map(c =>
      c.id === selectedChat.id
        ? { ...c, ficha: { ...c.ficha, [name]: value } }
        : c
    ));
  }

  // ======= Agenda core =======
  function goToAgenda() {
    setShowAgenda(true);
    setShowFicha(false);
    setTimeout(() => {
      const agendaDiv = document.getElementById("crm-agenda-main");
      if (agendaDiv) agendaDiv.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
  function handleAgendaViewMode(mode) {
    setAgendaViewMode(mode);
  }
  function handleAgendaDaySelect(date) {
    setAgendaDate(date);
    setAgendaViewMode("day");
  }
  // Agenda interaction: add event
  function handleAgendaSlotClick(date, hour) {
    setEventModalData({
      date,
      hour,
      type: "Consulta",
      clientName: "",
      clientNumber: "",
      notes: ""
    });
    setShowEventModal(true);
  }
  // Save event from modal
  function handleEventModalSave(data) {
    setAgendaEvents(evts => [
      ...evts,
      {
        ...data,
        id: Date.now(),
        date: data.date,
        hour: data.hour
      }
    ]);
    setShowEventModal(false);
  }
  // Delete event
  function handleEventDelete(id) {
    setAgendaEvents(evts => evts.filter(e => e.id !== id));
    setShowEventModal(false);
  }
  // Mini agenda do cadastro do cliente
  function handleMiniAgendaSave() {
    setAgendaEvents(evts => [
      ...evts,
      {
        id: Date.now(),
        date: miniDate,
        hour: miniHour,
        type: miniType,
        clientName: ficha.nome,
        clientNumber: ficha.numero,
        notes: miniNotes
      }
    ]);
    setShowMiniModal(false);
  }

  // Sincroniza mini agenda ao trocar cliente
  useEffect(() => {
    setMiniDate(formatDate(new Date()));
    setMiniHour("09:00");
    setMiniType("Consulta");
    setMiniNotes("");
  }, [selectedChat.id]);

  // ======= Calendar helpers =======
  // Gera matriz de dias do mês para visualização mensal
  function getMonthMatrix(year, month) {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let matrix = [];
    let week = [];
    let day = 1 - firstWeekday;
    for (let w = 0; w < 6; w++) {
      week = [];
      for (let d = 0; d < 7; d++, day++) {
        if (day > 0 && day <= daysInMonth) {
          week.push(day);
        } else {
          week.push(null);
        }
      }
      matrix.push(week);
    }
    return matrix;
  }

  function agendaEventsForDay(date) {
    return agendaEvents.filter(e => e.date === date);
  }

  function agendaEventsForMonth(year, month) {
    return agendaEvents.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  // ======= Render =======
  return (
    <div style={{
      minHeight: "100vh",
      height: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
      fontFamily: "'Montserrat', Inter, Roboto, Arial, sans-serif"
    }}>
      {/* Sons */}
      <audio ref={hoverRef} src={hoverAudio} />
      <audio ref={clickRef} src={clickAudio} />

      {/* Sidebar */}
      <div
        className={`crm-sidebar${sidebarOpen ? " open" : ""}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => { setSidebarOpen(false); setOpenSubmenu(null); }}
      >
        <div className="crm-sidebar-inner">
          {sidebarItems.map((item, idx) => (
            <React.Fragment key={item.label}>
              <div
                className={`sidebar-item${openSubmenu === idx ? " hovered" : ""}`}
                onClick={() => {
                  setOpenSubmenu(openSubmenu === idx ? null : idx);
                  playClick();
                  if (item.label === "Agenda") goToAgenda();
                }}
                onMouseEnter={playHover}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </div>
              {sidebarOpen && item.sub && openSubmenu === idx && (
                <div className="sidebar-submenu">
                  {item.sub.map(subitem => (
                    <div
                      className="sidebar-subitem"
                      key={subitem}
                      onClick={() => {
                        playClick();
                        if (item.label === "Configurações" && subitem === "Conectar WhatsApp") {
                          handleOpenWhatsAppQR();
                        }
                      }}
                      onMouseEnter={playHover}
                    >
                      {subitem}
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Lista de chats */}
      <div style={{
        width: 320,
        background: "#f7faff",
        borderRight: "1.5px solid #e3eaf5",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{
          padding: "22px 18px 10px 18px",
          borderBottom: "1.5px solid #e3eaf5",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <input
            type="text"
            placeholder="Pesquisar conversas"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              borderRadius: 8,
              border: "1.5px solid #e3eaf5",
              padding: "9px 13px",
              fontSize: 15,
              background: "#f4f8fb",
              outline: "none",
              transition: "border .2s",
              boxShadow: "0 1px 2px #1976d203"
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredChats.length === 0 && (
            <div style={{ color: "#888", textAlign: "center", marginTop: 32 }}>
              Nenhuma conversa encontrada
            </div>
          )}
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item${selectedChat.id === chat.id ? " selected" : ""}`}
              onClick={() => handleSelectChat(chat)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "16px 18px",
                cursor: "pointer",
                background: selectedChat.id === chat.id ? "#e3f1fd" : "",
                borderBottom: "1.5px solid #e3eaf5",
                transition: "background .2s"
              }}
            >
              <img src={chat.avatar} alt={chat.name} style={{
                width: 42, height: 42, borderRadius: "50%", objectFit: "cover",
                border: "2px solid #42a5f5"
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 700, color: "#1976d2", letterSpacing: 0.2,
                  fontSize: 15
                }}>{chat.name}</div>
                <div style={{
                  color: "#444", fontSize: 13, maxWidth: 175,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>{chat.lastMessage}</div>
              </div>
              <span style={{ marginLeft: 4 }}>
                {channelIcons[chat.channel]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Janela de interação + agenda */}
      <div style={{ flex: 1, background: "#fafdff", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* AGENDA principal */}
        {showAgenda && (
          <div id="crm-agenda-main" style={{ minHeight: 0, flex: 1, background: "#fafdff", padding: 0, margin: 0, overflow: "auto" }}>
            <AgendaView
              viewMode={agendaViewMode}
              setViewMode={handleAgendaViewMode}
              date={agendaDate}
              setDate={setAgendaDate}
              events={agendaEvents}
              onSlotClick={handleAgendaSlotClick}
              onEventClick={evt => { setEventModalData(evt); setShowEventModal(true); }}
              onDaySelect={handleAgendaDaySelect}
              agendaTypeColors={agendaTypeColors}
            />
            {/* Modal para adicionar/editar evento na agenda */}
            {showEventModal && (
              <EventModal
                data={eventModalData}
                onClose={() => setShowEventModal(false)}
                onSave={handleEventModalSave}
                onDelete={handleEventDelete}
              />
            )}
          </div>
        )}

        {/* Chat header */}
        {!showAgenda && (
          <div style={{
            background: "#fff",
            borderBottom: "1.5px solid #e3eaf5",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16
          }}>
            <img src={selectedChat.avatar} alt={selectedChat.name} style={{
              width: 44, height: 44, borderRadius: "50%", objectFit: "cover",
              border: "2px solid #1976d2"
            }} />
            <div>
              <div style={{
                fontWeight: 700, color: "#1976d2", fontSize: 17, letterSpacing: 0.2
              }}>{selectedChat.name}</div>
            </div>
            <span style={{ marginLeft: 10 }}>
              {channelIcons[selectedChat.channel]}
            </span>
            <button
              onClick={() => setShowFicha(f => !f)}
              style={{
                marginLeft: 18,
                background: "#f1f6fb",
                border: "none",
                borderRadius: 7,
                padding: "6px 13px",
                cursor: "pointer",
                fontSize: 15,
                color: "#1976d2",
                fontWeight: 600,
                boxShadow: "0 1.5px 4px #1976d215",
                transition: "background .15s"
              }}
              title="Abrir ficha de cadastro"
            >
              Cadastro
            </button>
            {/* Mini agenda ao lado do cadastro */}
            <button
              style={{
                marginLeft: 8,
                background: "#e3f1fd",
                border: "none",
                borderRadius: 7,
                padding: "6px 13px",
                cursor: "pointer",
                fontSize: 15,
                color: "#1976d2",
                fontWeight: 600,
                boxShadow: "0 1.5px 4px #1976d215",
                transition: "background .15s"
              }}
              onClick={() => setShowMiniModal(true)}
              title="Adicionar agendamento rápido para este cliente"
            >+ Agendar</button>
            <input
              type="date"
              style={{
                marginLeft: 10,
                border: "1.5px solid #e3eaf5",
                borderRadius: 7,
                padding: "6px 10px",
                fontSize: 15,
                background: "#f4f8fb",
                color: "#1976d2"
              }}
              value={miniDate}
              onChange={e => setMiniDate(e.target.value)}
              title="Selecionar data rápida"
            />
          </div>
        )}

        {/* Ficha de cadastro */}
        {!showAgenda && showFicha && (
          <div className="ficha-modal">
            <div className="ficha-content">
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14
              }}>
                <h2 style={{ color: "#1976d2", fontSize: 20, fontWeight: 700, margin: 0 }}>
                  Ficha do Cliente
                </h2>
                <button
                  onClick={() => setShowFicha(false)}
                  style={{
                    border: "none", background: "none",
                    fontSize: 24, color: "#1976d2", cursor: "pointer"
                  }}
                  title="Fechar"
                >×</button>
              </div>
              <form style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <label>
                  Nome:
                  <input
                    name="nome"
                    value={ficha.nome}
                    onChange={handleFichaChange}
                    style={{ marginLeft: 4, borderRadius: 5, border: "1.5px solid #e3eaf5", padding: 7, fontSize: 15, width: "95%" }}
                  />
                </label>
                <label>
                  Número:
                  <input
                    name="numero"
                    value={ficha.numero}
                    onChange={handleFichaChange}
                    style={{ marginLeft: 4, borderRadius: 5, border: "1.5px solid #e3eaf5", padding: 7, fontSize: 15, width: "95%" }}
                  />
                </label>
                <label>
                  E-mail:
                  <input
                    name="email"
                    value={ficha.email}
                    onChange={handleFichaChange}
                    style={{ marginLeft: 4, borderRadius: 5, border: "1.5px solid #e3eaf5", padding: 7, fontSize: 15, width: "95%" }}
                  />
                </label>
                <label>
                  Observações:
                  <textarea
                    name="observacoes"
                    value={ficha.observacoes}
                    onChange={handleFichaChange}
                    style={{ marginLeft: 4, borderRadius: 5, border: "1.5px solid #e3eaf5", padding: 7, fontSize: 15, width: "95%", minHeight: 55, resize: "vertical" }}
                  />
                </label>
              </form>
            </div>
          </div>
        )}

        {/* Mini modal para agendar do cadastro */}
        {showMiniModal && (
          <EventModal
            data={{
              date: miniDate,
              hour: miniHour,
              type: miniType,
              clientName: ficha.nome,
              clientNumber: ficha.numero,
              notes: miniNotes
            }}
            onClose={() => setShowMiniModal(false)}
            onSave={d => { setMiniDate(d.date); setMiniHour(d.hour); setMiniType(d.type); setMiniNotes(d.notes); handleMiniAgendaSave(); }}
            isMini
          />
        )}

        {/* Corpo do chat */}
        {!showAgenda && (
          <div style={{
            flex: 1,
            padding: "32px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.from === "me" ? "flex-end" : "flex-start",
                  background: msg.from === "me"
                    ? "linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)"
                    : "#e3f1fd",
                  color: msg.from === "me" ? "#fff" : "#1976d2",
                  borderRadius: 13,
                  padding: "11px 16px",
                  fontSize: 15,
                  boxShadow: msg.from === "me"
                    ? "0 2px 8px #1976d222"
                    : "0 1px 3px #1976d211",
                  maxWidth: "70%",
                  marginBottom: 2,
                  position: "relative"
                }}
              >
                {msg.text}
                {msg.from === "me" && (
                  <span style={{ marginLeft: 8, fontSize: 14 }}>
                    {msg.status === "seen"
                      ? <span title="Visualizada" style={{ color: "#42a5f5" }}>✓✓</span>
                      : msg.status === "sent"
                        ? <span title="Enviada">✓</span>
                        : msg.status === "received"
                          ? <span title="Recebida">✓✓</span>
                          : msg.status === "sending"
                            ? <span title="Enviando..." style={{ color: "#aaa" }}>...</span>
                            : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Box de digitação */}
        {!showAgenda && (
          <div style={{
            padding: "14px 19px",
            borderTop: "1.5px solid #e3eaf5",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative"
          }}>
            <button
              type="button"
              onClick={() => setQuickRepliesOpen(!quickRepliesOpen)}
              style={{
                background: "#f1f6fb",
                border: "none",
                borderRadius: 7,
                padding: "6px 9px",
                cursor: "pointer",
                fontSize: 18,
                marginRight: 3,
                color: "#1976d2",
                boxShadow: "0 1.5px 4px #1976d215"
              }}
              title="Respostas rápidas"
            >
              <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
                <path d="M2 10c0-3.6 2.9-6.5 6.5-6.5h3A6.5 6.5 0 0120 10v0a6.5 6.5 0 01-6.5 6.5h-3A6.5 6.5 0 012 10Z" fill="#42a5f5"/>
                <path d="M7 10h6M10 7v6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {quickRepliesOpen && (
              <div className="quick-reply-dropdown">
                {quickRepliesMock.map(qr => (
                  <div
                    key={qr}
                    className="quick-reply-item"
                    onClick={() => handleQuickReply(qr)}
                  >{qr}</div>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSendMessage();
              }}
              style={{
                flex: 1,
                borderRadius: 8,
                border: "1.5px solid #e3eaf5",
                padding: "11px 13px",
                fontSize: 15,
                background: "#f4f8fb",
                outline: "none"
              }}
            />
            <button
              type="button"
              onClick={() => setRecording(r => !r)}
              style={{
                background: recording ? "#1976d2" : "#f1f6fb",
                border: "none",
                borderRadius: "50%",
                padding: 7,
                marginLeft: 2,
                cursor: "pointer",
                fontSize: 18,
                color: recording ? "#fff" : "#1976d2",
                boxShadow: "0 1.5px 4px #1976d215",
                transition: "background .15s"
              }}
              title={recording ? "Gravando..." : "Gravar áudio"}
            >
              <svg width="21" height="21" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9.5" stroke={recording ? "#fff" : "#42a5f5"} strokeWidth="2"/>
                <rect x="7.5" y="5.5" width="7" height="11" rx="3.5"
                  fill={recording ? "#fff" : "#1976d2"} />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              style={{
                background: "linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)",
                border: "none",
                borderRadius: 8,
                padding: "9px 17px",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15.5,
                marginLeft: 1,
                cursor: message.trim() ? "pointer" : "not-allowed",
                boxShadow: "0 1.5px 4px #1976d215",
                opacity: message.trim() ? 1 : 0.6,
                transition: "opacity .2s"
              }}
              title="Enviar"
            >Enviar</button>
          </div>
        )}
      </div>

      {/* Modal do QR do WhatsApp */}
      {showWhatsAppQR && (
        <div className="whatsapp-qr-modal">
          <div className="whatsapp-qr-content">
            <h2>Conectar WhatsApp</h2>
            <p>Escaneie o QR code abaixo com o WhatsApp (Menu &gt; Aparelhos conectados &gt; Conectar um aparelho):</p>
            {whatsAppQR
              ? <img src={whatsAppQR} alt="QR Code WhatsApp" style={{ width: 240, height: 240 }} />
              : <div>Carregando QR code...</div>
            }
            <button
              onClick={() => setShowWhatsAppQR(false)}
              style={{
                marginTop: 20,
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer"
              }}
            >Fechar</button>
          </div>
          <style>
            {`
            .whatsapp-qr-modal {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(25, 118, 210, 0.08);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .whatsapp-qr-content {
              background: #fff;
              border-radius: 18px;
              padding: 32px 36px;
              box-shadow: 0 8px 32px #1976d233;
              display: flex;
              flex-direction: column;
              align-items: center;
              min-width: 320px;
            }
            `}
          </style>
        </div>
      )}

      {/* === STYLE DO COMPONENTE === */}
      <style>
        {`
          .crm-sidebar {
            width: 58px;
            background: #1976d2;
            color: #fff;
            transition: width .24s cubic-bezier(.42,0,.58,1);
            box-shadow: 2px 0 12px #1976d226;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            z-index: 2;
            position: relative;
          }
          .crm-sidebar.open {
            width: 240px;
          }
          .crm-sidebar-inner {
            padding-top: 30px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .sidebar-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 10px 18px;
            border-radius: 9px 0 0 9px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            transition: background .18s, color .18s;
            opacity: 0.88;
            position: relative;
            min-height: 38px;
          }
          .sidebar-item:hover, .sidebar-item.hovered {
            background: #42a5f5;
            color: #1976d2;
            opacity: 1;
          }
          .sidebar-icon {
            font-size: 1.4em;
            margin-right: 0px;
            transition: margin-right .2s;
          }
          .crm-sidebar:not(.open) .sidebar-label {
            display: none;
          }
          .crm-sidebar.open .sidebar-label {
            display: inline;
          }
          .sidebar-submenu {
            min-width: 145px;
            background: #fff;
            color: #1976d2;
            padding: 8px 0 4px 35px;
            animation: fadeInSub .25s;
            display: flex;
            flex-direction: column;
            gap: 2px;
            border-left: 2px solid #e3eaf5;
            border-radius: 0 0 10px 10px;
            margin-bottom: 4px;
            transition: max-height 0.25s cubic-bezier(.4,0,.2,1), opacity 0.18s;
            overflow: hidden;
            max-height: 300px;
            opacity: 1;
          }
          .sidebar-submenu.closed {
            max-height: 0;
            opacity: 0;
            pointer-events: none;
            padding: 0 0 0 35px;
            margin-bottom: 0;
          }
          @keyframes fadeInSub {
            from { opacity: 0; transform: translateY(14px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .sidebar-subitem {
            padding: 7px 18px 7px 35px;
            font-size: 15px;
            font-weight: 600;
            color: #1976d2;
            border-radius: 8px;
            cursor: pointer;
            transition: background .15s;
            margin-bottom: 2px;
          }
          .sidebar-subitem:hover {
            background: #e3f1fd;
          }
          .chat-item.selected {
            background: #e3f1fd !important;
          }
          .chat-item:hover {
            background: #f1f8fe;
          }
          .quick-reply-dropdown {
            position: absolute;
            bottom: 54px;
            left: 45px;
            background: #fff;
            box-shadow: 0 4px 32px #1976d233;
            border-radius: 12px;
            padding: 7px 0;
            min-width: 260px;
            z-index: 5;
            animation: fadeInQuick .26s;
          }
          @keyframes fadeInQuick {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .quick-reply-item {
            padding: 9px 18px;
            font-size: 15px;
            color: #1976d2;
            font-weight: 600;
            cursor: pointer;
            border-radius: 7px;
            transition: background .12s;
          }
          .quick-reply-item:hover {
            background: #f3f7fd;
          }
          .ficha-modal {
            position: absolute;
            top: 64px;
            right: 54px;
            z-index: 50;
            background: rgba(33, 150, 243, 0.04);
            width: 390px;
            animation: fadeInFicha .24s;
          }
          @keyframes fadeInFicha {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .ficha-content {
            background: #fff;
            border-radius: 17px;
            box-shadow: 0 6px 32px #1976d233;
            padding: 26px 24px 18px 24px;
            min-width: 300px;
          }
          .ficha-content label {
            font-size: 15px;
            color: #1976d2;
            font-weight: 600;
            margin-bottom: 3px;
            display: flex;
            align-items: center;
          }
          .ficha-content input,
          .ficha-content textarea {
            margin-top: 2px;
            border: 1.1px solid #e3eaf5;
            font-family: inherit;
          }

          /* ==== Agenda Styles ==== */
          .agenda-table {
            border-collapse: collapse;
            width: 100%;
            background: #fff;
            margin: 0 auto;
          }
          .agenda-table th, .agenda-table td {
            border: 1px solid #e3eaf5;
            text-align: center;
            height: 36px;
            padding: 0 4px;
          }
          .agenda-table th {
            background: #f4f8fb;
            color: #1976d2;
            font-weight: 700;
          }
          .agenda-cell-today {
            background: #e3f1fd !important;
            border: 2px solid #1976d2 !important;
          }
          .agenda-event {
            background: #1976d2;
            color: #fff;
            border-radius: 7px;
            padding: 3px 7px;
            font-size: 13px;
            margin: 2px 0;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
          }
          .agenda-event:hover {
            opacity: 0.85;
          }
          .agenda-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 20px 10px 20px;
            background: #f7faff;
          }
          .agenda-toolbar .crm-btn {
            background: #1976d2;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            font-weight: 700;
            font-size: 14.5px;
            cursor: pointer;
            margin-right: 8px;
            box-shadow: 0 1.5px 4px #1976d215;
            transition: background .15s;
          }
          .agenda-toolbar .crm-btn.selected {
            background: #43a047;
          }
          .agenda-toolbar .crm-btn:last-child {
            margin-right: 0;
          }
        `}
      </style>
    </div>
  );
}

// ================== COMPONENTES AUXILIARES ==================

// Agenda principal (mensal/dia)
function AgendaView({ viewMode, setViewMode, date, setDate, events, onSlotClick, onEventClick, onDaySelect, agendaTypeColors }) {
  const dt = new Date(date);
  const today = formatDate(new Date());
  const year = dt.getFullYear();
  const month = dt.getMonth();
  const matrix = getMonthMatrix(year, month);

  function handlePrev() {
    if (viewMode === "month") {
      const prev = new Date(year, month - 1, 1);
      setDate(formatDate(prev));
    } else {
      const prev = new Date(date);
      prev.setDate(prev.getDate() - 1);
      setDate(formatDate(prev));
    }
  }
  function handleNext() {
    if (viewMode === "month") {
      const next = new Date(year, month + 1, 1);
      setDate(formatDate(next));
    } else {
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      setDate(formatDate(next));
    }
  }
  function handleToday() {
    setDate(formatDate(new Date()));
  }

  // Horários padrão para visualização diária
  const hours = [];
  for (let h = 8; h < 21; h++) {
    hours.push(h.toString().padStart(2, "0") + ":00");
    hours.push(h.toString().padStart(2, "0") + ":30");
  }

  return (
    <div style={{ background: "#fff", minHeight: 450, borderRadius: 10, margin: 22, boxShadow: "0 6px 24px #1976d233" }}>
      <div className="agenda-toolbar">
        <div>
          <button className={`crm-btn${viewMode === "month" ? " selected" : ""}`} onClick={() => setViewMode("month")}>Mês</button>
          <button className={`crm-btn${viewMode === "day" ? " selected" : ""}`} onClick={() => setViewMode("day")}>Dia</button>
          <button className="crm-btn" onClick={handleToday}>Hoje</button>
        </div>
        <div>
          <button className="crm-btn" onClick={handlePrev}>&lt;</button>
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 17, margin: "0 10px" }}>
            {viewMode === "month"
              ? `${dt.toLocaleString('default', { month: 'long' })} ${year}`
              : dt.toLocaleDateString()}
          </span>
          <button className="crm-btn" onClick={handleNext}>&gt;</button>
        </div>
      </div>

      {viewMode === "month" && (
        <table className="agenda-table">
          <thead>
            <tr>
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  let cellDate = null;
                  if (day) {
                    cellDate = formatDate(new Date(year, month, day));
                  }
                  const isToday = cellDate === today;
                  const dayEvents = events.filter(e => e.date === cellDate);
                  return (
                    <td
                      key={di}
                      className={isToday ? "agenda-cell-today" : ""}
                      style={{ cursor: cellDate ? "pointer" : "default", position: "relative" }}
                      onClick={() => cellDate && onDaySelect(cellDate)}
                    >
                      {day ? <span style={{ fontWeight: isToday ? 700 : 500 }}>{day}</span> : ""}
                      <div style={{ width: "100%", minHeight: 10 }}>
                        {dayEvents.slice(0, 2).map(evt => (
                          <span
                            className="agenda-event"
                            key={evt.id}
                            title={`${evt.hour} ${evt.clientName || ""} - ${evt.type}`}
                            style={{
                              background: agendaTypeColors[evt.type] || "#1976d2",
                              marginTop: 2,
                              marginBottom: 2
                            }}
                            onClick={e => { e.stopPropagation(); onEventClick(evt); }}
                          >
                            {evt.hour} {evt.clientName} ({evt.type})
                          </span>
                        ))}
                        {dayEvents.length > 2 && (
                          <span style={{ color: "#888", fontSize: 11 }}>+{dayEvents.length - 2} mais</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {viewMode === "day" && (
        <table className="agenda-table">
          <thead>
            <tr><th style={{ width: 90 }}>Horário</th><th>Agendados</th></tr>
          </thead>
          <tbody>
            {hours.map(h => {
              const slotEvents = events.filter(e => e.date === date && e.hour === h);
              return (
                <tr key={h}>
                  <td>{h}</td>
                  <td style={{ textAlign: "left", position: "relative" }}>
                    {slotEvents.length === 0 ? (
                      <span
                        style={{ color: "#aaa", fontSize: 13, cursor: "pointer" }}
                        onClick={() => onSlotClick(date, h)}
                      >+ Marcar</span>
                    ) : slotEvents.map(evt => (
                      <span
                        className="agenda-event"
                        key={evt.id}
                        title={`${evt.hour} ${evt.clientName || ""} - ${evt.type}\n${evt.notes || ""}`}
                        style={{
                          background: agendaTypeColors[evt.type] || "#1976d2",
                          marginRight: 7
                        }}
                        onClick={() => onEventClick(evt)}
                      >
                        {evt.clientName} ({evt.type})
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Modal para criar/editar evento agenda
function EventModal({ data, onClose, onSave, onDelete, isMini }) {
  const [date, setDate] = useState(data.date || formatDate(new Date()));
  const [hour, setHour] = useState(data.hour || "09:00");
  const [type, setType] = useState(data.type || "Consulta");
  const [clientName, setClientName] = useState(data.clientName || "");
  const [clientNumber, setClientNumber] = useState(data.clientNumber || "");
  const [notes, setNotes] = useState(data.notes || "");

  function handleSave() {
    if (!date || !hour || !type) return;
    onSave({ date, hour, type, clientName, clientNumber, notes });
  }
  function handleDelete() {
    if (onDelete && data.id) onDelete(data.id);
    onClose();
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(25, 118, 210, 0.14)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1001
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, padding: 30, minWidth: 320, boxShadow: "0 8px 32px #1976d233", maxWidth: 420
      }}>
        <h3 style={{ color: "#1976d2", margin: "0 0 18px 0", fontSize: 21 }}>{data.id ? "Editar Agendamento" : "Novo Agendamento"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <label>
            Data:
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginLeft: 8 }} />
          </label>
          <label>
            Horário:
            <input type="time" value={hour} onChange={e => setHour(e.target.value)} style={{ marginLeft: 8 }} />
          </label>
          <label>
            Tipo:
            <select value={type} onChange={e => setType(e.target.value)} style={{ marginLeft: 8 }}>
              <option>Consulta</option>
              <option>Retorno</option>
              <option>Lembrete</option>
              <option>Outro</option>
            </select>
          </label>
          <label>
            Cliente:
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} style={{ marginLeft: 8 }} />
          </label>
          <label>
            Número:
            <input type="text" value={clientNumber} onChange={e => setClientNumber(e.target.value)} style={{ marginLeft: 8 }} />
          </label>
          <label>
            Sobre:
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ marginLeft: 8, minWidth: 170 }} />
          </label>
        </div>
        <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#eee", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Cancelar</button>
          {onDelete &&
            <button onClick={handleDelete} style={{ background: "#b71c1c", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Excluir</button>
          }
          <button onClick={handleSave} style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// =========== Calendar utils ===========
// Gera matriz de dias do mês para visualização mensal
function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let matrix = [];
  let week = [];
  let day = 1 - firstWeekday;
  for (let w = 0; w < 6; w++) {
    week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day > 0 && day <= daysInMonth) {
        week.push(day);
      } else {
        week.push(null);
      }
    }
    matrix.push(week);
  }
  return matrix;
}
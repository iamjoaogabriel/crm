import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./logo.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find(u => u.email === username && u.password === password);
    if (found) {
      setSuccessMsg(`Login realizado com sucesso, bem-vindo ${found.name}!`);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/crm"); // redireciona para CRM
      }, 2500);
    } else {
      setSuccessMsg("Usuário ou senha inválidos!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1800);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Montserrat', Inter, Roboto, Arial, sans-serif",
      position: "relative"
    }}>
      {/* Mensagem de sucesso animada */}
      {showSuccess && (
        <div className="login-success-anim">
          <div className="login-success-card">
            <span role="img" aria-label="success" style={{ fontSize: 38, display: "block", marginBottom: 10 }}>🎉</span>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.4, color: "#1976d2" }}>
              {successMsg}
            </span>
          </div>
        </div>
      )}
      <div style={{
        background: "#fff",
        padding: "40px 32px 32px 32px",
        borderRadius: 18,
        boxShadow: "0 8px 32px 0 rgba(25, 118, 210, 0.15)",
        minWidth: 340,
        width: "90vw",
        maxWidth: 370,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <img
          src={logo}
          alt="Logo"
          style={{ width: 78, marginBottom: 18, borderRadius: 12, boxShadow: "0 2px 8px #0002" }}
        />
        <h1 style={{
          margin: "0 0 24px 0",
          color: "#1976d2",
          fontWeight: 800,
          letterSpacing: 1,
          fontFamily: "'Montserrat', Inter, Roboto, Arial, sans-serif",
          fontSize: "2.2rem"
        }}>
          CliniFlow
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 18
          }}
          autoComplete="off"
        >
          <input
            placeholder="E-mail"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              padding: "13px 14px",
              fontSize: 16,
              borderRadius: 9,
              border: "1.5px solid #e0e0e0",
              outline: "none",
              transition: "border 0.2s",
              boxShadow: "0 1px 2px #0001",
              background: "#f7f9fa"
            }}
            onFocus={e => (e.target.style.border = "1.5px solid #1976d2")}
            onBlur={e => (e.target.style.border = "1.5px solid #e0e0e0")}
            autoFocus
          />
          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              padding: "13px 14px",
              fontSize: 16,
              borderRadius: 9,
              border: "1.5px solid #e0e0e0",
              outline: "none",
              transition: "border 0.2s",
              boxShadow: "0 1px 2px #0001",
              background: "#f7f9fa"
            }}
            onFocus={e => (e.target.style.border = "1.5px solid #1976d2")}
            onBlur={e => (e.target.style.border = "1.5px solid #e0e0e0")}
          />
          <button
            type="submit"
            className="shine-btn"
            style={{
              position: "relative",
              background: "linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)",
              color: "#fff",
              border: 0,
              padding: "13px 0",
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 17,
              boxShadow: "0 2px 8px #1976d220",
              letterSpacing: 0.5,
              cursor: "pointer",
              marginTop: 3,
              overflow: "hidden"
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>Entrar</span>
            <span className="shine-effect"></span>
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate("/register")}
          style={{
            background: "none",
            color: "#1976d2",
            border: 0,
            padding: 0,
            fontSize: 15,
            cursor: "pointer",
            textDecoration: "underline",
            marginTop: 21,
            fontFamily: "Montserrat, Inter, Roboto, Arial, sans-serif",
            fontWeight: 500
          }}
        >
          Criar conta
        </button>
      </div>
      {/* CSS para animação e botão */}
      <style>
        {`
          .login-success-anim {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            background: rgba(33, 150, 243, 0.03);
            animation: fadeInBg 0.4s;
          }
          .login-success-card {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 6px 32px #1976d233;
            padding: 32px 25px;
            min-width: 290px;
            text-align: center;
            opacity: 0;
            transform: translateY(-40px) scale(0.95);
            animation: fadeInCard 0.6s cubic-bezier(.57,.21,.69,1.25) forwards;
          }
          @keyframes fadeInCard {
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes fadeInBg {
            from { background: rgba(33, 150, 243, 0); }
            to { background: rgba(33, 150, 243, 0.03); }
          }
          .shine-btn {
            transition: box-shadow 0.2s;
          }
          .shine-btn .shine-effect {
            content: '';
            position: absolute;
            top: 0; left: -75%;
            height: 100%;
            width: 50%;
            background: linear-gradient(120deg, transparent 0%, #fff8 50%, transparent 100%);
            transform: skewX(-25deg);
            transition: left 0.5s cubic-bezier(0.4,0,0.2,1);
            z-index: 1;
            pointer-events: none;
          }
          .shine-btn:hover {
            box-shadow: 0 4px 24px #42a5f588, 0 0 8px #fff8;
          }
          .shine-btn:hover .shine-effect {
            left: 120%;
            transition: left 0.6s cubic-bezier(0.4,0,0.2,1);
          }
        `}
      </style>
    </div>
  );
}
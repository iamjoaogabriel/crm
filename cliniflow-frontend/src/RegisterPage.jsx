import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleRegister(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Preencha todos os campos");
      return;
    }
    // Checa se o usuário já existe:
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find(u => u.email === email)) {
      setError("Email já cadastrado!");
      return;
    }
    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Cadastro realizado com sucesso!");
    navigate("/");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Montserrat', Inter, Roboto, Arial, sans-serif"
    }}>
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
        <h1 style={{
          margin: "0 0 24px 0",
          color: "#1976d2",
          fontWeight: 800,
          letterSpacing: 1,
          fontFamily: "'Montserrat', Inter, Roboto, Arial, sans-serif",
          fontSize: "2.2rem"
        }}>Cadastro</h1>
        <form
          onSubmit={handleRegister}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 18
          }}
        >
          <input
            placeholder="Nome"
            value={name}
            onChange={e => setName(e.target.value)}
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
          />
          <input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          />
          {error && (
            <div style={{
              color: "#d32f2f",
              fontSize: 14,
              margin: "0 0 -10px 0",
              textAlign: "center"
            }}>{error}</div>
          )}
          <button
            type="submit"
            style={{
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
              marginTop: 3
            }}
          >
            Cadastrar
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate("/")}
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
          Voltar ao login
        </button>
      </div>
    </div>
  );
}
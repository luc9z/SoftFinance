import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./style.module.scss";
import { AuthContext } from "../../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const income = 0; // Substitua pelo estado real
  const totalExpenses = 0; // Substitua pelo estado real

  const data = [
    { name: "Income", value: income },
    { name: "Expenses", value: totalExpenses },
  ];

  if (!user) {
    return <Navigate to="/login" />;
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio",
    "Junho", "Julho", "Agosto", "Setembro", "Outubro",
    "Novembro", "Dezembro"
  ];

  const handleMonthNavigation = (month, year) => {
    console.log("Navigating to:", { month, year });
    navigate(`/dashboard/${month}/${year}`);
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.userBox}>
          <div className={styles.profileCircle}>
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className={styles.profileImage} />
            ) : (
              <span className={styles.profileInitial}>{user.firstName.charAt(0)}</span>
            )}
          </div>
          <p className={styles.nameWelcome}>Olá {user.firstName}!</p>
        </div>
        <div className={styles.inputBox}>
          <button onClick={() => navigate("/dashboard/entrada")}>Adicionar Entrada</button>
          <button onClick={() => navigate("/dashboard/meta")}>Adicionar Metas</button>
          <button onClick={() => navigate("/dashboard/despesa")}>Adicionar Despesa</button>
        </div>
        <div className={styles.yearSelector}>
          <label>Selecione o Ano</label>
          <select value={selectedYear} onChange={handleYearChange}>
            {[currentYear, currentYear + 1].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className={styles.monthContainer}>
          {months.slice(selectedYear === currentYear ? currentMonth : 0).map((month, index) => {
            const actualMonth = selectedYear === currentYear ? currentMonth + index : index;
            return (
              <div className={styles.monthItem} key={actualMonth}>
                <span>{month}</span>
                <button onClick={() => handleMonthNavigation(actualMonth + 1, selectedYear)}>▼</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

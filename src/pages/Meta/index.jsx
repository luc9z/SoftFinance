import React, { useState, useEffect, useContext } from "react";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { AuthContext } from "../../contexts/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./style.module.scss";
import { toast } from 'react-toastify';

const Meta = () => {
  const { user } = useContext(AuthContext);
  const [goalName, setGoalName] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalDate, setGoalDate] = useState(null);
  const [goals, setGoals] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    const fetchGoals = async () => {
      if (user) {
        const q = query(collection(db, "goals"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedGoals = [];
        querySnapshot.forEach((doc) => {
          fetchedGoals.push({ ...doc.data(), id: doc.id });
        });
        setGoals(fetchedGoals);
      }
    };
    fetchGoals();
  }, [user]);

  const handleValueChange = (e) => {
    const value = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setGoalValue(parts.join("."));
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalName || !goalValue || !goalDate) {
      setFeedbackMessage("Por favor, preencha todos os campos.");
      return;
    }

    const goal = {
      name: goalName,
      totalValue: parseFloat(goalValue.replace(",", ".")),
      year: goalDate.getFullYear(),
      month: goalDate.getMonth() + 1,
      userId: user.uid
    };

    try {
      await addDoc(collection(db, 'goals'), goal);
      toast.success('Meta adicionada com sucesso!');
      setGoalName('');
      setGoalValue('');
      setGoalDate(null);
      setGoals([...goals, goal]);
    } catch (error) {
      toast.error('Erro ao adicionar meta.');
      console.error('Erro ao adicionar meta:', error);
    }
  };

  const handleRemoveGoal = async (id) => {
    try {
      await deleteDoc(doc(db, "goals", id));
      setGoals(goals.filter((goal) => goal.id !== id));
      toast.error('Meta removida com sucesso!');
    } catch (error) {
      toast.error(`Erro ao remover meta: ${error.message}`);
    }
  };

  return (
    <div className={styles.metas}>
      <button className={styles.backButton} onClick={() => window.history.back()}>
        &#8592;
      </button>
      <h2>Adicionar Metas</h2>
      {feedbackMessage && <p className={styles.feedback}>{feedbackMessage}</p>}
      <form onSubmit={handleAddGoal} className={styles.form}>
        <input
          type="text"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          placeholder="Nome da Meta"
          className={styles.input}
        />
        <input
          type="text"
          value={goalValue}
          onChange={handleValueChange}
          placeholder="Valor da Meta"
          className={styles.input}
        />
        <DatePicker
          selected={goalDate}
          onChange={(date) => setGoalDate(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          minDate={new Date()}
          maxDate={new Date(2025, 11, 31)}
          placeholderText="Selecione a data da meta"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Concluir</button>
      </form>
      <h3>Metas Adicionadas</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Valor</th>
            <th>Mês</th>
            <th>Ano</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal, index) => (
            <tr key={index}>
              <td>{goal.name}</td>
              <td>{goal.totalValue.toFixed(2)}</td>
              <td>{new Date(0, goal.month - 1).toLocaleString('default', { month: 'long' })}</td>
              <td>{goal.year}</td>
              <td>
                <button className={styles.deleteButton} onClick={() => handleRemoveGoal(goal.id)}>
                  &#10060;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Meta;

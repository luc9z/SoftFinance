import React, { useState, useEffect, useContext } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebaseConnection";
import { AuthContext } from "../contexts/AuthContext";
import ResultChart from "../contexts/ResultChart";
import styles from "./MonthDetail.module.scss";
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MonthDetail = () => {
  const { user } = useContext(AuthContext);
  const { month, year } = useParams();
  const navigate = useNavigate();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const selectedMonth = month !== undefined ? parseInt(month, 10) : currentMonth;
  const selectedYear = year !== undefined ? parseInt(year, 10) : currentYear;

  const [entries, setEntries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user && selectedMonth && selectedYear) {
        try {
          const qEntries = query(
            collection(db, "entries"),
            where("userId", "==", user.uid),
            where("month", "==", selectedMonth),
            where("year", "==", selectedYear)
          );
          const qExpenses = query(
            collection(db, "expenses"),
            where("userId", "==", user.uid),
            where("month", "==", selectedMonth),
            where("year", "==", selectedYear)
          );
          const qGoals = query(
            collection(db, "goals"),
            where("userId", "==", user.uid)
          );

          const entriesSnapshot = await getDocs(qEntries);
          const expensesSnapshot = await getDocs(qExpenses);
          const goalsSnapshot = await getDocs(qGoals);

          const fetchedEntries = [];
          const fetchedExpenses = [];
          const fetchedGoals = [];

          entriesSnapshot.forEach((doc) => {
            fetchedEntries.push({ ...doc.data(), id: doc.id });
          });
          expensesSnapshot.forEach((doc) => {
            fetchedExpenses.push({ ...doc.data(), id: doc.id });
          });
          goalsSnapshot.forEach((doc) => {
            fetchedGoals.push({ ...doc.data(), id: doc.id });
          });

          setEntries(fetchedEntries);
          setExpenses(fetchedExpenses);
          setGoals(fetchedGoals);
        } catch (error) {
          console.error("Erro ao buscar dados: ", error);
        }
      }
    };

    fetchData();
  }, [user, selectedMonth, selectedYear]);

  const handleRemoveExpense = async (expenseId) => {
    try {
      await deleteDoc(doc(db, "expenses", expenseId));
      setExpenses((prevExpenses) => prevExpenses.filter(expense => expense.id !== expenseId));
      toast.error('Despesa removida com sucesso!');
    } catch (error) {
      console.error("Erro ao remover despesa: ", error);
      toast.error(`Erro ao remover despesa: ${error.message}`);
    }
  };

  const handleRemoveGoal = async (goalId) => {
    try {
      await deleteDoc(doc(db, "goals", goalId));
      setGoals((prevGoals) => prevGoals.filter(goal => goal.id !== goalId));
      toast.success('Meta removida com sucesso!');
    } catch (error) {
      console.error("Erro ao remover meta: ", error);
      toast.error(`Erro ao remover meta: ${error.message}`);
    }
  };

  const totalEntries = entries.reduce((acc, entry) => acc + entry.value, 0);
  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.value, 0);

  const getGoalMonthlyValue = (goal) => {
    const currentDate = new Date();
    const targetDate = new Date(goal.year, goal.month - 1);

    // Considerando o mês atual
    const monthsRemaining = ((targetDate.getFullYear() - currentDate.getFullYear()) * 12) 
                          + (targetDate.getMonth() - currentDate.getMonth()) + 1;

    return monthsRemaining > 0 ? (goal.totalValue / monthsRemaining).toFixed(2) : 0;
  };

  const totalGoalsMonthlyValue = goals
    .filter(goal => (goal.year > selectedYear || (goal.year === selectedYear && goal.month >= selectedMonth)))
    .reduce((acc, goal) => acc + parseFloat(getGoalMonthlyValue(goal)), 0);

  const entriesExpensesData = [
    ["Type", "Value"],
    ["Despesas", totalExpenses + totalGoalsMonthlyValue],
    ["Saldo", totalEntries - totalExpenses - totalGoalsMonthlyValue]
  ];

  const expensesData = [
    ["Categoria", "Valor"],
    ...expenses.map(expense => [expense.category, expense.value]),
    ["Metas", totalGoalsMonthlyValue]
  ];

  const isPastDate = selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth);

  return (
    <div className={styles.monthDetail}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        &#8592;
      </button>
      {isPastDate ? (
        <div className={styles.message}>
          <h2>Não é possível visualizar ou editar dados de meses anteriores.</h2>
        </div>
      ) : (
        <>
          <h2>{`${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())} ${selectedYear}`}</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Parcelas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.name}</td>
                  <td>{expense.category}</td>
                  <td>{expense.value}</td>
                  <td>{expense.installments}</td>
                  <td>
                    <button className={styles.removeButton} onClick={() => handleRemoveExpense(expense.id)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.charts}>
            <div className={styles.chart}>
              <h3>Entradas - Despesas</h3>
              <ResultChart data={entriesExpensesData} />
            </div>
            <div className={styles.chart}>
              <h3>Despesas por Categoria</h3>
              <ResultChart data={expensesData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthDetail;

import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { collection, writeBatch, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import styles from "./style.module.scss";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Despesa = () => {
  const { user } = useContext(AuthContext);
  const [expenseName, setExpenseName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseValue, setExpenseValue] = useState("");
  const [expenseInstallments, setExpenseInstallments] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const navigate = useNavigate();

  const categories = [
    "Alimentação",
    "Transporte",
    "Educação",
    "Saúde",
    "Lazer",
    "Moradia",
    "Roupas",
    "Assinaturas",
    "Presentes",
    "Beleza",
    "Outros",
  ];

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseName || !expenseCategory || !expenseValue || !expenseInstallments) {
      setFeedbackMessage("Por favor, preencha todos os campos.");
      return;
    }

    // Converter valor para formato float com ponto e vírgula e garantir até 2 casas decimais
    const formattedValue = parseFloat(expenseValue.replace(",", ".")).toFixed(2).replace(".", ",");
    const expenseValuePerInstallment = parseFloat(formattedValue.replace(",", ".")) / parseInt(expenseInstallments);
    const color = getRandomColor();

    try {
      const batch = writeBatch(db);
      const currentDate = new Date();

      for (let i = 0; i < parseInt(expenseInstallments); i++) {
        const expenseDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);

        const expenseDoc = {
          userId: user.uid,
          name: expenseName,
          category: expenseCategory,
          value: expenseValuePerInstallment,
          installments: parseInt(expenseInstallments),
          month: expenseDate.getMonth() + 1,
          year: expenseDate.getFullYear(),
          color: color,
          createdAt: serverTimestamp()
        };

        batch.set(doc(collection(db, 'expenses')), expenseDoc);
      }

      await batch.commit();

      toast.success('Despesa adicionada com sucesso!');
      setExpenseName('');
      setExpenseCategory('');
      setExpenseValue('');
      setExpenseInstallments('');
      navigate(0); // atualize a página
    } catch (error) {
      toast.error('Erro ao adicionar despesa.');
      console.error('Erro ao adicionar despesa:', error);
    }
  };

  const handleValueChange = (e) => {
    const value = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setExpenseValue(parts.join(","));
  };

  return (
    <div className={styles.despesa}>
      <button className={styles.backButton} onClick={() => window.history.back()}>
        &#8592;
      </button>
      <h2>Adicionar Despesa</h2>
      {feedbackMessage && <p className={styles.feedback}>{feedbackMessage}</p>}
      <form onSubmit={handleAddExpense} className={styles.form}>
        <input
          type="text"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
          placeholder="Nome da Despesa"
          className={styles.input}
        />
        <select
          value={expenseCategory}
          onChange={(e) => setExpenseCategory(e.target.value)}
          className={styles.input}
        >
          <option value="">Selecione a Categoria</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={expenseValue}
          onChange={handleValueChange}
          placeholder="Valor da Despesa"
          className={styles.input}
        />
        <select
          value={expenseInstallments}
          onChange={(e) => setExpenseInstallments(e.target.value)}
          className={styles.input}
        >
          <option value="">Número de Parcelas</option>
          {[...Array(17)].map((_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.button}>Concluir</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Despesa;

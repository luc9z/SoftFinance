import React, { useState, useEffect, useContext } from "react";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { AuthContext } from "../../contexts/AuthContext";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import styles from "./style.module.scss";
import { toast } from 'react-toastify';

const Entrada = () => {
  const { user } = useContext(AuthContext);
  const [entryName, setEntryName] = useState("");
  const [entryValue, setEntryValue] = useState("");
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [entries, setEntries] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      if (user) {
        const q = query(collection(db, "entries"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedEntries = [];
        querySnapshot.forEach((doc) => {
          fetchedEntries.push({ ...doc.data(), id: doc.id });
        });
        setEntries(fetchedEntries);
      }
    };
    fetchEntries();
  }, [user]);

  useEffect(() => {
    const filteredMonths = selectedMonths.filter(month => {
      return selectedYears.some(year => {
        const yearValue = year.value;
        const currentYear = new Date().getFullYear();
        return (yearValue === currentYear && month.value >= new Date().getMonth() + 1) || (yearValue !== currentYear);
      });
    });
    setSelectedMonths(filteredMonths);
  }, [selectedYears]);

  const handleValueChange = (e) => {
    const value = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setEntryValue(parts.join(","));
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!entryName || !entryValue || selectedMonths.length === 0 || selectedYears.length === 0) {
      setFeedbackMessage("Por favor, preencha todos os campos.");
      return;
    }
  
    const newEntries = [];
  
    selectedMonths.forEach((month) => {
      selectedYears.forEach((year) => {
        newEntries.push({ name: entryName, value: parseFloat(entryValue.replace(",", ".")), userId: user.uid, month: month.value, year: year.value });
      });
    });
  
    try {
      const entryDate = new Date();
      await Promise.all(newEntries.map(async (entry) => {
        await addDoc(collection(db, 'entries'), {
          userId: entry.userId,
          name: entry.name,
          value: entry.value,
          month: entry.month,
          year: entry.year,
        });
      }));
  
      toast.success('Entrada adicionada com sucesso!');
      setEntryName('');
      setEntryValue('');
      setSelectedMonths([]);
      setSelectedYears([]);
    } catch (error) {
      toast.error('Erro ao adicionar entrada.');
      console.error('Erro ao adicionar entrada:', error);
    }
  };

  const handleRemoveEntry = async (index) => {
    const entryToRemove = entries[index];
    try {
      await deleteDoc(doc(db, "entries", entryToRemove.id));
      const newEntries = entries.filter((entry, i) => i !== index);
      setEntries(newEntries);
      toast.error("Entrada removida com sucesso!");
    } catch (error) {
      toast.error(`Erro ao remover entrada: ${error.message}`);
    }
  };

  const monthOptions = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const yearOptions = [
    { value: 2024, label: "2024" },
    { value: 2025, label: "2025" },
  ];

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const filteredMonthOptions = selectedYears.length === 1 && selectedYears[0].value === currentYear
    ? monthOptions.filter(option => option.value >= currentMonth)
    : monthOptions;

  return (
    <div className={styles.entrada}>
      <button className={styles.backButton} onClick={() => window.history.back()}>
        &#8592;
      </button>
      <h2>Adicionar Entrada</h2>
      {feedbackMessage && <p className={styles.feedback}>{feedbackMessage}</p>}
      <form onSubmit={handleAddEntry} className={styles.form}>
        <input
          type="text"
          value={entryName}
          onChange={(e) => setEntryName(e.target.value)}
          placeholder="Nome da Entrada"
          className={styles.input}
        />
        <input
          type="text"
          value={entryValue}
          onChange={handleValueChange}
          placeholder="Valor da Entrada"
          className={styles.input}
        />
        <Select
          isMulti
          options={yearOptions}
          value={selectedYears}
          onChange={setSelectedYears}
          components={makeAnimated()}
          placeholder="Selecione os anos"
          className={styles.select}
        />
        <Select
          isMulti
          options={filteredMonthOptions}
          value={selectedMonths}
          onChange={setSelectedMonths}
          components={makeAnimated()}
          placeholder="Selecione os meses"
          className={styles.select}
        />
        <button type="submit" className={styles.button}>Concluir</button>
      </form>
      <h3>Entradas Confirmadas</h3>
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
          {entries.map((entry, index) => (
            <tr key={index}>
              <td>{entry.name}</td>
              <td>{entry.value.toFixed(2)}</td>
              <td>{new Date(0, entry.month - 1).toLocaleString('default', { month: 'long' })}</td>
              <td>{entry.year}</td>
              <td>
                <button className={styles.deleteButton} onClick={() => handleRemoveEntry(index)}>
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

export default Entrada;

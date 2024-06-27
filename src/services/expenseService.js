import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConnection";

// Função para adicionar uma despesa
export const addExpense = async (userId, expense) => {
  try {
    const { name, category, value, installments } = expense;
    const installmentValue = value / installments;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < installments; i++) {
      const month = (currentMonth + i - 1) % 12 + 1;
      const year = currentYear + Math.floor((currentMonth + i - 1) / 12);
      
      const expenseWithUser = {
        name,
        category,
        value: installmentValue,
        userId,
        month,
        year,
        originalValue: value,
        installments,
        currentInstallment: i + 1
      };

      await addDoc(collection(db, "expenses"), expenseWithUser);
    }
  } catch (error) {
    console.error("Erro ao adicionar despesa: ", error);
    throw error; // Re-lançar o erro para ser tratado pela lógica de chamada
  }
};

// Função para remover uma despesa
export const removeExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, "expenses", expenseId));
  } catch (error) {
    console.error("Erro ao remover despesa: ", error);
    throw error; // Re-lançar o erro para ser tratado pela lógica de chamada
  }
};

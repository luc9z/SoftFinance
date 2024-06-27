import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConnection";

// Função para adicionar uma entrada
export const addEntry = async (userId, entry) => {
  try {
    const docRef = await addDoc(collection(db, "users", userId, "entries"), entry);
    console.log("Entry added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding entry: ", error);
    throw error; // Re-lançar o erro para ser tratado pela lógica de chamada
  }
};

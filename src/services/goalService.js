import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConnection";

export const addGoal = async (userId, goal) => {
  try {
    await addDoc(collection(db, "goals"), {
      userId,
      ...goal,
    });
  } catch (error) {
    console.error("Erro ao adicionar meta: ", error);
    throw error;
  }
};

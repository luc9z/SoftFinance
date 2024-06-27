import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from '../contexts/AuthContext'

export default function Private({ children }) {
    const { signed } = useContext(AuthContext)

    if (!signed) {
        return <Navigate to='/' replace /> // Usando Navigate para redirecionar
    }

    return children
}

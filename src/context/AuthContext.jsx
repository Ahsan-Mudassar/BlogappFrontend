import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import { clearAccessToken, setAccessToken } from "../api/tokenStore";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const checkUser = async () => {
            try {
                const response = await api.post("/auth/refresh-token")
                const accessToken = response.data.data?.accessToken
                const userData = response.data.data.user

                setAccessToken(accessToken)
                setUser(userData)
            } catch (_) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        checkUser();
    }, [])

    useEffect(() => {

        const handleSessionExpire = () => {
            setUser(null)
        }

        window.addEventListener(
            "auth:session-expired",
            handleSessionExpire
        )

        return () => {
            window.removeEventListener(
                "auth:session-expired",
                handleSessionExpire
            )
        }
    }, [])

    const register = async (formData) => {
        try {
            const response = await api.post("/auth/register", formData)
           
            const accessToken = response.data.data.accessToken
            const userData = response.data.data.user
            setAccessToken(accessToken)
            setUser(userData)


        } catch (error) {
            console.log("Registeration API error:", error)
        }
    }

    const login = async (crenditials) => {
        try {
            const response = await api.post("/auth/login", crenditials)
            const accessToken = response.data.data?.accessToken
            const userData = response.data.data.user

            setAccessToken(accessToken)
            setUser(userData)
        } catch (error) {
            console.log("Login API error:", error)
        }
    }

    const logout = async () => {
        try {
            await api.post("/auth/logout")
        } catch (error) {
            console.log("Logout API error:", error)
        } finally {
            clearAccessToken();
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
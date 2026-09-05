import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Spinner from "../components/Spinner"

export default function Login() {

    const { user, loading, login } = useAuth()
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [fieldsErrors, setfieldsErrors] = useState({})
    const [serverErrors, setServerErrors] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && user) {
            const redirectTo = location.state?.from?.pathname || "/";
            navigate(redirectTo, { replace: true })
        }
    }, [user, loading, navigate, location])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
        if (fieldsErrors[name]) {
            setfieldsErrors((prev) => ({
                ...prev,
                [name]: ""
            }))
        }
        if (serverErrors) setServerErrors("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setfieldsErrors({})
        setServerErrors("")

        if (!validate()) return;
        if (isSubmitting) return;

        setIsSubmitting(true)

        try {
            await login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            })

            const redirectTo = location.state?.from?.pathname || "/";
            navigate(redirectTo, { replace: true })
        } catch (error) {
            if (!error.response) {
                setServerErrors("Network error. Please check your internet connection.")
            } else if (error.response.status === 401 || error.response.status === 400) {
                setServerErrors("Email and password are incorrect.")
            } else {
                setServerErrors(
                    error.response.data?.message ||
                    "Something went wrong. Please try again later."
                )
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <Spinner />;
    if (loading || user) return null;

    const validate = () => {
        const errors = {};
        const email = formData.email.trim();
        const password = formData.password;

        if (!email) {
            errors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address"
        }

        if (!password) {
            errors.password = "Password is required"
        } else if (password.length < 8) {
            errors.password = "Password must be at least 8 characters"
        } else if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
            errors.password = "Password must contain uppercase, lowercase and a number"
        }

        setfieldsErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    return (
        <main className="page-shell min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6">
            <div className="card mx-auto w-full max-w-md px-6 py-8 shadow-lg sm:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-ink">Log in</h1>
                    <p className="mt-2 text-base text-muted">Welcome back</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <label htmlFor="email" className="field-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            aria-describedby={fieldsErrors.email ? "email-error" : undefined}
                            aria-invalid={!!fieldsErrors.email}
                            placeholder="Enter your email"
                            className={`input-field ${fieldsErrors.email ? "input-field-error" : ""}`}
                        />
                        {fieldsErrors.email && <p id="email-error" className="field-error-text">{fieldsErrors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="field-label">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                aria-describedby={fieldsErrors.password ? "password-error" : undefined}
                                aria-invalid={!!fieldsErrors.password}
                                placeholder="Enter your password"
                                className={`input-field pr-11 ${fieldsErrors.password ? "input-field-error" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink-soft focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {fieldsErrors.password && <p id="password-error" className="field-error-text">{fieldsErrors.password}</p>}
                    </div>
                    {serverErrors && <p role="alert" className="field-error-text">{serverErrors}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="mt-5 text-right text-sm">
                    <Link to="/forgot-password" className="text-muted hover:text-ink-soft cursor-pointer hover:underline">
                        Forgot your password?
                    </Link>
                </p>
                <p className="mt-6 text-center text-sm text-muted">
                    Don't have an account? <Link to="/register" className="text-brand hover:text-brand-active hover:underline">Register</Link>
                </p>
            </div>
        </main>
    );
}
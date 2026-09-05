import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import Spinner from "../components/Spinner"

export default function Register() {

    const { loading, user, register } = useAuth()

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    })
    const [FieldsErrors, setFieldsErrors] = useState({})
    const [serverError, setServerError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()


    useEffect(() => {
        if (!loading && user) {
            navigate("/", { replace: true })
        }
    }, [loading, user, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        setServerError("")
        if (FieldsErrors[name]) {
            setFieldsErrors((prev) => ({
                ...prev,
                [name]: ""
            }))
        }
    }
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    }

    const validate = () => {
        const errors = {};
        const username = formData.username.trim();
        const email = formData.email.trim();

        if (!username) {
            errors.username = "Username is required"
        } else if (username.length < 3) {
            errors.username = "Username must be at least 3 character"
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.username = "Username can only contain letters, numbers, underscore"
        }

        if (!email) {
            errors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Enter a valid email address"
        }

        if (!formData.password) {
            errors.password = "Password is required"
        } else if (formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters"
        } else if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
            errors.password = "Password must contain uppercase, lowercase and a number"
        }

        setFieldsErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldsErrors({})
        setServerError("")

        if (isSubmitting) return;
        if (!validate()) return;

        setIsSubmitting(true)
        try {
            const response = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            })

            // Keep the form visible when the auth hook returns an error response
            // instead of rejecting the promise.
            if (response?.success === false || response?.error) {
                const error = new Error(
                    response.error || response.message || "Registration failed"
                )
                error.response = { data: response, status: response.status }
                throw error
            }

            // Redirect to home when registration succeeds and no server error is returned.
            navigate("/", { replace: true })
        } catch (err) {
            
            if (!err.response) {
                setServerError(err.message || "Please check your internet connection")
            } else {
                const data = err.response.data
                const message = typeof data === "string"
                    ? data
                    : data?.message || data?.error || data?.detail || data?.errors

                setServerError(
                    typeof message === "object" ? JSON.stringify(message) : message ||
                    (err.response.status === 409
                        ? "An account with this email already exists"
                        : "Something went wrong. Please try again in a moment.")
                )
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <Spinner />;
    if (loading || user) return null;

    return (
        <>
            <div className="page-shell w-full max-w-md mx-auto my-8 flex flex-col items-center rounded-lg px-5 py-8 shadow-md sm:px-8">
                <h1 className="text-2xl font-bold text-center md:text-3xl">Create your account</h1>
                <form onSubmit={handleSubmit} noValidate className="w-full mt-8 space-y-4">

                    <div>
                        <label htmlFor="username" className="field-label">Username:</label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            placeholder="Enter your username"
                            onChange={handleChange}
                            autoComplete="username"
                            aria-invalid={!!FieldsErrors.username}
                            aria-describedby={FieldsErrors.username ? "username-error" : undefined}
                            className="input-field"
                        />
                        {
                            FieldsErrors.username && (
                                <p id="username-error" className="field-error-text">{FieldsErrors.username}</p>
                            )
                        }

                    </div>
                    <div>
                        <label htmlFor="email" className="field-label">Email:</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            placeholder="Enter your email"
                            onChange={handleChange}
                            autoComplete="email"
                            aria-invalid={!!FieldsErrors.email}
                            aria-describedby={FieldsErrors.email ? "email-error" : undefined}
                            className="input-field"
                        />
                        {
                            FieldsErrors.email && (
                                <p id="email-error" className="field-error-text">{FieldsErrors.email}</p>
                            )
                        }
                    </div>
                    <div>

                        <label htmlFor="password" className="field-label">Password:</label>
                        <div className="relative">
                            <input id="password" type={showPassword ? "text" : "password"} name="password" value={formData.password} placeholder="Enter your password" disabled={isSubmitting} onChange={handleChange} autoComplete="new-password" aria-invalid={!!FieldsErrors.password} aria-describedby={FieldsErrors.password ? "password-error" : undefined} className="input-field pr-10" />
                            <button type="button" onClick={togglePasswordVisibility} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-ink-soft focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand">
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                    </div>
                    {
                        FieldsErrors.password && (
                            <p id="password-error" className="field-error-text">
                                {FieldsErrors.password}
                            </p>
                        )
                    }

                    {
                        serverError && (
                            <p role="alert" className="field-error-text bg-danger-subtle border border-danger/20 rounded-lg px-3 py-2">{serverError}</p>
                        )
                    }
                    <button
                        type="submit"
                        className="btn-primary w-full mt-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating Account..." : "Submit"}
                    </button>
                </form>

                <p className="mt-4 text-sm text-center text-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="text-brand hover:underline hover:text-brand-hover">
                        Log in
                    </Link>
                </p>
            </div>
        </>
    )
}

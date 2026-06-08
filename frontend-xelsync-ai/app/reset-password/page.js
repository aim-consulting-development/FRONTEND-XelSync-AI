"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import api from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMsg("Completa ambos campos");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        token,
        new_password: password
      });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || "Enlace expirado o inválido.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-6">
          <p className="font-medium">Enlace Inválido</p>
          <p className="text-sm mt-1">Falta el token de seguridad en la URL.</p>
        </div>
        <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 underline">
          Volver a solicitar recuperación
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          <p className="font-medium">¡Contraseña Actualizada!</p>
          <p className="text-sm mt-1">
            Tu contraseña ha sido cambiada exitosamente.
          </p>
        </div>
        <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Nueva Contraseña
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Actualizando..." : "Cambiar Contraseña"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 relative">
      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/XelSyncLogo1.png"
            alt="XelSync"
            width={180}
            height={60}
            priority
          />
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">
          Crea tu Nueva Contraseña
        </h1>

        <p className="text-gray-500 mb-8 text-center">
          Ingresa una nueva contraseña segura para tu cuenta.
        </p>

        <Suspense fallback={<div className="text-center text-gray-500">Cargando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

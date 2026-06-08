"use client";
import { useState } from "react";
import Link from "next/link";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Ingresa tu correo electrónico");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || "Ocurrió un error al procesar tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 relative">
      {/* Botón de regresar */}
      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
        <FaArrowLeft />
        <span>Volver al Login</span>
      </Link>

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
          Recuperar Contraseña
        </h1>

        <p className="text-gray-500 mb-8 text-center">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {success ? (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
              <p className="font-medium">¡Solicitud enviada!</p>
              <p className="text-sm mt-1">
                Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.
              </p>
            </div>
            <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition">
              Volver al Inicio de Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>

              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="correo@empresa.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar Enlace"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

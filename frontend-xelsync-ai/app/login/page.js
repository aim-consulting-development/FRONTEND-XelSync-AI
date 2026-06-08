"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
FaCheck,
FaEnvelope,
FaLock,
FaEye,
FaEyeSlash,
} from "react-icons/fa";
import Image from "next/image";

import api from "@/lib/api";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
e.preventDefault();

if (!email.trim()) {
  alert("Ingresa tu correo electrónico");
  return;
}

if (!password.trim()) {
  alert("Ingresa tu contraseña");
  return;
}

try {
  setLoading(true);

  // FastAPI OAuth2PasswordRequestForm requiere x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  // Guardar el token en el cliente
  localStorage.setItem("access_token", response.data.access_token);
  
  // Redirigir al dashboard
  router.push("/dashboard");
} catch (error) {
  console.error(error);
  // Intentar extraer el mensaje del backend si existe
  const msg = error.response?.data?.detail || "Error al iniciar sesión. Revisa tus credenciales.";
  alert(msg);
} finally {
  setLoading(false);
}

};

  return ( <div className="min-h-screen flex">
  {/* Panel izquierdo */}
  <div className="hidden lg:flex w-1/2 bg-slate-900 text-white items-center justify-center relative overflow-hidden">
    {/* Imagen de fondo de aduana con opacidad */}
    <div 
      className="absolute inset-0 z-0 opacity-40 bg-cover bg-center mix-blend-overlay" 
      style={{ backgroundImage: "url('/images/customs_bg.png')" }} 
    />
    {/* Degradado encima de la imagen para mantener el diseño oscuro original */}
    <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/90 to-slate-900/80" />

    <div className="max-w-md px-8 relative z-20">
      <div className="flex justify-center mb-8">
        <Image
           src="/images/XelSyncLogo4.png"
           alt="XelSync"
           width={220}
           height={80}
           priority
         />
      </div>


      <h2 className="text-3xl font-bold mb-12 text-center">
        Automatización Inteligente de Comercio Exterior
      </h2>

      <div className="space-y-8">
        <div className="flex gap-4">
          <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <FaCheck />
          </div>

          <div>
            <h3 className="font-semibold">
              Extracción Automática con IA
            </h3>

            <p className="text-gray-300">
              Claude y Gemini procesan pedimentos PDF en segundos
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <FaCheck />
          </div>

          <div>
            <h3 className="font-semibold">
              Cumplimiento Anexo 24 y 30
            </h3>

            <p className="text-gray-300">
              Validación automática de requisitos SAT
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <FaCheck />
          </div>

          <div>
            <h3 className="font-semibold">
              SLA 48 Horas
            </h3>

            <p className="text-gray-300">
              Alertas automáticas y monitoreo en tiempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Panel derecho */}
  <div className="flex-1 flex items-center justify-center bg-gray-100 px-4 py-8">
    <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md">
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
        Iniciar Sesión
      </h1>

      <p className="text-gray-500 mb-8 text-center">
        Accede a tu cuenta de XelSync AI
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Contraseña
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

        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" className="rounded border-gray-300" />
            Recordar sesión
          </label>

          <a
            href="#"
            className="text-blue-600 hover:text-blue-800"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      <div className="mt-8 border rounded-lg p-4 bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2 text-gray-800">
          Credenciales de prueba:
        </p>

        <p>Admin: admin@xelsync.com</p>
        <p>Operador: operador@xelsync.com</p>
      </div>
    </div>
  </div>
</div>
);
}

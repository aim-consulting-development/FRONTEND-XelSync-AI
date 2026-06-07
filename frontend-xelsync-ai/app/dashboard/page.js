import MainLayout from "@/components/layout/MainLayout";

export default function Dashboard() {
  const cards = [
    {
      title: "Operaciones del Día",
      value: "12",
    },
    {
      title: "Valor en Aduana",
      value: "$2,345,678",
    },
    {
      title: "Impuestos Pagados",
      value: "$456,789",
    },
    {
      title: "Pendientes",
      value: "5",
    },
  ];

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow p-5"
          >
            <h3 className="text-gray-500">
              {card.title}
            </h3>

            <p className="text-2xl font-bold mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-4">
            Tendencia de Pedimentos
          </h2>

          <div className="h-64 flex items-center justify-center text-gray-400">
            Aquí irá la gráfica
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-4">
            Alertas SLA
          </h2>

          <div className="space-y-3">
            <div className="border rounded p-3">
              Pedimento 6001164
            </div>

            <div className="border rounded p-3">
              Pedimento 6000425
            </div>

            <div className="border rounded p-3">
              Pedimento 6001125
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
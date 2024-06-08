import "./App.css";
import "./globals.css";
import "@fontsource-variable/inter"; // Defaults to weight 400
import { MainTable } from "@/components/features/mainTable.tsx";

function App() {
  return (
    <div className="dark w-full h-screen radial-bg bg-[#020617] text-slate-200 overflow-x-hidden flex justify-center">
      <div className="w-full p-2 md:p-4 flex justify-center z-10  overflow-y-auto">
        <MainTable />
      </div>
    </div>
  );
}

export default App;

import HeaderExample from "@/Components/HeaderExample";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-10 items-center py-24">
        <h1 className="font-black text-gray-800 text-6xl">
          react-resizable-grid-panels
        </h1>
        <HeaderExample />
      </div>
    </main>
  );
}

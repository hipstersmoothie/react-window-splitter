import HeaderExample from "@/Components/HeaderExample";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-10 items-center py-12 md:py-24 px-10">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="font-black font-mono text-gray-800 text-2xl md:text-4xl bg-gray-300 rounded-lg px-3 py-1">
            react-window-splitter
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            A full featured resizable grid layout for React that support pixel
            and percentage based constraints.
          </p>
        </div>
        <HeaderExample />
      </div>
    </main>
  );
}

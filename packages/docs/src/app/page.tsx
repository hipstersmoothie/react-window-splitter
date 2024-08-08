import HeaderExample from "../Components/HeaderExample";
import { CodeBlock } from "mdxts/components";
import { CopyPackageNameButton } from "../Components/CopyPackageNameButton";
import { ButtonLink } from "../Components/Button";

export default async function Home() {
  return (
    <main>
      <div className="flex flex-col gap-10 items-center py-12 md:py-24 px-6 md:px-10">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="relative group font-black font-mono text-gray-normal text-xl sm:text-2xl md:text-4xl bg-gray-4 dark:bg-graydark-5 rounded-lg px-3 py-1">
            react-window-splitter
            <CopyPackageNameButton />
          </h1>
          <p className="text-gray-normal text-lg md:text-xl">
            A full featured{" "}
            <a
              href="https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/"
              className="text-blue-9 dark:text-bluedark-9 cursor-pointer underline underline-offset-4 hover:underline-offset-1 hover:decoration-wavy"
            >
              window splitter
            </a>{" "}
            for React that support pixel and and percentage based constraints.
          </p>
        </div>
        <HeaderExample />
        <CodeBlock
          source="../examples/HeaderExample.tsx"
          allowErrors={true}
          showToolbar={false}
        />

        <ButtonLink href="docs/install">Read the docs</ButtonLink>
      </div>
    </main>
  );
}

import { site } from "@assembly/content";

export default function Page() {
  return (
    <main className="p-6">
      <h1>{site.name}</h1>
      <p>{site.headline}</p>
      <p>Foundation build. The portfolio is under construction.</p>
    </main>
  );
}

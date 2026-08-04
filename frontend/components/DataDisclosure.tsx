export function DataDisclosure({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="mt-3 rounded-card border border-line bg-surface/60">
      <summary className="cursor-pointer select-none px-3 py-2 font-sans text-xs font-medium text-ink-soft hover:text-ink">
        View chart data as a table
      </summary>
      <div className="overflow-x-auto px-3 pb-3">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th key={col} scope="col" className="py-1.5 pr-4 font-medium text-ink-soft">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-line/60 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="py-1.5 pr-4 font-mono text-ink">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

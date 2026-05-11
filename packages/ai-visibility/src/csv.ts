/**
 * Tiny CSV parser. We don't pull a CSV library to keep the package
 * dependency-free. RFC 4180-ish: handles double quotes, embedded commas,
 * and escaped quotes within quoted fields. No header inference; caller
 * supplies the column map.
 */

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  const lines = splitLines(input);
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    rows.push(parseCsvLine(line));
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (line[i] === '"') {
      // quoted field
      i++;
      let value = "";
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          value += '"';
          i += 2;
          continue;
        }
        if (line[i] === '"') {
          i++;
          break;
        }
        value += line[i];
        i++;
      }
      cells.push(value);
      // expect comma or end
      if (line[i] === ",") i++;
    } else {
      let value = "";
      while (i < line.length && line[i] !== ",") {
        value += line[i];
        i++;
      }
      cells.push(value);
      if (line[i] === ",") i++;
      else break;
    }
  }
  return cells;
}

function splitLines(input: string): string[] {
  // Naive split — vendor exports never embed newlines in quoted fields.
  return input.replace(/\r\n/g, "\n").split("\n");
}

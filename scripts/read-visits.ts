import { createReadStream, createWriteStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';

const BASE_URL = 'https://postchain-p-node0.myneighboralice.com';
const CHAIN_ID = 'F31D7A38B33D12A5D948EE9CF170983A7CA5EFFFAAA31094C5B9CF94442D9FA2';
const INPUT_FILE = 'visits.csv';
const OUTPUT_FILE = 'complete-visits.csv';

async function fetchWallet(accountId: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const url = `${BASE_URL}/query/${CHAIN_ID}?type=evm_exporter.get_evm_address&account_id=${accountId}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      console.warn(`Wallet lookup failed for ${accountId}: ${res.status}`);
      return '';
    }
    const text = (await res.text()).trim();
    return text.replace(/"/g, '').trim();
  } catch (err) {
    console.warn(`Wallet lookup error for ${accountId}:`, err);
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function countRows(filePath: string): Promise<number> {
  const stream = createReadStream(filePath);
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  let count = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    count += 1;
  }
  return count;
}

async function main() {
  const filePath = resolve(__dirname, INPUT_FILE);
  const outputPath = resolve(__dirname, OUTPUT_FILE);
  const totalRows = (await countRows(filePath)) || 0;
  const stream = createReadStream(filePath);
  const writer = createWriteStream(outputPath, { flags: 'w' });

  stream.on('error', (err) => {
    console.error(`Failed to read ${filePath}:`, err);
    process.exit(1);
  });

  const rl = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let lineIndex = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    const columns = line.split(',');

    // Skip header if present.
    const isHeader =
      lineIndex === 0 && columns[1]?.toLowerCase().includes('userid');
    if (isHeader) {
      // Ensure the wallet column header is present.
      columns[10] = 'WALLET / EVM ADDRESS';
      writer.write(`${columns.join(',')}\n`);
      lineIndex += 1;
      continue;
    }

    const accountId = columns[1]?.trim();
    const currentIndex = lineIndex + 1;
    console.log(
      `Processing account ${accountId || 'N/A'} (row ${currentIndex} of ${totalRows})`,
    );
    const wallet = accountId ? await fetchWallet(accountId) : '';
    columns[10] = wallet ?? '';
    writer.write(`${columns.join(',')}\n`);

    lineIndex += 1;
  }

  writer.end();
  console.log(`Finished. Wrote ${lineIndex} rows to ${outputPath}`);
}

void main();

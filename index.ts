import { generateText } from 'ai';

async function main() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error(
      'Missing AI_GATEWAY_API_KEY. Add it to .env.local locally; never commit the file.',
    );
  }

  const { text } = await generateText({
    model: 'moonshotai/kimi-k3',
    prompt:
      'Invent a new holiday. Give it a memorable name and describe its origin, traditions, food, and one way people celebrate it together.',
  });

  console.log(text);
}

main().catch((error: unknown) => {
  // Print only the error message; never print environment variables or request headers.
  console.error(
    error instanceof Error ? error.message : 'AI Gateway request failed.',
  );
  process.exitCode = 1;
});

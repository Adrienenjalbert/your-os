export interface NotifyMessage {
  title: string;
  body: string;
  link?: string;
}

export interface Notifier {
  notify(message: NotifyMessage): Promise<void>;
}

export const consoleNotifier: Notifier = {
  async notify(message) {
    console.log(`[notify] ${message.title}\n${message.body}`);
  },
};

export interface SlackNotifierOptions {
  webhookUrl: string;
  /** Override fetch (tests). */
  fetch?: typeof globalThis.fetch;
}

export function slackNotifier(opts: SlackNotifierOptions): Notifier {
  const fetcher = opts.fetch ?? globalThis.fetch.bind(globalThis);
  return {
    async notify(message) {
      const text = `*${message.title}*\n${message.body}${message.link ? `\n<${message.link}>` : ""}`;
      const res = await fetcher(opts.webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        throw new Error(`slackNotifier: ${res.status} ${res.statusText}`);
      }
    },
  };
}

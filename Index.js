
const {
  Client,
  GatewayIntentBits,
  Events,
  Partials
} = require("discord.js");

const { handleInteraction } = require("./interactions.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

const messages = new Map();
const warnedUsers = new Set();

const MAX_MESSAGES = 5;
const WINDOW_MS = 5000;

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🛡️ ${readyClient.user.tag} est en ligne !`);
});

// Protection anti-spam
client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;

  const key = `${message.guild.id}-${message.author.id}`;
  const now = Date.now();

  let userMessages = messages.get(key) || [];
  userMessages = userMessages.filter(
    timestamp => now - timestamp < WINDOW_MS
  );

  userMessages.push(now);
  messages.set(key, userMessages);

  if (userMessages.length > MAX_MESSAGES) {
    try {
      await message.delete();

      if (!warnedUsers.has(key)) {
        warnedUsers.add(key);

        const warning = await message.channel.send(
          `⚠️ ${message.author}, ralentis ! Mira Defense détecte du spam.`
        );

        setTimeout(() => warning.delete().catch(() => {}), 5000);
        setTimeout(() => warnedUsers.delete(key), 10000);
      }
    } catch (error) {
      console.error("Erreur anti-spam :", error.message);
    }
  }
});

// Commandes slash
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleInteraction(interaction);
  } catch (error) {
    console.error("Erreur de commande :", error);

    if (
      interaction.isChatInputCommand() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content: "Une erreur est survenue.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.log("Token absent : il sera configuré lors de l'hébergement.");
} else {
  client.login(token).catch(error => {
    console.error("Connexion impossible :", error.message);
  });
}
